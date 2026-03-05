import os
import sys
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.core.db import Base, engine, SessionLocal, init_db
from app.models.db_models import DBPlayer, DBInnings

def ingest_sample_data():
    init_db()
    db = SessionLocal()
    
    players = [
        DBPlayer(id='1', name='Virat Kohli', team='India', role='Batsman', battingStyle='Right-hand bat'),
        DBPlayer(id='2', name='Rohit Sharma', team='India', role='Batsman', battingStyle='Right-hand bat'),
        DBPlayer(id='3', name='Jasprit Bumrah', team='India', role='Bowler', bowlingStyle='Right-arm fast'),
        DBPlayer(id='4', name='Ravindra Jadeja', team='India', role='All-rounder'),
        DBPlayer(id='6', name='Babar Azam', team='Pakistan', role='Batsman')
    ]
    for p in players:
        db.merge(p)
        
    db.commit()
    
    # Generate random synthetic data to mimic a ball-by-ball aggregation
    import random
    
    formats = ['T20', 'ODI']
    venues = ['Mumbai', 'Delhi', 'Chennai']
    opps = ['Australia', 'England', 'Pakistan']
    
    innings = []
    
    for p in players:
        for i in range(20):
            match_date = f"2023-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            is_chase = random.choice([True, False])
            req_rr = random.uniform(5.5, 12.5) if is_chase else None
            
            inn = DBInnings(
                playerId=p.id,
                matchId=f"M{i+1}",
                date=match_date,
                opposition=random.choice([o for o in opps if o != p.team]),
                venue=random.choice(venues),
                format=random.choice(formats),
                runs=int(random.gauss(30, 20)) if p.role in ['Batsman', 'All-rounder'] else int(random.gauss(5, 5)),
                balls=int(random.gauss(25, 15)) if p.role in ['Batsman', 'All-rounder'] else int(random.gauss(10, 5)),
                wickets=int(random.gauss(1.5, 1)) if p.role in ['Bowler', 'All-rounder'] else 0,
                overs=float(int(random.gauss(4, 1))) if p.role in ['Bowler', 'All-rounder'] else 0.0,
                economy=random.uniform(5.5, 9.5) if p.role in ['Bowler', 'All-rounder'] else 0.0,
                isChase=is_chase,
                requiredRR=req_rr,
                wicketsInHand=random.randint(2, 8),
                oppositionStrength=random.uniform(0.8, 1.2),
                pitchDifficulty=random.uniform(0.8, 1.2),
                matchImportance=random.uniform(0.9, 1.1)
            )
            inn.runs = max(0, inn.runs)
            inn.balls = max(0, inn.balls)
            inn.wickets = max(0, inn.wickets)
            inn.overs = max(0.0, min(10.0, inn.overs))
            inn.strikeRate = (inn.runs / inn.balls * 100) if inn.balls > 0 else 0.0
            db.add(inn)
            
    db.commit()
    db.close()
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest_sample_data()
