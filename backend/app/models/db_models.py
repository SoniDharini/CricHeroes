from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DBPlayer(Base):
    __tablename__ = 'players'
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    role = Column(String) # Batsman, Bowler, All-rounder, Wicket-keeper
    battingStyle = Column(String, nullable=True)
    bowlingStyle = Column(String, nullable=True)

class DBInnings(Base):
    __tablename__ = 'innings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    playerId = Column(String, ForeignKey('players.id'))
    matchId = Column(String)
    date = Column(String)
    opposition = Column(String)
    venue = Column(String)
    format = Column(String) # T20, ODI, Test
    tournament = Column(String, nullable=True)
    
    # Raw stats
    runs = Column(Integer, default=0)
    balls = Column(Integer, default=0)
    strikeRate = Column(Float, default=0.0)
    wickets = Column(Integer, default=0)
    overs = Column(Float, default=0.0)
    economy = Column(Float, default=0.0)
    
    # Feature engineering inputs
    matchPhase = Column(String, nullable=True) # Powerplay, Middle, Death
    oppositionStrength = Column(Float, default=1.0)
    pitchDifficulty = Column(Float, default=1.0)
    isChase = Column(Boolean, default=False)
    requiredRR = Column(Float, nullable=True)
    wicketsInHand = Column(Integer, nullable=True)
    matchImportance = Column(Float, default=1.0)
