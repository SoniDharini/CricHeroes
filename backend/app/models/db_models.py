from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class DBPlayer(Base):
    __tablename__ = "players"

    player_id = Column(String, primary_key=True, index=True)
    player_name = Column(String, nullable=False, index=True)
    team = Column(String, nullable=False, default="Unknown")
    role = Column(String, nullable=False, default="Unknown")
    batting_style = Column(String, nullable=True)
    bowling_style = Column(String, nullable=True)


class DBInnings(Base):
    __tablename__ = "innings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(String, nullable=False, index=True)
    player_id = Column(String, ForeignKey("players.player_id"), nullable=False, index=True)
    innings_number = Column(Integer, nullable=False, default=1)
    date = Column(String, nullable=False, index=True)
    season = Column(String, nullable=True)
    team = Column(String, nullable=False, default="Unknown")
    opposition = Column(String, nullable=False, default="Unknown")
    venue = Column(String, nullable=True)
    format = Column(String, nullable=False, index=True)
    tournament = Column(String, nullable=True)
    result = Column(String, nullable=True)
    won_match = Column(Boolean, nullable=False, default=False)

    # Batting features
    runs = Column(Integer, nullable=False, default=0)
    balls = Column(Integer, nullable=False, default=0)
    strike_rate = Column(Float, nullable=False, default=0.0)
    boundary_percentage = Column(Float, nullable=False, default=0.0)
    dismissal_type = Column(String, nullable=False, default="did not bat")
    batting_position = Column(Integer, nullable=True)
    is_not_out = Column(Boolean, nullable=False, default=False)

    # Bowling features
    wickets = Column(Integer, nullable=False, default=0)
    runs_conceded = Column(Integer, nullable=False, default=0)
    overs = Column(Float, nullable=False, default=0.0)
    economy = Column(Float, nullable=False, default=0.0)
    dot_ball_percentage = Column(Float, nullable=False, default=0.0)

    # Context features
    wickets_fallen_when_batting = Column(Integer, nullable=False, default=0)
    required_run_rate = Column(Float, nullable=True)
    match_phase = Column(String, nullable=False, default="Middle")
    opposition_strength = Column(Float, nullable=False, default=1.0)
    match_importance = Column(Float, nullable=False, default=1.0)
    pressure_index = Column(Float, nullable=False, default=0.0)
    is_chase = Column(Boolean, nullable=False, default=False)

    # Impact components
    batting_impact = Column(Float, nullable=False, default=0.0)
    bowling_impact = Column(Float, nullable=False, default=0.0)
    performance_score = Column(Float, nullable=False, default=0.0)
    context_multiplier = Column(Float, nullable=False, default=1.0)
    situation_multiplier = Column(Float, nullable=False, default=1.0)
    innings_impact_raw = Column(Float, nullable=False, default=0.0)
    innings_impact = Column(Float, nullable=False, default=50.0)


class DBImpactScore(Base):
    __tablename__ = "impact_scores"

    player_id = Column(String, ForeignKey("players.player_id"), primary_key=True, index=True)
    rolling_impact = Column(Float, nullable=False, default=0.0)
    impact_metric = Column(Float, nullable=False, default=50.0)
    sample_size = Column(Integer, nullable=False, default=0)
    trend = Column(String, nullable=False, default="stable")
    explanation = Column(Text, nullable=True)
    last_updated = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
