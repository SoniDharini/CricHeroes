from __future__ import annotations

import json
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
RAW_CRICSHEET_DIR = DATA_DIR / "raw" / "cricsheet"
EXTRACTED_DIR = DATA_DIR / "extracted"
PLAYERS_CSV = DATA_DIR / "cleaned_players.csv"
INNINGS_CSV = DATA_DIR / "cleaned_innings.csv"


def match_importance(info: dict[str, Any]) -> float:
    text = " ".join(
        str(value)
        for value in [
            info.get("event", {}).get("name", ""),
            info.get("event", {}).get("match_number", ""),
            info.get("stage", ""),
        ]
    ).lower()

    score = 1.0
    if "final" in text:
        score += 0.25
    elif any(token in text for token in ["semi", "eliminator", "qualifier", "knockout", "playoff"]):
        score += 0.15

    if any(token in text for token in ["world cup", "champions trophy", "asia cup", "world championship"]):
        score += 0.10

    return round(min(score, 1.35), 2)


def balls_limit(match_format: str, info: dict[str, Any], balls_per_over: int) -> int | None:
    overs = info.get("overs")
    if isinstance(overs, int):
        return overs * balls_per_over

    format_upper = str(match_format).upper()
    if format_upper == "T20":
        return 20 * balls_per_over
    if format_upper == "ODI":
        return 50 * balls_per_over
    return None


def phase_from_over(match_format: str, over_number: int) -> str:
    format_upper = str(match_format).upper()
    if format_upper == "T20":
        if over_number <= 5:
            return "Powerplay"
        if over_number <= 15:
            return "Middle"
        return "Death"
    if format_upper == "ODI":
        if over_number <= 9:
            return "Powerplay"
        if over_number <= 39:
            return "Middle"
        return "Death"
    if over_number <= 29:
        return "Early"
    if over_number <= 79:
        return "Middle"
    return "Late"


def overs_from_balls(legal_balls: int) -> float:
    if legal_balls <= 0:
        return 0.0
    return float(f"{legal_balls // 6}.{legal_balls % 6}")


def extract_archives(force: bool = False) -> list[Path]:
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    archives = sorted(RAW_CRICSHEET_DIR.glob("*.zip"))
    if not archives:
        raise FileNotFoundError(f"No Cricsheet archives found in {RAW_CRICSHEET_DIR}")

    for archive in archives:
        with zipfile.ZipFile(archive, "r") as zipped:
            for member in zipped.namelist():
                if not member.endswith(".json"):
                    continue
                target_path = EXTRACTED_DIR / Path(member).name
                if target_path.exists() and not force:
                    continue
                target_path.write_bytes(zipped.read(member))
    return sorted(EXTRACTED_DIR.glob("*.json"))


def load_match(match_path: Path) -> dict[str, Any]:
    return json.loads(match_path.read_text(encoding="utf-8"))


def parse_matches() -> tuple[pd.DataFrame, pd.DataFrame]:
    rows: list[dict[str, Any]] = []
    match_team_rows: list[dict[str, Any]] = []
    player_teams: dict[str, Counter[str]] = defaultdict(Counter)
    player_names: dict[str, str] = {}
    player_batting_innings: Counter[str] = Counter()
    player_bowling_innings: Counter[str] = Counter()
    player_total_runs: Counter[str] = Counter()
    player_total_wickets: Counter[str] = Counter()

    for match_path in sorted(EXTRACTED_DIR.glob("*.json")):
        data = load_match(match_path)
        info = data.get("info", {})
        registry = info.get("registry", {}).get("people", {})
        teams = info.get("teams", [])
        players_by_team = info.get("players", {})
        match_id = match_path.stem
        match_format = str(info.get("match_type", "Unknown")).upper()
        tournament = info.get("event", {}).get("name") or "Unknown"
        match_date = (info.get("dates") or ["Unknown"])[0]
        venue = info.get("venue", "Unknown")
        season = info.get("season")
        importance = match_importance(info)
        balls_per_over = int(info.get("balls_per_over", 6))
        total_balls_available = balls_limit(match_format, info, balls_per_over)

        winner = info.get("outcome", {}).get("winner")
        if not winner and info.get("outcome", {}).get("result"):
            outcome_result = str(info["outcome"]["result"]).lower()
            if outcome_result in {"tie", "draw", "no result"}:
                winner = None

        for player_name, player_id in registry.items():
            player_names[str(player_id)] = player_name
            for team_name, squad in players_by_team.items():
                if player_name in squad:
                    player_teams[str(player_id)][team_name] += 1

        innings_list = data.get("innings", [])
        prior_team_totals: list[int] = []
        for innings_index, innings in enumerate(innings_list, start=1):
            batting_team = innings.get("team", "Unknown")
            opposition = next((team for team in teams if team != batting_team), "Unknown")
            team_result = "win" if batting_team == winner else "loss" if winner else "no result"
            match_team_rows.append(
                {
                    "match_id": match_id,
                    "team": batting_team,
                    "format": match_format,
                    "won_match": batting_team == winner,
                }
            )

            target = prior_team_totals[0] + 1 if innings_index > 1 and prior_team_totals else None
            is_chase = target is not None and match_format in {"T20", "ODI"}
            innings_rows: dict[str, dict[str, Any]] = {}
            batting_order: list[str] = []
            team_runs = 0
            wickets_fallen = 0
            legal_balls_bowled = 0

            for over in innings.get("overs", []):
                over_number = int(over.get("over", 0))
                current_phase = phase_from_over(match_format, over_number)
                for delivery in over.get("deliveries", []):
                    batter = delivery.get("batter")
                    bowler = delivery.get("bowler")
                    batter_id = str(registry.get(batter, batter or ""))
                    bowler_id = str(registry.get(bowler, bowler or ""))
                    extras = delivery.get("extras", {})
                    is_wide = "wides" in extras
                    is_no_ball = "noballs" in extras
                    is_legal = not is_wide and not is_no_ball
                    runs_info = delivery.get("runs", {})
                    batter_runs = int(runs_info.get("batter", 0))
                    total_runs = int(runs_info.get("total", 0))

                    if batter_id and batter_id not in innings_rows:
                        innings_rows[batter_id] = {
                            "player_id": batter_id,
                            "player_name": player_names.get(batter_id, batter or "Unknown"),
                            "team": batting_team,
                            "opposition": opposition,
                            "batting_position": None,
                            "runs": 0,
                            "balls": 0,
                            "boundary_balls": 0,
                            "dismissal_type": None,
                            "is_not_out": False,
                            "wickets_fallen_when_batting": 0,
                            "required_run_rate": None,
                            "batting_phase_counts": Counter(),
                            "wickets": 0,
                            "runs_conceded": 0,
                            "legal_balls_bowled": 0,
                            "dot_balls": 0,
                            "bowling_phase_counts": Counter(),
                        }

                    if bowler_id and bowler_id not in innings_rows:
                        innings_rows[bowler_id] = {
                            "player_id": bowler_id,
                            "player_name": player_names.get(bowler_id, bowler or "Unknown"),
                            "team": opposition,
                            "opposition": batting_team,
                            "batting_position": None,
                            "runs": 0,
                            "balls": 0,
                            "boundary_balls": 0,
                            "dismissal_type": None,
                            "is_not_out": False,
                            "wickets_fallen_when_batting": 0,
                            "required_run_rate": None,
                            "batting_phase_counts": Counter(),
                            "wickets": 0,
                            "runs_conceded": 0,
                            "legal_balls_bowled": 0,
                            "dot_balls": 0,
                            "bowling_phase_counts": Counter(),
                        }

                    if batter_id:
                        batter_row = innings_rows[batter_id]
                        if batter_row["batting_position"] is None:
                            batting_order.append(batter_id)
                            batter_row["batting_position"] = len(batting_order)
                            batter_row["wickets_fallen_when_batting"] = wickets_fallen
                            if is_chase and total_balls_available:
                                balls_remaining = max(total_balls_available - legal_balls_bowled, 1)
                                runs_needed = max(target - team_runs, 0)
                                batter_row["required_run_rate"] = runs_needed / (balls_remaining / balls_per_over)
                        batter_row["runs"] += batter_runs
                        if batter_runs in {4, 6} and not is_wide:
                            batter_row["boundary_balls"] += 1
                        if not is_wide:
                            batter_row["balls"] += 1
                            batter_row["batting_phase_counts"][current_phase] += 1

                    if bowler_id:
                        bowler_row = innings_rows[bowler_id]
                        bowler_row["runs_conceded"] += total_runs
                        if is_legal:
                            bowler_row["legal_balls_bowled"] += 1
                            bowler_row["bowling_phase_counts"][current_phase] += 1
                            if total_runs == 0:
                                bowler_row["dot_balls"] += 1

                    team_runs += total_runs
                    if is_legal:
                        legal_balls_bowled += 1

                    for wicket in delivery.get("wickets", []):
                        player_out = wicket.get("player_out")
                        player_out_id = str(registry.get(player_out, player_out or ""))
                        dismissal_type = wicket.get("kind", "unknown")
                        wickets_fallen += 1
                        if player_out_id and player_out_id in innings_rows:
                            innings_rows[player_out_id]["dismissal_type"] = dismissal_type
                        if dismissal_type not in {"run out", "retired hurt", "obstructing the field"} and bowler_id:
                            innings_rows[bowler_id]["wickets"] += 1

            prior_team_totals.append(team_runs)
            for player_id, stat_row in innings_rows.items():
                if stat_row["balls"] <= 0 and stat_row["legal_balls_bowled"] <= 0:
                    continue

                batting_phase = stat_row["batting_phase_counts"].most_common(1)
                bowling_phase = stat_row["bowling_phase_counts"].most_common(1)
                dominant_phase = batting_phase[0][0] if batting_phase else bowling_phase[0][0] if bowling_phase else "Middle"
                dismissal_type = stat_row["dismissal_type"] or ("not out" if stat_row["balls"] > 0 else "did not bat")
                is_not_out = dismissal_type == "not out"
                strike_rate = (stat_row["runs"] / stat_row["balls"] * 100.0) if stat_row["balls"] else 0.0
                boundary_percentage = (stat_row["boundary_balls"] / stat_row["balls"]) if stat_row["balls"] else 0.0
                overs = overs_from_balls(stat_row["legal_balls_bowled"])
                economy = (
                    stat_row["runs_conceded"] / (stat_row["legal_balls_bowled"] / 6.0)
                    if stat_row["legal_balls_bowled"]
                    else 0.0
                )
                dot_ball_percentage = (
                    stat_row["dot_balls"] / stat_row["legal_balls_bowled"]
                    if stat_row["legal_balls_bowled"]
                    else 0.0
                )

                rows.append(
                    {
                        "match_id": match_id,
                        "player_id": player_id,
                        "player_name": stat_row["player_name"],
                        "innings_number": innings_index,
                        "date": match_date,
                        "season": season,
                        "team": stat_row["team"],
                        "opposition": stat_row["opposition"],
                        "venue": venue,
                        "format": match_format,
                        "tournament": tournament,
                        "result": team_result,
                        "won_match": team_result == "win",
                        "runs": stat_row["runs"],
                        "balls": stat_row["balls"],
                        "strike_rate": round(strike_rate, 2),
                        "boundary_percentage": round(boundary_percentage, 4),
                        "dismissal_type": dismissal_type,
                        "batting_position": stat_row["batting_position"],
                        "is_not_out": is_not_out,
                        "wickets": stat_row["wickets"],
                        "runs_conceded": stat_row["runs_conceded"],
                        "overs": round(overs, 2),
                        "economy": round(economy, 2),
                        "dot_ball_percentage": round(dot_ball_percentage, 4),
                        "wickets_fallen_when_batting": stat_row["wickets_fallen_when_batting"],
                        "required_run_rate": round(stat_row["required_run_rate"], 4) if stat_row["required_run_rate"] else None,
                        "match_phase": dominant_phase,
                        "opposition_strength": 1.0,
                        "match_importance": importance,
                        "pressure_index": 0.0,
                        "is_chase": is_chase,
                        "batting_impact": 0.0,
                        "bowling_impact": 0.0,
                        "performance_score": 0.0,
                        "context_multiplier": 1.0,
                        "situation_multiplier": 1.0,
                        "innings_impact_raw": 0.0,
                        "innings_impact": 50.0,
                    }
                )

                if stat_row["balls"] > 0:
                    player_batting_innings[player_id] += 1
                    player_total_runs[player_id] += stat_row["runs"]
                if stat_row["legal_balls_bowled"] > 0:
                    player_bowling_innings[player_id] += 1
                    player_total_wickets[player_id] += stat_row["wickets"]

    innings_df = pd.DataFrame(rows)
    if innings_df.empty:
        return pd.DataFrame(), pd.DataFrame()

    team_strength = build_team_strength(pd.DataFrame(match_team_rows))
    innings_df["opposition_strength"] = innings_df.apply(
        lambda row: team_strength.get((row["opposition"], row["format"]), 1.0),
        axis=1,
    )

    players: list[dict[str, Any]] = []
    for player_id, player_name in player_names.items():
        players.append(
            {
                "player_id": player_id,
                "player_name": player_name,
                "team": player_teams[player_id].most_common(1)[0][0] if player_teams[player_id] else "Unknown",
                "role": infer_role(
                    batting_innings=player_batting_innings[player_id],
                    bowling_innings=player_bowling_innings[player_id],
                    total_runs=player_total_runs[player_id],
                    total_wickets=player_total_wickets[player_id],
                ),
                "batting_style": None,
                "bowling_style": None,
            }
        )
    players_df = pd.DataFrame(players).sort_values("player_name").reset_index(drop=True)
    innings_df = innings_df.sort_values(["player_id", "date", "match_id", "innings_number"]).reset_index(drop=True)
    return players_df, innings_df


def infer_role(batting_innings: int, bowling_innings: int, total_runs: int, total_wickets: int) -> str:
    if bowling_innings == 0 and batting_innings > 0:
        return "Batsman"
    if batting_innings == 0 and bowling_innings > 0:
        return "Bowler"
    if batting_innings > 0 and bowling_innings > 0:
        runs_per_batting_innings = total_runs / max(batting_innings, 1)
        wickets_per_bowling_innings = total_wickets / max(bowling_innings, 1)
        if wickets_per_bowling_innings >= 1.2 and runs_per_batting_innings < 15:
            return "Bowler"
        if runs_per_batting_innings >= 20 and wickets_per_bowling_innings < 0.4:
            return "Batsman"
        return "All-rounder"
    return "Unknown"


def build_team_strength(match_team_df: pd.DataFrame) -> dict[tuple[str, str], float]:
    if match_team_df.empty:
        return {}

    match_team_df = match_team_df.drop_duplicates(["match_id", "team", "format"])
    grouped = (
        match_team_df.groupby(["team", "format"], as_index=False)
        .agg(matches=("match_id", "nunique"), wins=("won_match", "sum"))
    )
    strength: dict[tuple[str, str], float] = {}
    for row in grouped.to_dict("records"):
        smoothed_win_rate = (row["wins"] + 1.0) / (row["matches"] + 2.0)
        strength[(row["team"], row["format"])] = round(0.8 + 0.4 * smoothed_win_rate, 4)
    return strength


def write_outputs(players_df: pd.DataFrame, innings_df: pd.DataFrame) -> None:
    PLAYERS_CSV.parent.mkdir(parents=True, exist_ok=True)
    players_df.to_csv(PLAYERS_CSV, index=False)
    innings_df.to_csv(INNINGS_CSV, index=False)
