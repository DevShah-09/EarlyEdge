"""
ML Predictor — Upgraded
========================
Loads trained models and generates risk scores.

Two modes:
  1. predict_risk_scores(df)  — batch mode (called from upload pipeline)
  2. predict_single(patient)  — single patient dict (called from REST API)

Ensemble strategy (batch):   40% LR + 60% RF (or best model if available)
Single patient:              Uses best model per condition → composite score
High-risk label:             Any severe threshold triggers high_risk=True
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Any

from backend.ml.preprocessor import get_feature_matrix, preprocess_single
from backend.ml.trainer import CONDITIONS, MODEL_DIR, models_exist, train_models
from backend.utils.feature_columns import ALL_FEATURES, FEATURE_DISPLAY_NAMES, get_feature_display_value

_model_cache: Dict[str, Any] = {}

# ── Severe clinical thresholds → high_risk = True ────────────────────────────
HIGH_RISK_RULES = {
    "systolic_bp":           lambda v: v >= 160,
    "diastolic_bp":          lambda v: v >= 100,
    "hba1c":                 lambda v: v >= 8.0,
    "blood_glucose_fasting": lambda v: v >= 180,
    "cholesterol_total":     lambda v: v >= 240,
    "bmi":                   lambda v: v >= 35,
}

RISK_LEVEL_LABELS = {
    (0.0, 0.30): "Normal",
    (0.30, 0.55): "Moderate",
    (0.55, 0.75): "High",
    (0.75, 1.01): "Critical",
}


def _get_risk_level(score: float) -> str:
    for (lo, hi), label in RISK_LEVEL_LABELS.items():
        if lo <= score < hi:
            return label
    return "Critical"


def _load_models():
    global _model_cache
    for condition in CONDITIONS:
        for suffix in ["ensemble", "best", "lr", "rf", "xgb", "lgbm"]:
            path = f"{MODEL_DIR}/{condition}_{suffix}.pkl"
            if os.path.exists(path):
                _model_cache[f"{condition}_{suffix}"] = joblib.load(path)


def ensure_models(df: pd.DataFrame = None):
    if not models_exist():
        if df is not None:
            train_models(df)
        else:
            return  # No data to train on, will use rule-based fallback
    if not _model_cache:
        _load_models()


# ── Batch prediction (upload pipeline) ───────────────────────────────────────
def predict_risk_scores(df: pd.DataFrame) -> List[Dict]:
    """
    Predict risk scores for all patients in the DataFrame.
    Returns list of dicts with patient_id, condition risks, overall_risk, risk_tier.
    """
    ensure_models(df)
    X = get_feature_matrix(df)

    results = []
    for condition in CONDITIONS:
        # Prefer best model, fall back to RF, then LR
        model_key = None
        for suffix in ["ensemble", "best", "rf", "lr"]:
            k = f"{condition}_{suffix}"
            if k in _model_cache:
                model_key = k
                break

        if model_key:
            try:
                condition_risk = _model_cache[model_key].predict_proba(X)[:, 1] * 100
            except Exception:
                condition_risk = _rule_based_fallback(df, condition) * 100
        else:
            condition_risk = _rule_based_fallback(df, condition) * 100

        if not results:
            pids = df["patient_id"] if "patient_id" in df.columns else range(len(df))
            results = [{"patient_id": str(pid)} for pid in pids]

        for i, score in enumerate(condition_risk):
            results[i][f"{condition}_risk"] = round(float(score), 1)

    for row in results:
        d = row.get("diabetes_risk", 50)
        h = row.get("hypertension_risk", 50)
        c = row.get("cvd_risk", 50)
        overall = round(max(d, h, c) * 0.5 + (d + h + c) / 3 * 0.5, 1)
        row["overall_risk"] = overall
        row["risk_tier"] = "High" if overall >= 70 else ("Medium" if overall >= 40 else "Low")

    return results


# ── Single patient prediction (REST API) ─────────────────────────────────────
def predict_single(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict risk for a single patient from the REST API.

    Returns:
        {
            high_risk: bool,
            risk_score: float (0–1),
            risk_level: str,
            risk_percent: int,
            top_factors: list[str],
            condition_scores: { diabetes, hypertension, cvd },
            explanation: str,
        }
    """
    ensure_models()

    X = preprocess_single(patient)

    # ── Rule-based high_risk flag (clinical thresholds) ───────────────────────
    rule_triggered = []
    for feat, rule_fn in HIGH_RISK_RULES.items():
        val = float(patient.get(feat, 0))
        if rule_fn(val):
            rule_triggered.append(FEATURE_DISPLAY_NAMES.get(feat, feat))

    rule_based_high_risk = len(rule_triggered) > 0

    # ── ML model scores per condition ─────────────────────────────────────────
    condition_scores = {}
    for condition in CONDITIONS:
        model_key = None
        for suffix in ["ensemble", "best", "rf", "lr"]:
            k = f"{condition}_{suffix}"
            if k in _model_cache:
                model_key = k
                break

        if model_key:
            try:
                prob = float(_model_cache[model_key].predict_proba(X)[:, 1][0])
            except Exception:
                prob = _rule_based_single(patient, condition)
        else:
            prob = _rule_based_single(patient, condition)

        condition_scores[condition] = round(prob, 4)

    # Overall risk score
    d = condition_scores.get("diabetes", 0.5)
    h = condition_scores.get("hypertension", 0.5)
    c = condition_scores.get("cvd", 0.5)
    ml_score = max(d, h, c) * 0.5 + (d + h + c) / 3 * 0.5

    # Combine rule-based override with ML score
    final_score = max(ml_score, 0.76 if rule_based_high_risk else 0.0)
    final_score = min(final_score, 1.0)

    high_risk  = rule_based_high_risk or final_score >= 0.55
    risk_level = _get_risk_level(final_score)

    # ── Feature importance / top factors ─────────────────────────────────────
    top_factors = _get_top_factors(patient, X, condition_scores)

    # ── Human-readable explanation ────────────────────────────────────────────
    explanation = _build_explanation(top_factors, risk_level, rule_triggered)

    return {
        "high_risk":       high_risk,
        "risk_score":      round(final_score, 4),
        "risk_percent":    int(round(final_score * 100)),
        "risk_level":      risk_level,
        "top_factors":     top_factors[:5],
        "condition_scores": {
            "diabetes":     round(d * 100, 1),
            "hypertension": round(h * 100, 1),
            "cvd":          round(c * 100, 1),
        },
        "rule_triggered":  rule_triggered,
        "explanation":     explanation,
    }


def _get_top_factors(patient: Dict, X: pd.DataFrame, condition_scores: Dict) -> List[str]:
    """
    Returns top contributing factor labels. Tries SHAP first, falls back to
    clinical threshold comparison.
    """
    # Best condition to explain = highest scoring
    best_cond = max(condition_scores, key=condition_scores.get)
    model_key = None
    for suffix in ["best", "rf"]:
        k = f"{best_cond}_{suffix}"
        if k in _model_cache:
            model_key = k
            break

    if model_key:
        try:
            import shap
            model = _model_cache[model_key]
            # TreeExplainer only works for tree models
            explainer = shap.TreeExplainer(model)
            shap_vals = explainer.shap_values(X)
            if isinstance(shap_vals, list):
                sv = shap_vals[1][0]
            elif len(np.array(shap_vals).shape) == 3:
                sv = np.array(shap_vals)[0, :, 1]
            else:
                sv = np.array(shap_vals)[0]

            factor_pairs = sorted(
                zip(ALL_FEATURES, sv),
                key=lambda x: abs(x[1]),
                reverse=True
            )
            pos_factors = [
                get_feature_display_value(feat, float(X[feat].iloc[0]))
                for feat, impact in factor_pairs
                if impact > 0
            ]
            return pos_factors[:5]
        except Exception:
            pass

    # Fallback: rank by clinical deviation from normal
    return _clinical_factor_ranking(patient)


def _clinical_factor_ranking(patient: Dict) -> List[str]:
    """Ranks clinical features by deviation from healthy baselines."""
    deviations = []

    checks = [
        ("hba1c",                 float(patient.get("hba1c", 5.5)),          5.5,  "HbA1c {v:.1f}%"),
        ("systolic_bp",           float(patient.get("systolic_bp", 120)),    120,  "Systolic BP {v:.0f} mmHg"),
        ("diastolic_bp",          float(patient.get("diastolic_bp", 80)),    80,   "Diastolic BP {v:.0f} mmHg"),
        ("blood_glucose_fasting", float(patient.get("blood_glucose_fasting", 90)), 90, "Fasting Glucose {v:.0f} mg/dL"),
        ("cholesterol_total",     float(patient.get("cholesterol_total", 180)),   180, "Cholesterol {v:.0f} mg/dL"),
        ("bmi",                   float(patient.get("bmi", 22)),             22,   "BMI {v:.1f}"),
        ("age",                   float(patient.get("age", 40)),             40,   "Age {v:.0f} yrs"),
    ]
    for key, val, baseline, template in checks:
        dev = abs(val - baseline) / max(baseline, 1)
        label = template.replace("{v:.1f}", f"{val:.1f}").replace("{v:.0f}", f"{val:.0f}")
        deviations.append((dev, label))

    deviations.sort(reverse=True)
    return [label for _, label in deviations[:5]]


def _build_explanation(factors: List[str], risk_level: str, rule_triggered: List[str]) -> str:
    if rule_triggered:
        return f"{risk_level} risk — severe thresholds exceeded: {', '.join(rule_triggered[:3])}."
    if factors:
        return f"{risk_level} risk due to {' + '.join(factors[:3])}."
    return f"Risk assessed as {risk_level} based on patient profile."


def _rule_based_fallback(df: pd.DataFrame, condition: str) -> np.ndarray:
    scores = np.zeros(len(df))
    if condition == "diabetes":
        scores += (df.get("hba1c", pd.Series([5.5]*len(df))) >= 5.7).astype(float) * 0.4
        scores += (df.get("blood_glucose_fasting", pd.Series([90]*len(df))) >= 100).astype(float) * 0.3
        scores += (df.get("bmi", pd.Series([22]*len(df))) >= 25).astype(float) * 0.15
    elif condition == "hypertension":
        scores += (df.get("systolic_bp", pd.Series([120]*len(df))) >= 130).astype(float) * 0.45
        scores += (df.get("diastolic_bp", pd.Series([80]*len(df))) >= 85).astype(float) * 0.3
        scores += (df.get("bmi", pd.Series([22]*len(df))) >= 30).astype(float) * 0.1
    elif condition == "cvd":
        scores += (df.get("age", pd.Series([40]*len(df))) >= 55).astype(float) * 0.25
        scores += (df.get("smoking_status", pd.Series([0]*len(df))) == 2).astype(float) * 0.25
        scores += (df.get("cholesterol_total", pd.Series([180]*len(df))) >= 200).astype(float) * 0.2
        scores += (df.get("systolic_bp", pd.Series([120]*len(df))) >= 140).astype(float) * 0.2
    return scores.clip(0, 1)


def _rule_based_single(patient: Dict, condition: str) -> float:
    """Rule-based single-patient fallback score."""
    score = 0.0
    if condition == "diabetes":
        if float(patient.get("hba1c", 5.5)) >= 5.7:   score += 0.4
        if float(patient.get("blood_glucose_fasting", 90)) >= 100: score += 0.3
        if float(patient.get("bmi", 22)) >= 25:        score += 0.15
    elif condition == "hypertension":
        if float(patient.get("systolic_bp", 120)) >= 130: score += 0.45
        if float(patient.get("diastolic_bp", 80)) >= 85:  score += 0.3
        if float(patient.get("bmi", 22)) >= 30:           score += 0.1
    elif condition == "cvd":
        if float(patient.get("age", 40)) >= 55:           score += 0.25
        if str(patient.get("smoking_status", "0")) in ("2", "current", "yes"): score += 0.25
        if float(patient.get("cholesterol_total", 180)) >= 200: score += 0.2
        if float(patient.get("systolic_bp", 120)) >= 140: score += 0.2
    return min(score, 1.0)
