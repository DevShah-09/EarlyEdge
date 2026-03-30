from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


class SHAPFactor(BaseModel):
    feature: str
    value: float
    impact: float  # positive = increases risk, negative = decreases risk
    display_label: str  # Human-readable, e.g., "BMI 31 (Obese)"


class PatientRiskScore(BaseModel):
    diabetes_risk: float = Field(..., ge=0, le=100)
    hypertension_risk: float = Field(..., ge=0, le=100)
    cvd_risk: float = Field(..., ge=0, le=100)
    overall_risk: float = Field(..., ge=0, le=100)
    risk_tier: str  # "High", "Medium", "Low"
    top_factors: List[SHAPFactor]
    xai_summary: str  # e.g., "High risk due to BMI 31 + Smoking"


class PatientBase(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    bmi: Optional[float] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_glucose_fasting: Optional[float] = None
    hba1c: Optional[float] = None
    cholesterol_total: Optional[float] = None
    smoking_status: Optional[int] = 0   # 0=Never, 1=Former, 2=Current
    physical_activity: Optional[int] = 1  # 0=Sedentary, 1=Moderate, 2=Active
    family_history_diabetes: Optional[int] = 0
    family_history_hypertension: Optional[int] = 0
    family_history_cvd: Optional[int] = 0
    income_level: Optional[str] = "Medium"
    food_security: Optional[int] = 1
    ward: Optional[str] = None
    last_visit_date: Optional[date] = None
    asha_worker_id: Optional[str] = None


class PatientWithRisk(PatientBase):
    risk_score: Optional[PatientRiskScore] = None
    upload_batch_id: Optional[str] = None


class PatientListItem(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    overall_risk: float
    risk_tier: str
    primary_condition: str
    top_factor: str
    last_visit_date: Optional[date]
    ward: Optional[str]
    asha_worker_id: Optional[str]


class PatientDetailResponse(BaseModel):
    patient: PatientWithRisk
    action_plan: Optional[str] = None
    trajectory: Optional[str] = None  # "Rapidly worsening", "Stable", "Improving"
