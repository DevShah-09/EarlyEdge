"""
ML Predictor:
Loads trained LR + RF models and generates risk scores for each patient.
Ensemble: 40% LR + 60% RF (RF given higher weight for non-linear patterns).
"""
import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List
from ml.preprocessor import get_feature_matrix
from ml.trainer import CONDITIONS, MODEL_DIR, models_exist, train_models

_model_cache: Dict[str, object] = {}


def _load_models():
    """Loads all saved models into memory cache."""
    global _model_cache
    for condition in CONDITIONS:
        lr_path = f"{MODEL_DIR}/{condition}_lr.pkl"
        rf_path = f"{MODEL_DIR}/{condition}_rf.pkl"
        if os.path.exists(lr_path):
            _model_cache[f"{condition}_lr"] = joblib.load(lr_path)
        if os.path.exists(rf_path):
            _model_cache[f"{condition}_rf"] = joblib.load(rf_path)


def ensure_models(df: pd.DataFrame):
    """Trains models if they don't exist yet, then loads them."""
    if not models_exist():
        train_models(df)
    if not _model_cache:
        _load_models()


def predict_risk_scores(df: pd.DataFrame) -> List[Dict]:
    """
    Predict risk scores for all patients in the DataFrame.
    Returns a list of dicts with:
      - patient_id
      - diabetes_risk, hypertension_risk, cvd_risk (0-100)
      - overall_risk (0-100)
      - risk_tier (High/Medium/Low)
    """
    ensure_models(df)
    X = get_feature_matrix(df)

    results = []
    for condition in CONDITIONS:
        lr_key = f"{condition}_lr"
        rf_key = f"{condition}_rf"

        if lr_key in _model_cache and rf_key in _model_cache:
            lr_proba = _model_cache[lr_key].predict_proba(X)[:, 1]
            rf_proba = _model_cache[rf_key].predict_proba(X)[:, 1]
            # Weighted ensemble
            condition_risk = (0.4 * lr_proba + 0.6 * rf_proba) * 100
        else:
            # Fallback: rule-based score
            condition_risk = _rule_based_fallback(df, condition) * 100

        if not results:
            results = [{"patient_id": str(pid)} for pid in df["patient_id"]]

        for i, score in enumerate(condition_risk):
            results[i][f"{condition}_risk"] = round(float(score), 1)

    # Calculate overall risk as weighted max
    for row in results:
        d = row.get("diabetes_risk", 50)
        h = row.get("hypertension_risk", 50)
        c = row.get("cvd_risk", 50)
        overall = round(max(d, h, c) * 0.5 + (d + h + c) / 3 * 0.5, 1)
        row["overall_risk"] = overall
        row["risk_tier"] = (
            "High" if overall >= 70 else ("Medium" if overall >= 40 else "Low")
        )

    return results


def _rule_based_fallback(df: pd.DataFrame, condition: str) -> np.ndarray:
    """
    Simple rule-based risk estimator used when models aren't trained yet.
    Returns probability array [0, 1].
    """
    scores = np.zeros(len(df))

    if condition == "diabetes":
        scores += (df.get("hba1c", pd.Series([5.5] * len(df))) >= 5.7).astype(float) * 0.4
        scores += (df.get("blood_glucose_fasting", pd.Series([90] * len(df))) >= 100).astype(float) * 0.3
        scores += (df.get("bmi", pd.Series([22] * len(df))) >= 25).astype(float) * 0.15
        scores += (df.get("family_history_diabetes", pd.Series([0] * len(df))) == 1).astype(float) * 0.15

    elif condition == "hypertension":
        scores += (df.get("systolic_bp", pd.Series([120] * len(df))) >= 130).astype(float) * 0.45
        scores += (df.get("diastolic_bp", pd.Series([80] * len(df))) >= 85).astype(float) * 0.3
        scores += (df.get("family_history_hypertension", pd.Series([0] * len(df))) == 1).astype(float) * 0.15
        scores += (df.get("bmi", pd.Series([22] * len(df))) >= 30).astype(float) * 0.1

    elif condition == "cvd":
        scores += (df.get("age", pd.Series([40] * len(df))) >= 55).astype(float) * 0.25
        scores += (df.get("smoking_status", pd.Series([0] * len(df))) == 2).astype(float) * 0.25
        scores += (df.get("cholesterol_total", pd.Series([180] * len(df))) >= 200).astype(float) * 0.2
        scores += (df.get("systolic_bp", pd.Series([120] * len(df))) >= 140).astype(float) * 0.2
        scores += (df.get("family_history_cvd", pd.Series([0] * len(df))) == 1).astype(float) * 0.1

    return scores.clip(0, 1)
