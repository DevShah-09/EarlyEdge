"""
ML Model Trainer — Upgraded
============================
Trains Logistic Regression, Random Forest, XGBoost, and LightGBM models
for three conditions: Diabetes, Hypertension, and CVD.

Model selection: Best model is chosen by RECALL (prioritise catching
high-risk patients — false negatives are clinically dangerous).

Class imbalance: Handled via SMOTE over-sampling + class_weight flags.

Saves:
  - Best model per condition: {condition}_best.pkl
  - LR + RF kept for ensemble fallback: {condition}_lr.pkl, {condition}_rf.pkl
  - Training evaluation report: saved_models/training_report.json
"""
import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    recall_score, precision_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from typing import Dict

from backend.ml.preprocessor import get_feature_matrix
from backend.utils.feature_columns import ALL_FEATURES

# ── Optional heavy libs (graceful fallback if not installed) ──────────────────
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    from lightgbm import LGBMClassifier
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False

MODEL_DIR = os.getenv("MODEL_DIR", "./ml/saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

CONDITIONS = ["diabetes", "hypertension", "cvd"]


# ── Clinical rule-based label generation (when no ground truth) ───────────────
def _generate_synthetic_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generates approximate risk labels from clinical thresholds:
      - Diabetes:      HbA1c >= 6.5 OR fasting_glucose >= 126
      - Hypertension:  systolic_bp >= 140 OR diastolic_bp >= 90
      - CVD:           composite Framingham-style proxy (age, chol, BP, smoking)
    """
    labels = pd.DataFrame()

    labels["diabetes"] = (
        (df.get("hba1c", 0) >= 6.5) |
        (df.get("blood_glucose_fasting", 0) >= 126) |
        ((df.get("hba1c", 0) >= 5.7) & (df.get("bmi", 0) >= 30))
    ).astype(int)

    labels["hypertension"] = (
        (df.get("systolic_bp", 0) >= 140) |
        (df.get("diastolic_bp", 0) >= 90) |
        ((df.get("systolic_bp", 0) >= 130) & (df.get("family_history_hypertension", 0) == 1))
    ).astype(int)

    age_risk   = df.get("age", 0) >= 55
    chol_risk  = df.get("cholesterol_total", 0) >= 240
    bp_risk    = df.get("systolic_bp", 0) >= 130
    smoke_risk = df.get("smoking_status", 0) == 2
    fhx_risk   = df.get("family_history_cvd", 0) == 1
    risk_sum   = (age_risk.astype(int) + chol_risk.astype(int) +
                  bp_risk.astype(int) + smoke_risk.astype(int) + fhx_risk.astype(int))
    labels["cvd"] = (risk_sum >= 2).astype(int)

    return labels


def _build_candidate_models(pos_weight: float):
    """Build all candidate model objects for a given positive class weight."""
    candidates = {
        "lr": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(
                max_iter=500, random_state=42, class_weight="balanced"
            ))
        ]),
        "rf": RandomForestClassifier(
            n_estimators=200, max_depth=12,
            random_state=42, class_weight="balanced", n_jobs=-1
        ),
    }
    if HAS_XGB:
        candidates["xgb"] = XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.05,
            scale_pos_weight=pos_weight,
            random_state=42, eval_metric="logloss",
            use_label_encoder=False, verbosity=0
        )
    if HAS_LGBM:
        candidates["lgbm"] = LGBMClassifier(
            n_estimators=200, max_depth=8, learning_rate=0.05,
            scale_pos_weight=pos_weight,
            random_state=42, verbosity=-1, n_jobs=-1
        )
    return candidates


def train_models(df: pd.DataFrame) -> Dict[str, dict]:
    """
    Trains all candidate models per condition, selects the best by Recall,
    saves all models, and writes a training_report.json.

    Returns: summary dict with per-condition metrics.
    """
    X = get_feature_matrix(df)
    labels = _generate_synthetic_labels(df)
    report = {}

    for condition in CONDITIONS:
        y = labels[condition]

        if y.sum() < 5:
            report[condition] = {"status": "skipped", "reason": "too_few_positives", "positive_count": int(y.sum())}
            continue

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # SMOTE oversampling on training set
        if HAS_SMOTE and y_train.sum() >= 5:
            try:
                sm = SMOTE(random_state=42, k_neighbors=min(5, int(y_train.sum()) - 1))
                X_train_res, y_train_res = sm.fit_resample(X_train, y_train)
            except Exception:
                X_train_res, y_train_res = X_train, y_train
        else:
            X_train_res, y_train_res = X_train, y_train

        neg = max(1, (y_train_res == 0).sum())
        pos = max(1, (y_train_res == 1).sum())
        pos_weight = neg / pos

        candidates = _build_candidate_models(pos_weight)
        condition_results = {}
        best_name, best_model, best_recall = None, None, -1.0

        for name, model in candidates.items():
            try:
                model.fit(X_train_res, y_train_res)
                y_pred = model.predict(X_test)
                try:
                    y_proba = model.predict_proba(X_test)[:, 1]
                    auc = round(float(roc_auc_score(y_test, y_proba)), 4)
                except Exception:
                    auc = None

                rec  = round(float(recall_score(y_test, y_pred, zero_division=0)), 4)
                prec = round(float(precision_score(y_test, y_pred, zero_division=0)), 4)
                f1   = round(float(f1_score(y_test, y_pred, zero_division=0)), 4)
                cm   = confusion_matrix(y_test, y_pred).tolist()

                condition_results[name] = {
                    "recall": rec, "precision": prec, "f1": f1,
                    "roc_auc": auc, "confusion_matrix": cm
                }

                # Save every model so ensemble can still use LR + RF
                joblib.dump(model, f"{MODEL_DIR}/{condition}_{name}.pkl")

                if rec > best_recall:
                    best_recall = rec
                    best_name   = name
                    best_model  = model

            except Exception as e:
                condition_results[name] = {"error": str(e)}

        # Save best model separately
        if best_model is not None:
            joblib.dump(best_model, f"{MODEL_DIR}/{condition}_best.pkl")

        report[condition] = {
            "status": "trained",
            "best_model": best_name,
            "best_recall": best_recall,
            "training_samples": len(X_train_res),
            "test_samples": len(X_test),
            "positive_rate": round(float(y.mean()), 3),
            "models": condition_results,
        }

        print(f"[ML] {condition.upper()} — best={best_name} (recall={best_recall:.3f})")

    # Write report
    report_path = f"{MODEL_DIR}/training_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"[ML] Training report saved → {report_path}")

    return report


def models_exist() -> bool:
    """Check if saved best models exist for all conditions."""
    for condition in CONDITIONS:
        # Accept either best.pkl or rf.pkl (backward compat)
        best  = f"{MODEL_DIR}/{condition}_best.pkl"
        fallb = f"{MODEL_DIR}/{condition}_rf.pkl"
        if not os.path.exists(best) and not os.path.exists(fallb):
            return False
    return True
