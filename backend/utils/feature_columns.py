"""
ML Feature columns expected from the hospital's CSV dataset.
These are the features used to train and run predictions.
"""

# Numeric features used by the ML models
NUMERIC_FEATURES = [
    "age",
    "bmi",
    "systolic_bp",
    "diastolic_bp",
    "blood_glucose_fasting",
    "hba1c",
    "cholesterol_total",
]

# Binary / categorical features (encoded as integers)
CATEGORICAL_FEATURES = [
    "gender_encoded",        # 0=Female, 1=Male
    "smoking_status",        # 0=Never, 1=Former, 2=Current
    "physical_activity",     # 0=Sedentary, 1=Moderate, 2=Active
    "family_history_diabetes",
    "family_history_hypertension",
    "family_history_cvd",
    "food_security",
    "income_level_encoded",  # 0=Low, 1=Medium, 2=High
    "housing_status_encoded", # 0=Homeless, 1=Unstable, 2=Stable
]

ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# Required columns in the uploaded CSV (raw)
REQUIRED_CSV_COLUMNS = [
    "name", "age", "gender",
]

# Optional but important columns
OPTIONAL_CSV_COLUMNS = [
    "patient_id", "weight_kg", "height_cm", "bmi",
    "systolic_bp", "diastolic_bp",
    "blood_glucose_fasting", "hba1c", "cholesterol_total",
    "smoking_status", "physical_activity",
    "family_history_diabetes", "family_history_hypertension", "family_history_cvd",
    "income_level", "food_security", "housing_status", "ward", "last_visit_date", "asha_worker_id",
]

# Human-readable labels for SHAP feature explanations
FEATURE_DISPLAY_NAMES = {
    "age": "Age",
    "bmi": "BMI",
    "systolic_bp": "Systolic BP",
    "diastolic_bp": "Diastolic BP",
    "blood_glucose_fasting": "Fasting Blood Glucose",
    "hba1c": "HbA1c (%)",
    "cholesterol_total": "Total Cholesterol",
    "gender_encoded": "Gender",
    "smoking_status": "Smoking Status",
    "physical_activity": "Physical Activity",
    "family_history_diabetes": "Family Hx: Diabetes",
    "family_history_hypertension": "Family Hx: Hypertension",
    "family_history_cvd": "Family Hx: CVD",
    "food_security": "Food Security",
    "income_level_encoded": "Income Level",
    "housing_status_encoded": "Housing",
}

# Clinical thresholds for readable SHAP labels
def get_feature_display_value(feature: str, value: float) -> str:
    """Returns a human-readable string for a feature value."""
    if feature == "bmi":
        label = "Obese" if value >= 30 else ("Overweight" if value >= 25 else "Normal")
        return f"BMI {value:.1f} ({label})"
    elif feature == "systolic_bp":
        label = "Hypertensive" if value >= 140 else ("Elevated" if value >= 130 else "Normal")
        return f"Systolic BP {int(value)} ({label})"
    elif feature == "blood_glucose_fasting":
        label = "Diabetic" if value >= 126 else ("Prediabetic" if value >= 100 else "Normal")
        return f"Fasting Glucose {value:.0f} mg/dL ({label})"
    elif feature == "hba1c":
        label = "Diabetic" if value >= 6.5 else ("Prediabetic" if value >= 5.7 else "Normal")
        return f"HbA1c {value:.1f}% ({label})"
    elif feature == "smoking_status":
        labels = {0: "Non-Smoker", 1: "Former Smoker", 2: "Current Smoker"}
        return labels.get(int(value), f"Smoking Status {value}")
    elif feature == "physical_activity":
        labels = {0: "Sedentary", 1: "Moderately Active", 2: "Active"}
        return labels.get(int(value), f"Activity Level {value}")
    elif feature == "age":
        return f"Age {int(value)} years"
    elif feature == "family_history_diabetes":
        return "Family History: Diabetes" if value else "No Family Hx: Diabetes"
    elif feature == "family_history_hypertension":
        return "Family History: Hypertension" if value else "No Family Hx: Hypertension"
    elif feature == "family_history_cvd":
        return "Family History: CVD" if value else "No Family Hx: CVD"
    elif feature == "housing_status_encoded":
        labels = {0: "Homeless", 1: "Unstable Housing", 2: "Stable Housing"}
        return labels.get(int(value), f"Housing {value}")
    else:
        name = FEATURE_DISPLAY_NAMES.get(feature, feature.replace("_", " ").title())
        return f"{name}: {value}"
