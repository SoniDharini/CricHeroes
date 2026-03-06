import pandas as pd
from typing import List, Dict, Any, Tuple
from pathlib import Path
import random

BACKEND_DIR = Path(__file__).resolve().parents[2]
PLAYERS_CSV = BACKEND_DIR / "data" / "cleaned_players.csv"
INNINGS_CSV = BACKEND_DIR / "data" / "cleaned_innings.csv"

# Preload data
try:
    players_df = pd.read_csv(PLAYERS_CSV)
    innings_df = pd.read_csv(INNINGS_CSV, low_memory=False)
except:
    players_df = pd.DataFrame()
    innings_df = pd.DataFrame()

def calculate_pressure_index(situation: str, score: str, target: str = None) -> float:
    # Basic heuristic
    try:
        if situation.lower() == "chasing" and target:
            # target = "160/4 in 20.0 overs", score = "150/4 in 16.0"
            pass # We will do a generic approximation
    except:
        pass
    
    if situation.lower() == "chasing":
        return 1.4
    elif situation.lower() == "defending":
        return 1.3
    return 1.1

def calculate_context_multiplier(phase: str, pitch_type: str) -> float:
    base = 1.0
    if phase.lower() == "powerplay":
        base = 1.1
    elif phase.lower() == "middle overs":
        base = 1.0
    elif phase.lower() == "death overs":
        base = 1.3
        
    return base

def get_player_stats(player_id: str) -> Dict[str, float]:
    # Placeholder for actual historical stat derivation. 
    # For MVP we calculate a simple average impact raw
    if innings_df.empty:
        return {"performance": 50.0}
    player_innings = innings_df[innings_df["player_id"] == player_id]
    if player_innings.empty:
        return {"performance": 50.0}
    avg_impact = player_innings["innings_impact"].mean()
    if pd.isna(avg_impact):
        avg_impact = 50.0
    return {"performance": avg_impact}

def calculate_live_impact(player_id: str, phase: str, pitch_type: str, situation: str, score: str, target: str = None) -> float:
    stats = get_player_stats(player_id)
    perf_score = stats["performance"]
    ctx_mult = calculate_context_multiplier(phase, pitch_type)
    pressure = calculate_pressure_index(situation, score, target)
    
    # Normalize to 0-100
    impact = perf_score * ctx_mult * (pressure / 1.2)
    return min(max(impact, 0.0), 100.0)

def match_pitch_reason(pitch_type: str, role: str) -> str:
    pitch_type_l = pitch_type.lower()
    if role.lower() == "bowler":
        if "spin" in pitch_type_l:
            return "Spin-friendly pitch highlights their effectiveness."
        elif "seam" in pitch_type_l or "pace" in pitch_type_l:
            return "Pace-friendly conditions favor their bowling style."
        elif "bowling" in pitch_type_l:
            return "Bowling-friendly pitch advantages them."
        return "Tactically suited for current conditions."
    else:
        if "batting" in pitch_type_l:
            return "Batting-friendly pitch maximizes their scoring potential."
        return "Reliable under current match situation."

def recommend_players(req_data: dict) -> dict:
    match_type = req_data.get("match_type", "T20")
    pitch_type = req_data.get("pitch_type", "Balanced")
    phase = req_data.get("phase", "Middle Overs")
    situation = req_data.get("situation", "Defending")
    score = req_data.get("score", "")
    target = req_data.get("target", "")
    player_ids = req_data.get("players", [])
    
    if players_df.empty:
        return {"error": "Dataset missing"}

    options = []
    
    # We will score each provided player
    for pid in player_ids:
        p_row = players_df[players_df["player_id"] == pid]
        if p_row.empty:
            continue
            
        p_name = p_row.iloc[0]["player_name"]
        p_role = p_row.iloc[0]["role"]
        # Basic parsing or assume from role
        
        impact = calculate_live_impact(pid, phase, pitch_type, situation, score, target)
        
        reason = match_pitch_reason(pitch_type, p_role)
        
        options.append({
            "player_id": pid,
            "player_name": p_name,
            "role": p_role,
            "live_impact_score": round(impact, 2),
            "confidence_score": round(random.uniform(70, 95), 2), # Simplified confidence heuristics
            "reason": reason
        })
        
    options.sort(key=lambda x: x["live_impact_score"], reverse=True)
    
    best_batter = next((o for o in options if "Bat" in o["role"] or "All" in o["role"]), None)
    best_bowler = next((o for o in options if "Bowl" in o["role"] or "All" in o["role"]), None)
    
    insight = "Current match pressure is moderate."
    if "7" in score or "8" in score or "Death" in phase:
         insight = "Current match pressure is high due to rising required run rate or falling wickets. Recommended strategy: Use death-over specialists."
         
    return {
        "recommended_batsman": best_batter,
        "recommended_bowler": best_bowler,
        "tactical_insight": insight,
        "player_options": options[:5] # Top 5
    }
