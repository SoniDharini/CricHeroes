from typing import List, Optional

from pydantic import BaseModel


class PlayerSummary(BaseModel):
    player_id: str
    player_name: str
    team: str
    role: str


class InningsImpactPoint(BaseModel):
    match_id: str
    date: str
    opposition: str
    format: str
    runs: int
    balls: int
    wickets: int
    economy: float
    strike_rate: float
    batting_impact: float
    bowling_impact: float
    context_multiplier: float
    situation_multiplier: float
    innings_impact: float


class PlayerImpactResponse(BaseModel):
    player_id: str
    player_name: str
    team: str
    role: str
    impact_metric: float
    rolling_impact: float
    last_updated: Optional[str] = None
    last_10_innings: List[InningsImpactPoint]
    trend: str
    explanation: str
