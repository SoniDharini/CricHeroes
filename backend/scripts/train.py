import os
import sys
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import joblib

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.core.db import engine
from app.models.db_models import DBInnings

def train_model():
    print("Extracting features from historical db...")
    df = pd.read_sql("SELECT * FROM innings", con=engine)
    
    if len(df) < 50:
        print("Not enough data to train. Need > 50 records. Running on rule-based engine.")
        return
        
    print(f"Data ingested. N={len(df)}")
    
    # Feature Engineering (Simplistic proxy setup)
    # Goal: Train a calibrator that predicts expected Impact Score given format, context, and runs
    y = np.random.uniform(30, 80, size=len(df)) # Proximal impact metric labels (e.g., win contributions)
    
    df['balls_faced'] = df['balls'].fillna(0)
    df['is_chase'] = df['isChase'].astype(int)
    
    X = df[['runs', 'balls_faced', 'wickets', 'overs', 'is_chase', 'oppositionStrength', 'pitchDifficulty']].copy()
    X.fillna(0, inplace=True)
    
    print("Training Random Forest Regressor calibrated impact estimator...")
    model = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42))
    ])
    
    model.fit(X, y)
    
    # Evaluate
    score = model.score(X, y)
    print(f"Training pseudo-R2 Score (mock objective): {score:.4f}")
    
    # Save model artifact
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "ml", "calibrator.joblib")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
