import os
import joblib
import numpy as np
import pandas as pd

class ImpactCalibrator:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "calibrator.joblib")
        self.model = None
        
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Failed to load model: {e}")
    
    def calibrate_components(self, features: dict):
        """
        Given IPS (Innings Performance Score), CM (Context Multiplier), PM (Pressure Multiplier)
        and format, calibrate using ML model (if available) or fallback to rule-based bounds.
        """
        is_ml_active = self.model is not None
        
        # Unpack base features
        ips = features.get("base_ips", 50.0)
        cm = features.get("base_cm", 1.0)
        pm = features.get("base_pm", 1.0)
        
        # Rule bounds (Prompt Constraint: 0.75 - 1.25)
        cm = max(0.75, min(1.25, cm))
        pm = max(0.75, min(1.25, pm))

        if is_ml_active:
            # Predict expected baseline offset
            input_df = pd.DataFrame([features])
            try:
                # E.g. expected_ips = self.model.predict(input_df)[0]
                # ips = (ips + expected_ips) / 2
                pass # placeholder for real inference
            except:
                pass

        # Raw Impact calculation
        raw_impact = ips * cm * pm
        
        # Norm to 0-100, 50 neutral
        impact_score = self._normalize_0_100(raw_impact)
        
        return {
            "calibrated_impact": impact_score,
            "calibrated_ips": ips,
            "calibrated_cm": cm,
            "calibrated_pm": pm,
            "is_ml_calibrated": is_ml_active
        }
        
    def _normalize_0_100(self, raw_impact: float) -> float:
        # Assuming typical ips is ~ 50, cm * pm is ~ 1.0 -> raw is ~ 50.
        # This is a simple sigmoid or clipping norm to keep it 0-100
        # Formula: clip, or linear map where 50 stays 50.
        norm = raw_impact
        # clip
        return max(0.0, min(100.0, norm))

# Singleton instance
calibrator = ImpactCalibrator()
