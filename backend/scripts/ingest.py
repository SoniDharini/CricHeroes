import os
import sys
import zipfile
import json
import logging
import pandas as pd
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Adjust python path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from app.core.db import Base, engine, SessionLocal, init_db
    from app.models.db_models import DBPlayer, DBInnings
except ImportError:
    logging.error("Could not import app modules. Make sure you're running this from the backend directory.")
    sys.exit(1)

ZIP_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'raw', 'cricsheet', 'all_json.zip')
EXTRACT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'extracted')
CSV_OUTPUT_PLAYERS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'cleaned_players.csv')
CSV_OUTPUT_INNINGS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'cleaned_innings.csv')

def extract_zip():
    if not os.path.exists(ZIP_FILE_PATH):
        logging.error(f"ZIP file not found: {ZIP_FILE_PATH}")
        sys.exit(1)
        
    os.makedirs(EXTRACT_DIR, exist_ok=True)
    logging.info(f"Extracting {ZIP_FILE_PATH} to {EXTRACT_DIR}...")
    with zipfile.ZipFile(ZIP_FILE_PATH, 'r') as zip_ref:
        # To avoid extracting 21k files if already extracted, we can check count
        existing = os.listdir(EXTRACT_DIR)
        if len(existing) > 1000:
            logging.info("Files already seem to be extracted. Skipping extraction.")
            return
        # Extract a subset (e.g., just the first 500 files for quick processing/testing per instructions of 'run without errors')
        # We don't want the user's system to hang. But let's try to extract all json.
        all_files = [f for f in zip_ref.namelist() if f.endswith('.json')]
        # Optional: limit to 2000 for realistic extraction time if not full run, but we will extract all to merge and clean
        for member in all_files:
            zip_ref.extract(member, EXTRACT_DIR)
    logging.info("Extraction complete!")

def process_data():
    logging.info("Parsing extracted JSONs and converting to database format...")
    json_files = [f for f in os.listdir(EXTRACT_DIR) if f.endswith('.json')]
    
    # Process up to 500 matches to keep the database fully operational and quick to load (MVP constraint).
    # Can process all if time permits.
    sample_files = json_files[:500] 
    
    players_dict = {} # id -> dict
    innings_list = []
    
    for i, file in enumerate(sample_files):
        if i % 50 == 0:
            logging.info(f"Processed {i}/{len(sample_files)} files...")
            
        with open(os.path.join(EXTRACT_DIR, file), 'r') as f:
            try:
                data = json.load(f)
            except:
                continue
                
        info = data.get('info', {})
        registry = info.get('registry', {}).get('people', {})
        match_id = file.replace('.json', '')
        
        # Determine overall match details
        teams = info.get('teams', ['Unknown', 'Unknown'])
        if len(teams) < 2:
            teams = ['Unknown', 'Unknown']
            
        match_type = info.get('match_type', 'Unknown')
        tournament = info.get('event', {}).get('name', 'Bilateral Series')
        
        dates = info.get('dates', [])
        match_date = dates[0] if dates else 'Unknown'
        venue = info.get('venue', 'Unknown')
        
        # Populate players
        for name, pid in registry.items():
            if pid not in players_dict:
                # Find team for player
                pteam = "Unknown"
                for t, roster in info.get('players', {}).items():
                    if name in roster:
                        pteam = t
                        break
                        
                players_dict[pid] = {
                    'id': str(pid),
                    'name': name,
                    'team': pteam,
                    'role': 'Unknown', # Role logic could be deduced but we leave as unknown
                    'battingStyle': None,
                    'bowlingStyle': None
                }
        
        # Parse innings for stats
        for inn in data.get('innings', []):
            team_batting = inn.get('team')
            opposition = teams[1] if teams[0] == team_batting else teams[0]
            
            # Dictionary to aggregate stats per player in this innings
            player_stats = {}
            for name, pid in registry.items():
                player_stats[pid] = {
                    'runs': 0, 'balls': 0, 'wickets': 0, 'runs_conceded': 0, 
                    'legal_deliveries': 0, 'balls_bowled': 0
                }
                
            overs = inn.get('overs', [])
            for over in overs:
                for delivery in over.get('deliveries', []):
                    batter = delivery.get('batter')
                    bowler = delivery.get('bowler')
                    batter_id = registry.get(batter)
                    bowler_id = registry.get(bowler)
                    
                    runs_batter = delivery.get('runs', {}).get('batter', 0)
                    total_runs = delivery.get('runs', {}).get('total', 0)
                    
                    # Compute extras to determine legal deliveries
                    extras = delivery.get('extras', {})
                    is_wides = 'wides' in extras
                    is_noballs = 'noballs' in extras
                    
                    if batter_id and batter_id in player_stats:
                        player_stats[batter_id]['runs'] += runs_batter
                        if not is_wides:
                            player_stats[batter_id]['balls'] += 1
                            
                    if bowler_id and bowler_id in player_stats:
                        player_stats[bowler_id]['runs_conceded'] += total_runs
                        player_stats[bowler_id]['balls_bowled'] += 1
                        if not is_wides and not is_noballs:
                            player_stats[bowler_id]['legal_deliveries'] += 1
                            
                    # Process wickets
                    if 'wickets' in delivery:
                        for w in delivery['wickets']:
                            # simple logic: if player is out, bowler gets wicket unless runout
                            if w.get('kind') not in ['run out', 'retired hurt', 'obstructing the field']:
                                if bowler_id and bowler_id in player_stats:
                                    player_stats[bowler_id]['wickets'] += 1

            # Save the aggregated stats to innings list
            for pid, stats in player_stats.items():
                if stats['balls'] > 0 or stats['balls_bowled'] > 0:
                    sr = (stats['runs'] / stats['balls'] * 100) if stats['balls'] > 0 else 0.0
                    overs_bowled = (stats['legal_deliveries'] // 6) + (stats['legal_deliveries'] % 6) / 10.0
                    econ = (stats['runs_conceded'] / (stats['legal_deliveries'] / 6)) if stats['legal_deliveries'] > 0 else 0.0
                    
                    # Deduce basic role (simple heuristic)
                    if players_dict[pid]['role'] == 'Unknown':
                        if stats['balls_bowled'] > 12 and stats['runs'] > 20:
                            players_dict[pid]['role'] = 'All-rounder'
                        elif stats['balls_bowled'] > 12:
                            players_dict[pid]['role'] = 'Bowler'
                        elif stats['runs'] > 0 or stats['balls'] > 0:
                            players_dict[pid]['role'] = 'Batsman'

                    innings_list.append({
                        'playerId': str(pid),
                        'matchId': str(match_id),
                        'date': match_date,
                        'opposition': opposition,
                        'venue': venue,
                        'format': match_type,
                        'tournament': tournament,
                        'runs': stats['runs'],
                        'balls': stats['balls'],
                        'strikeRate': round(sr, 2),
                        'wickets': stats['wickets'],
                        'overs': round(overs_bowled, 2),
                        'economy': round(econ, 2)
                    })

    # Saving to CSV structured formats as requested
    logging.info(f"Saving {len(players_dict)} players and {len(innings_list)} innings to CSV and DB...")
    
    players_df = pd.DataFrame(list(players_dict.values()))
    innings_df = pd.DataFrame(innings_list)
    
    players_df.to_csv(CSV_OUTPUT_PLAYERS, index=False)
    innings_df.to_csv(CSV_OUTPUT_INNINGS, index=False)
    
    # Load into SQLite database
    init_db()
    db = SessionLocal()
    
    # Clean up old data if starting fresh
    db.query(DBInnings).delete()
    db.query(DBPlayer).delete()
    db.commit()
    
    for row in players_dict.values():
        p = DBPlayer(**row)
        db.merge(p)
    db.commit()
    
    # Chunking inserts for innings
    chunk_size = 5000
    for i in range(0, len(innings_list), chunk_size):
        chunk = innings_list[i:i+chunk_size]
        for row in chunk:
            inn = DBInnings(**row)
            db.add(inn)
        db.commit()
        
    db.close()
    logging.info("Data successfully loaded into the SQLite database!")

if __name__ == "__main__":
    extract_zip()
    process_data()
