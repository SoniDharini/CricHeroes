"""
Step 3: Refine the parsed innings data into cleaner modeling features.

Pressure index seed
-------------------
This stage computes a context-only pressure seed before performance is applied:

pressure_index =
    0.45 * required_run_rate_pressure
  + 0.35 * wickets_lost_pressure
  + 0.20 * match_phase_pressure

The later impact step combines this with batting and bowling output through:

InningsImpactRaw =
    PerformanceScore * ContextMultiplier * SituationMultiplier
"""

from __future__ import annotations

import pandas as pd

from pipeline_common import INNINGS_CSV, PLAYERS_CSV, write_outputs

PHASE_PRESSURE = {
    "Powerplay": 0.35,
    "Middle": 0.25,
    "Death": 0.55,
    "Early": 0.20,
    "Late": 0.45,
}
AVG_REQUIRED_RATE = {"T20": 8.0, "ODI": 5.5, "TEST": 3.0}


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def main() -> None:
    players_df = pd.read_csv(PLAYERS_CSV)
    innings_df = pd.read_csv(INNINGS_CSV)

    innings_df["format"] = innings_df["format"].astype(str).str.upper()
    innings_df["required_run_rate"] = pd.to_numeric(innings_df["required_run_rate"], errors="coerce")
    innings_df["batting_position"] = pd.to_numeric(innings_df["batting_position"], errors="coerce")
    innings_df["match_importance"] = pd.to_numeric(innings_df["match_importance"], errors="coerce").fillna(1.0)
    innings_df["opposition_strength"] = pd.to_numeric(innings_df["opposition_strength"], errors="coerce").fillna(1.0)

    innings_df["required_run_rate_pressure"] = innings_df.apply(
        lambda row: clamp(
            ((row["required_run_rate"] or 0.0) - AVG_REQUIRED_RATE.get(row["format"], 6.0))
            / max(AVG_REQUIRED_RATE.get(row["format"], 6.0), 1.0),
            0.0,
            1.0,
        )
        if pd.notna(row["required_run_rate"])
        else 0.0,
        axis=1,
    )
    innings_df["wickets_lost_pressure"] = (
        pd.to_numeric(innings_df["wickets_fallen_when_batting"], errors="coerce").fillna(0.0) / 10.0
    ).clip(0.0, 1.0)
    innings_df["match_phase_pressure"] = innings_df["match_phase"].map(PHASE_PRESSURE).fillna(0.25)
    innings_df["pressure_index"] = (
        (0.45 * innings_df["required_run_rate_pressure"])
        + (0.35 * innings_df["wickets_lost_pressure"])
        + (0.20 * innings_df["match_phase_pressure"])
    ).round(4)

    innings_df.drop(
        columns=["required_run_rate_pressure", "wickets_lost_pressure", "match_phase_pressure"],
        inplace=True,
    )
    write_outputs(players_df, innings_df)
    print(f"Feature-engineered {len(innings_df)} innings rows.")


if __name__ == "__main__":
    main()
