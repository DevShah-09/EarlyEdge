"""
Pydantic schemas for the /api/predict-risk endpoint.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class RiskInput(BaseModel):
    age: float = Field(..., ge=0, le=120, description="Patient age in years")
    gender: str = Field(default="M", description="M or F")
    ward: Optional[str] = Field(default=None, description="Ward name e.g. 'Ward 04'")
    systolic_bp: float = Field(default=120, ge=60, le=240, description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(default=80, ge=40, le=160, description="Diastolic blood pressure (mmHg)")
    blood_glucose_fasting: float = Field(default=90, ge=40, le=600, description="Fasting blood glucose (mg/dL)")
    hba1c: float = Field(default=5.5, ge=3.0, le=20.0, description="HbA1c percentage")
    cholesterol_total: float = Field(default=180, ge=50, le=500, description="Total cholesterol (mg/dL)")
    bmi: float = Field(default=22.0, ge=10, le=70, description="Body Mass Index")
    smoking_status: str = Field(default="never", description="never | former | current")

    # Optional enrichment fields
    physical_activity: Optional[int] = Field(default=1, description="0=Sedentary, 1=Moderate, 2=Active")
    family_history_diabetes: Optional[int] = Field(default=0, description="0=No, 1=Yes")
    family_history_hypertension: Optional[int] = Field(default=0, description="0=No, 1=Yes")
    family_history_cvd: Optional[int] = Field(default=0, description="0=No, 1=Yes")
    food_security: Optional[int] = Field(default=1, description="0=Insecure, 1=Secure")
    income_level_encoded: Optional[int] = Field(default=1, description="0=Low, 1=Medium, 2=High")
    housing_status_encoded: Optional[int] = Field(default=2, description="0=Homeless, 1=Unstable, 2=Stable")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 55,
                "gender": "M",
                "ward": "Ward 04",
                "systolic_bp": 165,
                "diastolic_bp": 105,
                "blood_glucose_fasting": 185,
                "hba1c": 8.5,
                "cholesterol_total": 245,
                "bmi": 36.0,
                "smoking_status": "current",
                "family_history_diabetes": 1
            }
        }


class ConditionScores(BaseModel):
    diabetes: float
    hypertension: float
    cvd: float


class RiskOutput(BaseModel):
    high_risk: bool
    risk_score: float = Field(description="Probability 0.0–1.0")
    risk_percent: int = Field(description="Risk score as percentage 0–100")
    risk_level: str = Field(description="Normal | Moderate | High | Critical")
    top_factors: List[str]
    condition_scores: ConditionScores
    rule_triggered: List[str] = Field(description="Clinical thresholds exceeded")
    explanation: str
