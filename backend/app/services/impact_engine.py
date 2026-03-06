<<<<<<< Updated upstream
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
=======
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Iterable, List, Sequence

from app.models.db_models import DBInnings

AVG_STRIKE_RATE = {"T20": 130.0, "ODI": 90.0, "Test": 55.0}
AVG_ECONOMY = {"T20": 7.8, "ODI": 5.4, "Test": 3.2}
AVG_REQUIRED_RATE = {"T20": 8.0, "ODI": 5.5, "Test": 3.0}
PHASE_PRESSURE = {
    "Powerplay": 0.08,
    "Middle": 0.05,
    "Death": 0.14,
    "Early": 0.05,
    "Late": 0.10,
}
TAILENDER_WEIGHTS = {8: 0.85, 9: 0.70, 10: 0.55, 11: 0.45}


@dataclass
class ImpactComponents:
    batting_impact: float
    bowling_impact: float
    performance_score: float
    context_multiplier: float
    situation_multiplier: float
    pressure_index: float
    raw_impact: float


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def safe_float(value: float | None, default: float = 0.0) -> float:
    if value is None:
        return default
    return float(value)


def recency_weights(size: int) -> List[float]:
    if size <= 0:
        return []
    start = max(1, 11 - size)
    return [round(weight / 10.0, 2) for weight in range(start, 11)]


def rolling_weighted_average(values: Sequence[float]) -> float:
    if not values:
        return 0.0
    weights = recency_weights(len(values))
    weighted_sum = sum(value * weight for value, weight in zip(values, weights))
    return weighted_sum / sum(weights)


def normalize_with_neutral(values: Iterable[float], neutral_value: float = 0.0) -> List[float]:
    values = list(values)
    if not values:
        return []

    negatives = [value for value in values if value < neutral_value]
    positives = [value for value in values if value > neutral_value]
    min_negative = min(negatives) if negatives else neutral_value - 1.0
    max_positive = max(positives) if positives else neutral_value + 1.0

    normalized = []
    for value in values:
        if value >= neutral_value:
            score = 50.0 + 50.0 * (value - neutral_value) / max(max_positive - neutral_value, 1e-6)
        else:
            score = 50.0 - 50.0 * (neutral_value - value) / max(neutral_value - min_negative, 1e-6)
        normalized.append(round(clamp(score, 0.0, 100.0), 2))
    return normalized


def sample_size_adjustment(score: float, sample_size: int, target_window: int = 10) -> float:
    confidence = clamp(sample_size / max(target_window, 1), 0.25, 1.0)
    return round(50.0 + (score - 50.0) * confidence, 2)


def _batting_impact(inning: DBInnings) -> float:
    if inning.balls <= 0:
        return 0.0

    avg_sr = AVG_STRIKE_RATE.get(inning.format, 100.0)
    strike_rate_factor = clamp(safe_float(inning.strike_rate, avg_sr) / avg_sr, 0.70, 1.40)
    boundary_factor = 0.85 + clamp(safe_float(inning.boundary_percentage), 0.0, 0.60)
    usage_factor = clamp(0.65 + inning.balls / 30.0, 0.65, 1.15)
    collapse_bonus = 1.0 + clamp((inning.wickets_fallen_when_batting - 2) / 10.0, 0.0, 0.30)
    not_out_guard = 1.0
    if inning.is_not_out:
        # Not-outs are helpful, but unfinished innings should not auto-inflate impact.
        not_out_guard = clamp(0.75 + inning.balls / 25.0, 0.75, 1.0)
    position_weight = TAILENDER_WEIGHTS.get(inning.batting_position, 1.0)

    return round(
        inning.runs * strike_rate_factor * boundary_factor * usage_factor * collapse_bonus * position_weight * not_out_guard,
        4,
    )


def _bowling_impact(inning: DBInnings) -> float:
    overs_value = safe_float(inning.overs)
    legal_balls = 0
    if overs_value > 0:
        whole_overs = int(overs_value)
        partial = round((overs_value - whole_overs) * 10)
        legal_balls = whole_overs * 6 + int(partial)
    if legal_balls <= 0:
        return 0.0

    avg_econ = AVG_ECONOMY.get(inning.format, 6.0)
    economy_bonus = max(0.0, avg_econ - inning.economy) * overs_value * 1.8
    economy_penalty = max(0.0, inning.economy - avg_econ) * overs_value * 2.5
    dot_ball_bonus = clamp(inning.dot_ball_percentage, 0.0, 1.0) * 18.0
    phase_bonus = PHASE_PRESSURE.get(inning.match_phase, 0.05) * inning.wickets * 8.0

    return round(
        (inning.wickets * 22.0) + dot_ball_bonus + economy_bonus + phase_bonus - economy_penalty,
        4,
    )


def compute_impact_components(inning: DBInnings, recent_raw_impacts: Sequence[float] | None = None) -> ImpactComponents:
    recent_raw_impacts = recent_raw_impacts or []
    batting_impact = _batting_impact(inning)
    bowling_impact = _bowling_impact(inning)

    batting_baseline = 12.0 if inning.balls > 0 else 0.0
    bowling_baseline = 10.0 if inning.overs > 0 else 0.0
    performance_score = batting_impact + bowling_impact - batting_baseline - bowling_baseline

    avg_rr = AVG_REQUIRED_RATE.get(inning.format, 6.0)
    rr_pressure = 0.0
    required_run_rate = safe_float(getattr(inning, "required_run_rate", None), 0.0)
    if inning.is_chase and math.isfinite(required_run_rate) and required_run_rate > 0:
        rr_pressure = clamp((required_run_rate - avg_rr) / max(avg_rr, 1.0), 0.0, 0.35)
    wickets_pressure = clamp(inning.wickets_fallen_when_batting / 10.0, 0.0, 0.25)
    phase_pressure = PHASE_PRESSURE.get(inning.match_phase, 0.05)
    opposition_pressure = clamp(inning.opposition_strength - 1.0, -0.10, 0.20)
    pressure_index = clamp(rr_pressure + wickets_pressure + phase_pressure + max(opposition_pressure, 0.0), 0.0, 1.0)

    context_multiplier = clamp(1.0 + rr_pressure + wickets_pressure + phase_pressure + opposition_pressure, 0.75, 1.75)

    recent_mean = sum(recent_raw_impacts[-3:]) / len(recent_raw_impacts[-3:]) if recent_raw_impacts[-3:] else 0.0
    form_recovery_bonus = 0.10 if recent_mean < 0 and performance_score > 0 else 0.0
    match_result_bonus = 0.08 if inning.won_match else -0.04 if inning.result and inning.result.lower() == "loss" else 0.0
    importance_bonus = clamp(inning.match_importance - 1.0, 0.0, 0.25)

    situation_multiplier = clamp(1.0 + form_recovery_bonus + match_result_bonus + importance_bonus, 0.80, 1.40)
    raw_impact = performance_score * context_multiplier * situation_multiplier

    return ImpactComponents(
        batting_impact=round(batting_impact, 4),
        bowling_impact=round(bowling_impact, 4),
        performance_score=round(performance_score, 4),
        context_multiplier=round(context_multiplier, 4),
        situation_multiplier=round(situation_multiplier, 4),
        pressure_index=round(pressure_index, 4),
        raw_impact=round(raw_impact, 4),
    )


def generate_explanation(player_name: str, innings: Sequence[DBInnings], impact_metric: float, trend: str) -> str:
    if not innings:
        return f"{player_name} has insufficient recent innings data, so the impact metric is anchored close to the neutral baseline of 50."

    sample = innings[-10:]
    avg_batting = sum(inning.batting_impact for inning in sample) / len(sample)
    avg_bowling = sum(inning.bowling_impact for inning in sample) / len(sample)
    avg_pressure = sum(inning.pressure_index for inning in sample) / len(sample)

    strengths: List[str] = []
    if avg_batting >= avg_bowling and avg_batting > 18:
        strengths.append("strong batting output")
    if avg_bowling > avg_batting and avg_bowling > 15:
        strengths.append("multiple bowling breakthroughs")
    if avg_pressure > 0.35:
        strengths.append("consistent production in high-pressure situations")
    if not strengths:
        strengths.append("balanced contributions without a single dominant skill")

    trend_phrase = {
        "upward": "Recent innings have lifted the rolling trend.",
        "downward": "Recent innings have dragged the rolling trend down.",
        "stable": "Recent innings have kept the rolling trend stable.",
    }.get(trend, "Recent innings have kept the rolling trend stable.")

    return (
        f"Impact Score: {impact_metric:.1f}. "
        f"{player_name} shows {', '.join(strengths)}. "
        f"{trend_phrase}"
    )
>>>>>>> Stashed changes
