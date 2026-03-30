"""
SHAP Explainer Module
=====================
Generates SHAP (SHapley Additive exPlanations) values for each patient
prediction using the trained Random Forest model (TreeExplainer — fast & exact).

For each patient, returns:
- Top N SHAP factors (feature name, raw value, SHAP impact score)
- A human-readable XAI summary string
  e.g., "High risk due to BMI 31 (Obese) + Current Smoker + HbA1c 6.8%"

Used by:
- routers/patients.py (GET /patients/:id)
- routers/upload.py (batch processing — top factor per patient for table column)
"""
import shap
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict
from ml.preprocessor import get_feature_matrix
from utils.feature_columns import (
    ALL_FEATURES, FEATURE_DISPLAY_NAMES, get_feature_display_value
)

MODEL_DIR = "./ml/saved_models"


def get_shap_factors(
    patient_row: pd.Series,
    condition: str = "diabetes",
    top_n: int = 5
) -> List[Dict]:
    """
    Compute SHAP values for a single patient row for a given condition.

    Args:
        patient_row: A single row from the preprocessed DataFrame.
        condition: One of "diabetes", "hypertension", "cvd".
        top_n: Number of top factors to return.

    Returns:
        List of dicts: { feature, value, impact, display_label }
        Sorted by abs(impact) descending.
    """
    rf_path = f"{MODEL_DIR}/{condition}_rf.pkl"
    rf_model = joblib.load(rf_path)

    X = pd.DataFrame([patient_row[ALL_FEATURES]])
    explainer = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(X)

    # For binary classification, shap_values is a list [class0, class1]
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]  # positive class (at-risk)
    else:
        shap_vals = shap_values[0]

    factors = []
    for i, feature in enumerate(ALL_FEATURES):
        raw_value = float(patient_row[feature])
        impact = float(shap_vals[i])
        display_label = get_feature_display_value(feature, raw_value)
        factors.append({
            "feature": feature,
            "value": raw_value,
            "impact": round(impact, 4),
            "display_label": display_label,
        })

    # Sort by absolute impact, descending
    factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
    return factors[:top_n]


def build_xai_summary(factors: List[Dict], risk_tier: str) -> str:
    """
    Builds a human-readable explanation string from SHAP factors.
    e.g., "High risk due to BMI 31 (Obese) + Current Smoker + Systolic BP 145"
    """
    if not factors:
        return "Risk score based on patient profile."

    # Only show factors that INCREASE risk (positive SHAP impact)
    increasing = [f for f in factors if f["impact"] > 0][:3]
    decreasing = [f for f in factors if f["impact"] < 0][:1]

    parts = [f["display_label"] for f in increasing]
    summary = f"{risk_tier} risk due to " + " + ".join(parts) if parts else f"{risk_tier} risk score."

    if decreasing:
        protect = decreasing[0]["display_label"]
        summary += f". Protective factor: {protect}."

    return summary


def get_top_factor_label(patient_row: pd.Series, condition: str = "diabetes") -> str:
    """
    Returns a single short string of the top risk factor for table column display.
    e.g., "BMI 31 + Smoker"
    Used in the dashboard priority patient table — fast single-factor label.
    """
    try:
        factors = get_shap_factors(patient_row, condition, top_n=2)
        top2 = [f["display_label"].split("(")[0].strip() for f in factors[:2]]
        return " + ".join(top2)
    except Exception:
        return "—"
