from fastapi import APIRouter, HTTPException
from app.schemas.live_impact import LiveImpactRequest, LiveImpactResponse
from app.services.live_impact_service import recommend_players

router = APIRouter()

@router.post("/live-impact", response_model=LiveImpactResponse)
def get_live_impact(req: LiveImpactRequest):
    result = recommend_players(req.dict())
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
