<<<<<<< Updated upstream
from pydantic import BaseModel
from typing import List, Optional

class Player(BaseModel):
    id: str
    name: str
    team: str
    role: str
    battingStyle: Optional[str] = None
    bowlingStyle: Optional[str] = None

class InningsData(BaseModel):
    matchId: str
    date: str
    opposition: str
    venue: str
    format: str
    runs: Optional[int] = None
    balls: Optional[int] = None
    wickets: Optional[int] = None
    overs: Optional[float] = None
    economy: Optional[float] = None
    strikeRate: Optional[float] = None
    impactScore: float
    performanceContribution: float
    contextContribution: float
    pressureContribution: float

class AnalyzeImpactRequest(BaseModel):
    playerId: str
    playerName: Optional[str] = None
    inningsWindow: int = 10
    format: str = "all" # all, t20, odi, test
    tournament: Optional[str] = None
    dateRange: Optional[str] = None
    opposition: Optional[str] = None
    venue: Optional[str] = None
    weightingType: str = "exponential" # equal, exponential

class ExplainabilityDrivers(BaseModel):
    positiveDrivers: List[str]
    negativeDrivers: List[str]

class AnalyzeImpactResponse(BaseModel):
    player: Player
    rollingImpactScore: float
    inningsData: List[InningsData]
    performanceContribution: float
    contextContribution: float
    pressureContribution: float
    explainability: ExplainabilityDrivers
    confidenceScore: float
    warnings: List[str]
    metadata: dict
=======
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
>>>>>>> Stashed changes
