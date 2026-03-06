import math
from typing import List, Dict

from app.models.db_models import DBInnings, DBPlayer
from app.ml.hybrid_model import calibrator

def _base_ips(inning: DBInnings, player_role: str) -> float:
    # Innings Performance Score (BAT + BOWL + FIELD normalized -> 50)
    # This is a simplistic approximation
    ips = 50.0 
    
    if player_role in ['Batsman', 'All-rounder', 'Wicket-keeper']:
        # runs / 30 -> rough par, strike rate bonus/penalty
        runs_impact = inning.runs * 0.8  # Assume 1 run ~ 0.8 impact points roughly
        sr_diff = inning.strikeRate - 120.0
        sr_bonus = (sr_diff * 0.1) if inning.balls > 10 else 0
        ips += runs_impact + sr_bonus
        
    if player_role in ['Bowler', 'All-rounder']:
        wickets_impact = inning.wickets * 15.0 # 15 points per wicket
        econ_diff = 8.0 - inning.economy
        econ_bonus = (econ_diff * 3.0) if inning.overs >= 2.0 else 0
        ips += wickets_impact + econ_bonus
        
    return max(0.0, min(100.0, ips))

def _base_cm(inning: DBInnings) -> float:
    # Context Multiplier: format, opp str, pitch, chase
    cm = 1.0
    cm *= inning.oppositionStrength # Assume 1.0 is avg
    cm /= max(0.5, inning.pitchDifficulty) # Higher difficulty, higher impact req? Or invert?
    
    if inning.isChase:
        cm *= 1.05
    # Bounds applied in calibrator
    return cm

def _base_pm(inning: DBInnings) -> float:
    # Pressure Multiplier: req RR, wkts in hand, match importance
    pm = 1.0
    if inning.isChase and inning.requiredRR:
        if inning.requiredRR > 10.0:
            pm += 0.1
        elif inning.requiredRR > 12.0:
            pm += 0.2
    
    if inning.wicketsInHand and inning.wicketsInHand < 4:
        pm += 0.1
        
    pm *= inning.matchImportance
    
    return pm

def generate_explainability(ips: float, cm: float, pm: float, inning: DBInnings) -> Dict[str, List[str]]:
    positives = []
    negatives = []
    
    if ips > 60:
        positives.append("Excellent raw output across key metrics")
    elif ips < 40:
        negatives.append("Below average base performance metrics")
        
    if cm > 1.1:
        positives.append("Delivered against difficult opposition/context")
        
    if pm > 1.1:
        positives.append("Stood up under significant pressure")
    elif pm < 0.9:
        negatives.append("Faced minimal match pressure")
        
    if inning.isChase:
        if ips > 50 and inning.requiredRR and inning.requiredRR > 10:
            positives.append("Critical contribution in a demanding chase")
            
    return {
        "positiveDrivers": list(set(positives))[:3],
        "negativeDrivers": list(set(negatives))[:3]
    }

def calculate_innings_impact(inning: DBInnings, player_role: str) -> dict:
    raw_ips = _base_ips(inning, player_role)
    raw_cm = _base_cm(inning)
    raw_pm = _base_pm(inning)
    
    features = {
        "base_ips": raw_ips,
        "base_cm": raw_cm,
        "base_pm": raw_pm,
        "format": inning.format,
        "runs": inning.runs,
        "strikeRate": inning.strikeRate,
        "wickets": inning.wickets,
        "economy": inning.economy
    }
    
    calibrated = calibrator.calibrate_components(features)
    impact_score = calibrated["calibrated_impact"]
    
    # Calculate breakdown
    # Approximating from prompt requirement to map to front-end
    total = raw_ips + (raw_cm * 20.0) + (raw_pm * 20.0)
    perf_contrib = (raw_ips / total) * 100 if total > 0 else 33
    context_contrib = ((raw_cm * 20.0) / total) * 100 if total > 0 else 33
    pressure_contrib = ((raw_pm * 20.0) / total) * 100 if total > 0 else 33
    
    expl = generate_explainability(raw_ips, raw_cm, raw_pm, inning)
    
    return {
        "score": impact_score,
        "perf_contrib": perf_contrib,
        "context_contrib": context_contrib,
        "pressure_contrib": pressure_contrib,
        "expl": expl,
        "calibrated": calibrated
    }

def aggregate_rolling_impact(innings_results: List[dict], weighting_type: str = "exponential") -> float:
    if not innings_results:
        return 50.0
        
    weighted_sum = 0
    total_weight = 0
    
    for i, res in enumerate(innings_results):
        if weighting_type == "exponential":
            weight = math.exp(i * 0.2)
        else:
            weight = 1.0 # equal
            
        weighted_sum += res["score"] * weight
        total_weight += weight
        
    return weighted_sum / total_weight if total_weight > 0 else 50.0
