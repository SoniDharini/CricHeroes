"""
Step 4: Compute per-innings impact.

Mathematical formulation
------------------------
We model impact as:

PerformanceScore = BattingImpact + BowlingImpact - ParticipationBaseline
ContextMultiplier = 1 + RequiredRunRatePressure + WicketsLostPressure
                    + MatchPhasePressure + OppositionStrengthAdjustment
SituationMultiplier = 1 + MatchImportanceFactor + FormRecoveryBonus
                      + MatchResultBonus
InningsImpactRaw = PerformanceScore * ContextMultiplier * SituationMultiplier

We then normalize raw innings impact onto a 0-100 scale while preserving a
neutral baseline of 50. Positive and negative values are min-max scaled on
their own side of zero so routine low-impact innings remain below 50 and truly
match-winning innings rise toward 100.
"""

from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.impact_engine import compute_impact_components, normalize_with_neutral
from pipeline_common import INNINGS_CSV, PLAYERS_CSV, write_outputs


def main() -> None:
    players_df = pd.read_csv(PLAYERS_CSV)
    innings_df = pd.read_csv(INNINGS_CSV)
    innings_df = innings_df.sort_values(["player_id", "date", "match_id", "innings_number"]).reset_index(drop=True)

    computed_rows: list[dict] = []
    for _, player_group in innings_df.groupby("player_id", sort=False):
        recent_raw_impacts: list[float] = []
        for row in player_group.to_dict("records"):
            inning = SimpleNamespace(**row)
            components = compute_impact_components(inning, recent_raw_impacts=recent_raw_impacts)
            row["batting_impact"] = components.batting_impact
            row["bowling_impact"] = components.bowling_impact
            row["performance_score"] = components.performance_score
            row["context_multiplier"] = components.context_multiplier
            row["situation_multiplier"] = components.situation_multiplier
            row["pressure_index"] = components.pressure_index
            row["innings_impact_raw"] = components.raw_impact
            recent_raw_impacts.append(components.raw_impact)
            computed_rows.append(row)

    innings_df = pd.DataFrame(computed_rows)
    innings_df["innings_impact"] = normalize_with_neutral(innings_df["innings_impact_raw"].tolist())
    innings_df["innings_impact"] = innings_df["innings_impact"].round(2)

    write_outputs(players_df, innings_df)
    print(f"Calculated impact for {len(innings_df)} innings rows.")


if __name__ == "__main__":
    main()
