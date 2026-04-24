"""
Data Preprocessor — Upgraded
==============================
Cleans, encodes, and feature-engineers raw patient data for the ML models.
Supports both batch DataFrame input (from CSV uploads) and single-patient
dict input (from the /api/predict-risk REST endpoint).
"""
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
from backend.utils.feature_columns import ALL_FEATURES, REQUIRED_CSV_COLUMNS

# Known wards — label encode in a fixed order so models are consistent
KNOWN_WARDS = [
    "Ward 01", "Ward 02", "Ward 03", "Ward 04", "Ward 05",
    "Ward 06", "Ward 07", "Ward 08", "Ward 09", "Ward 10",
    "Ward 11", "Ward 12", "Ward 13", "Ward 14", "Ward 15",
    "Ward 16", "Ward 17", "Ward 18", "Ward 19", "Ward 20",
    "Ward 21", "Ward 22", "Ward 23", "Ward 24", "Ward 25",
]
WARD_MAP = {w: i for i, w in enumerate(KNOWN_WARDS)}

SMOKING_MAP = {
    "never": 0, "non-smoker": 0, "non smoker": 0, "no": 0, "0": 0,
    "former": 1, "ex-smoker": 1, "ex smoker": 1, "1": 1,
    "current": 2, "yes": 2, "smoker": 2, "2": 2,
}


def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str]]:
    """Validates that the DataFrame has required columns."""
    missing = [col for col in REQUIRED_CSV_COLUMNS if col not in df.columns]
    return len(missing) == 0, missing


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans and engineers features from raw hospital CSV data (batch mode).
    Returns a DataFrame ready for ML prediction.
    """
    df = df.copy()

    # BMI from weight/height if missing
    if "bmi" not in df.columns or df["bmi"].isnull().all():
        if "weight_kg" in df.columns and "height_cm" in df.columns:
            df["bmi"] = df["weight_kg"] / ((df["height_cm"] / 100) ** 2)

    # Gender encoding
    if "gender" in df.columns:
        df["gender_encoded"] = (
            df["gender"].astype(str).str.upper().str.strip()
            .map({"M": 1, "MALE": 1, "F": 0, "FEMALE": 0})
            .fillna(0)
        )
    else:
        df["gender_encoded"] = 0

    # Smoking status encoding (handle both strings and ints)
    if "smoking_status" in df.columns:
        raw = df["smoking_status"].astype(str).str.strip().str.lower()
        df["smoking_status"] = raw.map(SMOKING_MAP).fillna(
            pd.to_numeric(df["smoking_status"], errors="coerce").fillna(0)
        ).astype(int)
    else:
        df["smoking_status"] = 0

    # Income level encoding
    if "income_level" in df.columns:
        df["income_level_encoded"] = (
            df["income_level"].astype(str).str.lower()
            .map({"low": 0, "medium": 1, "med": 1, "high": 2})
            .fillna(1)
        )
    else:
        df["income_level_encoded"] = 1

    # Housing status encoding
    if "housing_status" in df.columns:
        df["housing_status_encoded"] = (
            df["housing_status"].astype(str).str.lower()
            .map({"homeless": 0, "unstable": 1, "stable": 2})
            .fillna(2)
        )
    else:
        df["housing_status_encoded"] = 2

    # Fill missing numeric values
    defaults = {
        "age": 40, "bmi": 22.0,
        "systolic_bp": 120, "diastolic_bp": 80,
        "blood_glucose_fasting": 90.0, "hba1c": 5.5,
        "cholesterol_total": 180.0, "smoking_status": 0,
        "physical_activity": 1,
        "family_history_diabetes": 0,
        "family_history_hypertension": 0,
        "family_history_cvd": 0,
        "food_security": 1,
        "income_level_encoded": 1,
        "gender_encoded": 0,
        "housing_status_encoded": 2,
    }
    for col, val in defaults.items():
        if col not in df.columns:
            df[col] = val
        else:
            df[col] = df[col].fillna(val)

    # Clamp clinical ranges
    df["age"]                   = df["age"].clip(0, 120)
    df["bmi"]                   = df["bmi"].clip(10, 70)
    df["systolic_bp"]           = df["systolic_bp"].clip(60, 240)
    df["diastolic_bp"]          = df["diastolic_bp"].clip(40, 160)
    df["blood_glucose_fasting"] = df["blood_glucose_fasting"].clip(40, 600)
    df["hba1c"]                 = df["hba1c"].clip(3.0, 20.0)
    df["cholesterol_total"]     = df["cholesterol_total"].clip(50, 500)

    return df


def preprocess_single(patient: Dict[str, Any]) -> pd.DataFrame:
    """
    Converts a single patient dict (from the REST API) into a one-row
    preprocessed DataFrame ready for ML inference.
    """
    # Normalise smoking_status to int
    raw_smoke = str(patient.get("smoking_status", "never")).strip().lower()
    smoking_int = SMOKING_MAP.get(raw_smoke, 0)

    # Normalise gender
    raw_gender = str(patient.get("gender", "M")).strip().upper()
    gender_int = 1 if raw_gender in ("M", "MALE") else 0

    row = {
        "age":                      float(patient.get("age", 40)),
        "bmi":                      float(patient.get("bmi", 22.0)),
        "systolic_bp":              float(patient.get("systolic_bp", 120)),
        "diastolic_bp":             float(patient.get("diastolic_bp", 80)),
        "blood_glucose_fasting":    float(patient.get("blood_glucose_fasting", 90)),
        "hba1c":                    float(patient.get("hba1c", 5.5)),
        "cholesterol_total":        float(patient.get("cholesterol_total", 180)),
        "gender_encoded":           float(gender_int),
        "smoking_status":           float(smoking_int),
        "physical_activity":        float(patient.get("physical_activity", 1)),
        "family_history_diabetes":  float(patient.get("family_history_diabetes", 0)),
        "family_history_hypertension": float(patient.get("family_history_hypertension", 0)),
        "family_history_cvd":       float(patient.get("family_history_cvd", 0)),
        "food_security":            float(patient.get("food_security", 1)),
        "income_level_encoded":     float(patient.get("income_level_encoded", 1)),
        "housing_status_encoded":   float(patient.get("housing_status_encoded", 2)),
    }

    df = pd.DataFrame([row])
    # Clamp
    df["age"]                   = df["age"].clip(0, 120)
    df["bmi"]                   = df["bmi"].clip(10, 70)
    df["systolic_bp"]           = df["systolic_bp"].clip(60, 240)
    df["diastolic_bp"]          = df["diastolic_bp"].clip(40, 160)
    df["blood_glucose_fasting"] = df["blood_glucose_fasting"].clip(40, 600)
    df["hba1c"]                 = df["hba1c"].clip(3.0, 20.0)
    df["cholesterol_total"]     = df["cholesterol_total"].clip(50, 500)

    return df[ALL_FEATURES]


def get_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Returns only the columns needed by the ML models."""
    df = preprocess(df)
    return df[ALL_FEATURES]
