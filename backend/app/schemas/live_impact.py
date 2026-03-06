from typing import List, Optional
from pydantic import BaseModel

class LiveImpactRequest(BaseModel):
    match_type: str
    pitch_type: str
    phase: str
    situation: str
    score: str
    target: Optional[str] = None
    players: List[str]

class PlayerOption(BaseModel):
    player_id: str
    player_name: str
    role: str
    live_impact_score: float
    confidence_score: float
    reason: str

class LiveImpactResponse(BaseModel):
    recommended_batsman: Optional[PlayerOption] = None
    recommended_bowler: Optional[PlayerOption] = None
    tactical_insight: str
    player_options: List[PlayerOption]
