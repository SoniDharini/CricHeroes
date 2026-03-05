from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

from app.models.db_models import Base

# Using SQLite for MVP as requested ("SQLite acceptable for local MVP")
SQLITE_DB_URL = "sqlite:///./CricHeroes.db"
engine = create_engine(SQLITE_DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
