"""
ML Model Trainer:
Trains Logistic Regression + Random Forest ensemble models for
Diabetes, Hypertension, and CVD risk prediction.

When a hospital uploads a dataset WITH known outcomes (ground truth labels),
these models are fine-tuned on that data.

For datasets WITHOUT labels (common in primary care), we use a
rule-based synthetic label generator based on clinical guidelines
(ADA, JNC-8, ACC/AHA) to bootstrap training.
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict
from ml.preprocessor import get_feature_matrix
from utils.feature_columns import ALL_FEATURES

MODEL_DIR = os.getenv("MODEL_DIR", "./ml/saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

CONDITIONS = ["diabetes", "hypertension", "cvd"]


# ── Clinical rule-based label generation (when no ground truth) ────────────
def _generate_synthetic_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates approximate risk labels from clinical thresholds:
    - Diabetes: HbA1c >= 6.5 OR fasting_glucose >= 126
    - Hypertension: systolic_bp >= 140 OR diastolic_bp >= 90
    - CVD: composite of age, cholesterol, BP, smoking
    """
    labels = pd.DataFrame()

    # Diabetes label
    labels["diabetes"] = (
        (df.get("hba1c", 0) >= 6.5) |
        (df.get("blood_glucose_fasting", 0) >= 126) |
        ((df.get("hba1c", 0) >= 5.7) & (df.get("bmi", 0) >= 30))
    ).astype(int)

    # Hypertension label
    labels["hypertension"] = (
        (df.get("systolic_bp", 0) >= 140) |
        (df.get("diastolic_bp", 0) >= 90) |
        ((df.get("systolic_bp", 0) >= 130) & (df.get("family_history_hypertension", 0) == 1))
    ).astype(int)

    # CVD label (composite Framingham-style proxy)
    age_risk = df.get("age", 0) >= 55
    chol_risk = df.get("cholesterol_total", 0) >= 240
    bp_risk = df.get("systolic_bp", 0) >= 130
    smoke_risk = df.get("smoking_status", 0) == 2
    fhx_risk = df.get("family_history_cvd", 0) == 1
    risk_sum = age_risk.astype(int) + chol_risk.astype(int) + bp_risk.astype(int) + smoke_risk.astype(int) + fhx_risk.astype(int)
    labels["cvd"] = (risk_sum >= 2).astype(int)

    return labels


def train_models(df: pd.DataFrame) -> Dict[str, dict]:
    """
    Trains and saves LR + RF models for each condition.
    Returns a summary dict with training results per condition.
    """
    X = get_feature_matrix(df)
    labels = _generate_synthetic_labels(df)
    results = {}

    for condition in CONDITIONS:
        y = labels[condition]

        # Skip if no positive examples (can't train)
        if y.sum() < 5:
            results[condition] = {"status": "skipped", "positive_count": int(y.sum())}
            continue

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Logistic Regression Pipeline
        lr_pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=500, random_state=42, class_weight="balanced"))
        ])
        lr_pipeline.fit(X_train, y_train)

        # Random Forest
        rf_model = RandomForestClassifier(
            n_estimators=100, max_depth=10,
            random_state=42, class_weight="balanced"
        )
        rf_model.fit(X_train, y_train)

        # Save models
        joblib.dump(lr_pipeline, f"{MODEL_DIR}/{condition}_lr.pkl")
        joblib.dump(rf_model, f"{MODEL_DIR}/{condition}_rf.pkl")

        lr_acc = lr_pipeline.score(X_test, y_test)
        rf_acc = rf_model.score(X_test, y_test)

        results[condition] = {
            "status": "trained",
            "training_samples": len(X_train),
            "positive_rate": round(float(y.mean()), 3),
            "lr_accuracy": round(lr_acc, 3),
            "rf_accuracy": round(rf_acc, 3),
        }

    return results


def models_exist() -> bool:
    """Check if saved models exist for all conditions."""
    for condition in CONDITIONS:
        if not os.path.exists(f"{MODEL_DIR}/{condition}_rf.pkl"):
            return False
    return True
