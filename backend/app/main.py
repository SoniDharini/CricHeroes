from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import player_router

app = FastAPI(title="Player Impact Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For React frontend local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(player_router.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}
