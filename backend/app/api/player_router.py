<<<<<<< Updated upstream
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
=======
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.db_models import DBImpactScore, DBInnings, DBPlayer
from app.schemas.pydantic_models import InningsImpactPoint, PlayerImpactResponse, PlayerSummary
from app.services.impact_engine import generate_explanation

router = APIRouter()


@router.get("/players", response_model=List[PlayerSummary])
def get_players(
    q: str | None = Query(default=None),
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(DBPlayer)
    if q:
        query = query.filter(DBPlayer.player_name.ilike(f"%{q.strip()}%"))
    players = query.order_by(DBPlayer.player_name.asc()).limit(limit).all()
    return [
        PlayerSummary(
            player_id=player.player_id,
            player_name=player.player_name,
            team=player.team,
            role=player.role,
        )
        for player in players
    ]


@router.get("/players/search", response_model=List[PlayerSummary])
def search_players_alias(
    q: str,
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return get_players(q=q, limit=limit, db=db)


@router.get("/player/{player_id}/impact", response_model=PlayerImpactResponse)
def get_player_impact(player_id: str, db: Session = Depends(get_db)):
    player = db.query(DBPlayer).filter(DBPlayer.player_id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    score_row = db.query(DBImpactScore).filter(DBImpactScore.player_id == player_id).first()
    innings = (
        db.query(DBInnings)
        .filter(DBInnings.player_id == player_id)
        .order_by(DBInnings.date.desc(), DBInnings.id.desc())
        .limit(10)
        .all()
    )
    innings = list(reversed(innings))

    if not innings:
        raise HTTPException(status_code=404, detail="No innings found for player")

    explanation = score_row.explanation if score_row and score_row.explanation else generate_explanation(
        player.player_name,
        innings,
        score_row.impact_metric if score_row else 50.0,
        score_row.trend if score_row else "stable",
    )

    return PlayerImpactResponse(
        player_id=player.player_id,
        player_name=player.player_name,
        team=player.team,
        role=player.role,
        impact_metric=round(score_row.impact_metric if score_row else 50.0, 2),
        rolling_impact=round(score_row.rolling_impact if score_row else 0.0, 4),
        last_updated=score_row.last_updated.isoformat() if score_row and score_row.last_updated else None,
        trend=score_row.trend if score_row else "stable",
        explanation=explanation,
        last_10_innings=[
            InningsImpactPoint(
                match_id=inning.match_id,
                date=inning.date,
                opposition=inning.opposition,
                format=inning.format,
                runs=inning.runs,
                balls=inning.balls,
                wickets=inning.wickets,
                economy=round(inning.economy, 2),
                strike_rate=round(inning.strike_rate, 2),
                batting_impact=round(inning.batting_impact, 2),
                bowling_impact=round(inning.bowling_impact, 2),
                context_multiplier=round(inning.context_multiplier, 3),
                situation_multiplier=round(inning.situation_multiplier, 3),
                innings_impact=round(inning.innings_impact, 2),
            )
            for inning in innings
        ],
    )
>>>>>>> Stashed changes
