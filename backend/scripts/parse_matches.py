"""
Step 2: Parse Cricsheet match JSON into player and innings tables.

What this script extracts from each match:
- Batting features: runs, balls, strike rate, boundary percentage,
  dismissal type, batting position
- Bowling features: wickets, runs conceded, economy, dot-ball percentage
- Context features: wickets fallen when the player arrived, required run rate,
  match phase, opposition strength proxy, and match importance

The output is written to:
- `backend/data/cleaned_players.csv`
- `backend/data/cleaned_innings.csv`
"""

from pipeline_common import extract_archives, parse_matches, write_outputs


def main() -> None:
    if not extract_archives():
        raise RuntimeError("No extracted JSON files found after archive extraction.")

    players_df, innings_df = parse_matches()
    write_outputs(players_df, innings_df)
    print(f"Parsed {len(players_df)} players and {len(innings_df)} innings rows.")


if __name__ == "__main__":
    main()
