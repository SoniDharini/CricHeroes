from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.db import get_db
from app.models.db_models import DBPlayer, DBInnings
from app.schemas.pydantic_models import Player, AnalyzeImpactRequest, AnalyzeImpactResponse, InningsData, ExplainabilityDrivers
from app.services.impact_engine import calculate_innings_impact, aggregate_rolling_impact

router = APIRouter()

@router.get("/players/search", response_model=List[Player])
def search_players(q: str, format: str = "all", db: Session = Depends(get_db)):
    terms = q.strip().split()
    search_term = terms[-1] if terms else q
    players = db.query(DBPlayer).filter(DBPlayer.name.ilike(f"%{search_term}%")).limit(20).all()
    # To improve accuracy, if they typed first name we could try to rank them, but this is good enough for MVP
    return [
        Player(
            id=p.id, name=p.name, team=p.team, role=p.role,
            battingStyle=p.battingStyle, bowlingStyle=p.bowlingStyle
        ) for p in players
    ]

@router.post("/player-impact/analyze", response_model=AnalyzeImpactResponse)
def analyze_player_impact(req: AnalyzeImpactRequest, db: Session = Depends(get_db)):
    player = db.query(DBPlayer).filter(DBPlayer.id == req.playerId).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    query = db.query(DBInnings).filter(DBInnings.playerId == req.playerId)
    if req.format and req.format.lower() != "all":
        query = query.filter(DBInnings.format.ilike(req.format))
    if req.tournament:
        query = query.filter(DBInnings.tournament.ilike(req.tournament))
        
    # Get last N innings ordered by id DESC
    innings = query.order_by(DBInnings.id.desc()).limit(req.inningsWindow).all()
    innings.reverse() # chronologically
    
    if not innings:
        # Fallback empty response
        return AnalyzeImpactResponse(
            player=Player(id=player.id, name=player.name, team=player.team, role=player.role),
            rollingImpactScore=50.0, inningsData=[],
            performanceContribution=0.0, contextContribution=0.0, pressureContribution=0.0,
            explainability=ExplainabilityDrivers(positiveDrivers=[], negativeDrivers=["Insufficient data"]),
            confidenceScore=0.0, warnings=["No innings found"], metadata={}
        )

    # Process each innings
    results = []
    innings_data = []
    
    for i in innings:
        res = calculate_innings_impact(i, player.role)
        results.append(res)
        
        idata = InningsData(
            matchId=i.matchId, date=i.date, opposition=i.opposition, venue=i.venue, format=i.format,
            runs=i.runs, balls=i.balls, wickets=i.wickets, overs=i.overs, economy=i.economy, strikeRate=i.strikeRate,
            impactScore=res["score"], performanceContribution=res["perf_contrib"], 
            contextContribution=res["context_contrib"], pressureContribution=res["pressure_contrib"]
        )
        innings_data.append(idata)
        
    # Aggregate
    rolling = aggregate_rolling_impact(results, req.weightingType)
    last_res = results[-1] # take latest for breakdown
    
    # Confidence heuristics
    confidence = 100.0 if len(innings) == req.inningsWindow else (len(innings) / max(req.inningsWindow, 1)) * 100
    warnings = []
    if confidence < 75.0:
        warnings.append("Low sample size for analysis")
    if not any(r["calibrated"].get("is_ml_calibrated", False) for r in results):
        warnings.append("Using rule-based impact engine. ML calibrator unavailable.")
        
    return AnalyzeImpactResponse(
        player=Player(id=player.id, name=player.name, team=player.team, role=player.role, battingStyle=player.battingStyle, bowlingStyle=player.bowlingStyle),
        rollingImpactScore=rolling,
        inningsData=innings_data,
        performanceContribution=last_res["perf_contrib"],
        contextContribution=last_res["context_contrib"],
        pressureContribution=last_res["pressure_contrib"],
        explainability=ExplainabilityDrivers(positiveDrivers=last_res["expl"]["positiveDrivers"], negativeDrivers=last_res["expl"]["negativeDrivers"]),
        confidenceScore=confidence,
        warnings=warnings,
        metadata={"sample_size": len(innings), "filters": req.dict()}
    )

@router.get("/player-impact/history/{playerId}")
def player_history(playerId: str, db: Session = Depends(get_db)):
    # Same internal logic to return chart
    req = AnalyzeImpactRequest(playerId=playerId, format="all", inningsWindow=20)
    return analyze_player_impact(req, db).inningsData
