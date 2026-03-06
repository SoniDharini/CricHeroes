"""
Step 5: Compute rolling impact, normalize to the final 0-100 Impact Metric,
and persist everything into SQLite.

Rolling window
--------------
Only the last 10 innings are used. Recent innings receive higher weights:

oldest -> newest = [0.1, 0.2, ..., 1.0]

RollingImpact =
    sum(InningsImpactRaw_i * RecencyWeight_i) / sum(RecencyWeight_i)

Final normalization
-------------------
The final player Impact Metric uses a neutral-baseline min-max normalization:
- 50 is neutral
- positive rolling impact is scaled into 50-100
- negative rolling impact is scaled into 0-50

Players with fewer than 10 innings are shrunk back toward 50 so tiny samples
cannot dominate the leaderboard.
"""

from __future__ import annotations

import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.db import DB_PATH, SessionLocal, reset_db
from app.models.db_models import DBImpactScore, DBInnings, DBPlayer
from app.services.impact_engine import (
    generate_explanation,
    normalize_with_neutral,
    rolling_weighted_average,
    sample_size_adjustment,
)
from pipeline_common import INNINGS_CSV, PLAYERS_CSV


def infer_trend(raw_values: list[float]) -> str:
    if len(raw_values) < 4:
        return "stable"
    recent = sum(raw_values[-3:]) / len(raw_values[-3:])
    earlier = sum(raw_values[-6:-3]) / len(raw_values[-6:-3]) if len(raw_values) >= 6 else sum(raw_values[:-3]) / len(raw_values[:-3])
    if recent - earlier > 3:
        return "upward"
    if recent - earlier < -3:
        return "downward"
    return "stable"


def persist(players_df: pd.DataFrame, innings_df: pd.DataFrame, score_rows: list[dict]) -> None:
    if DB_PATH.exists():
        backup_path = DB_PATH.with_suffix(".db.bak")
        shutil.copy2(DB_PATH, backup_path)

    reset_db()
    db = SessionLocal()
    try:
        player_columns = {column.name for column in DBPlayer.__table__.columns}
        innings_columns = {column.name for column in DBInnings.__table__.columns}
        score_columns = {column.name for column in DBImpactScore.__table__.columns}

        player_rows = [{key: value for key, value in row.items() if key in player_columns} for row in players_df.to_dict("records")]
        db.bulk_insert_mappings(DBPlayer, player_rows)
        db.commit()

        innings_rows = [{key: value for key, value in row.items() if key in innings_columns} for row in innings_df.to_dict("records")]
        chunk_size = 20000
        for start in range(0, len(innings_rows), chunk_size):
            db.bulk_insert_mappings(DBInnings, innings_rows[start:start + chunk_size])
            db.commit()

        score_payload = [{key: value for key, value in row.items() if key in score_columns} for row in score_rows]
        db.bulk_insert_mappings(DBImpactScore, score_payload)
        db.commit()
    finally:
        db.close()


def main() -> None:
    players_df = pd.read_csv(PLAYERS_CSV, dtype={"player_id": "string"}, low_memory=False)
    innings_df = pd.read_csv(
        INNINGS_CSV,
        dtype={"match_id": "string", "player_id": "string", "player_name": "string"},
        low_memory=False,
    )
    for column in ["match_id", "player_id", "date", "team", "opposition", "format"]:
        innings_df[column] = innings_df[column].astype("string").str.strip()
    innings_df.replace({"": pd.NA, "nan": pd.NA, "None": pd.NA}, inplace=True)
    innings_df = innings_df.dropna(subset=["match_id", "player_id", "date", "team", "opposition", "format"])
    innings_df = innings_df.sort_values(["player_id", "date", "match_id", "innings_number"]).reset_index(drop=True)

    player_score_rows: list[dict] = []
    rolling_raw_values: list[float] = []

    player_groups = {player_id: group.copy() for player_id, group in innings_df.groupby("player_id", sort=False)}
    for player_id, group in player_groups.items():
        last_ten = group.tail(10)
        raw_values = last_ten["innings_impact_raw"].tolist()
        rolling_raw = rolling_weighted_average(raw_values)
        rolling_raw_values.append(rolling_raw)
        player_score_rows.append(
            {
                "player_id": player_id,
                "rolling_impact": round(rolling_raw, 4),
                "impact_metric": 50.0,
                "sample_size": int(len(last_ten)),
                "trend": infer_trend(raw_values),
                "explanation": "",
                "last_updated": datetime.now(timezone.utc),
            }
        )

    normalized_scores = normalize_with_neutral(rolling_raw_values)
    for row, normalized in zip(player_score_rows, normalized_scores):
        row["impact_metric"] = sample_size_adjustment(normalized, row["sample_size"])

    score_map = {row["player_id"]: row for row in player_score_rows}
    player_map = players_df.set_index("player_id").to_dict("index")
    for player_id, group in player_groups.items():
        innings_objects = [SimpleNamespace(**row) for row in group.tail(10).to_dict("records")]
        score_map[player_id]["explanation"] = generate_explanation(
            player_name=player_map[player_id]["player_name"],
            innings=innings_objects,
            impact_metric=score_map[player_id]["impact_metric"],
            trend=score_map[player_id]["trend"],
        )

    persist(players_df, innings_df, player_score_rows)
    print(f"Persisted {len(players_df)} players, {len(innings_df)} innings, and {len(player_score_rows)} impact rows.")


if __name__ == "__main__":
    main()
