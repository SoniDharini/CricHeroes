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
