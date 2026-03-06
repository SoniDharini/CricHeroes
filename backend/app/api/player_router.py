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
