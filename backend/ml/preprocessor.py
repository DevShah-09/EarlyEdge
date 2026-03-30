"""
Data preprocessor: cleans and feature-engineers raw CSV data
before passing to the ML models.
"""
import pandas as pd
import numpy as np
from typing import Tuple, List
from utils.feature_columns import ALL_FEATURES, REQUIRED_CSV_COLUMNS


def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """
    Validates that the DataFrame has required columns.
    Returns (is_valid, list_of_missing_columns).
    """
    missing = [col for col in REQUIRED_CSV_COLUMNS if col not in df.columns]
    return len(missing) == 0, missing


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and engineers features from raw hospital CSV data.
    Returns a DataFrame ready for ML prediction.
    """
    df = df.copy()

    # ── BMI calculation if missing ──────────────────────────────
    if "bmi" not in df.columns or df["bmi"].isnull().all():
        if "weight_kg" in df.columns and "height_cm" in df.columns:
            df["bmi"] = df["weight_kg"] / ((df["height_cm"] / 100) ** 2)

    # ── Gender encoding ─────────────────────────────────────────
    if "gender" in df.columns:
        df["gender_encoded"] = df["gender"].str.upper().map({"M": 1, "F": 0}).fillna(0)
    else:
        df["gender_encoded"] = 0

    # ── Income level encoding ───────────────────────────────────
    if "income_level" in df.columns:
        income_map = {"low": 0, "medium": 1, "high": 2, "med": 1}
        df["income_level_encoded"] = (
            df["income_level"].str.lower().map(income_map).fillna(1)
        )
    else:
        df["income_level_encoded"] = 1

    # ── Fill missing numeric values with clinical safe defaults ─
    defaults = {
        "age": 40,
        "bmi": 22.0,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "blood_glucose_fasting": 90.0,
        "hba1c": 5.5,
        "cholesterol_total": 180.0,
        "smoking_status": 0,
        "physical_activity": 1,
        "family_history_diabetes": 0,
        "family_history_hypertension": 0,
        "family_history_cvd": 0,
        "food_security": 1,
        "income_level_encoded": 1,
        "gender_encoded": 0,
    }
    for col, default_val in defaults.items():
        if col not in df.columns:
            df[col] = default_val
        else:
            df[col] = df[col].fillna(default_val)

    # ── Clamp values to reasonable clinical ranges ──────────────
    df["age"] = df["age"].clip(0, 120)
    df["bmi"] = df["bmi"].clip(10, 70)
    df["systolic_bp"] = df["systolic_bp"].clip(60, 240)
    df["blood_glucose_fasting"] = df["blood_glucose_fasting"].clip(40, 600)
    df["hba1c"] = df["hba1c"].clip(3.0, 20.0)

    return df


def get_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns only the columns needed by the ML models.
    """
    df = preprocess(df)
    return df[ALL_FEATURES]
