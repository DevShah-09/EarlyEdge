"""
SCHEMA: simulator.py
====================
Pydantic models for the What-If risk simulation endpoint.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict


class SimulatorOverrides(BaseModel):
    """
    Intervention parameters the clinic staff can adjust.
    Only include fields that should be overridden — all are optional.
    """
    bmi: Optional[float] = Field(None, ge=10, le=70, description="Target BMI after intervention")
    weight_kg: Optional[float] = Field(None, ge=20, le=300)
    systolic_bp: Optional[int] = Field(None, ge=80, le=220)
    diastolic_bp: Optional[int] = Field(None, ge=50, le=140)
    blood_glucose_fasting: Optional[float] = Field(None, ge=40, le=600)
    hba1c: Optional[float] = Field(None, ge=3.0, le=20.0)
    smoking_status: Optional[int] = Field(None, ge=0, le=2, description="0=Never, 1=Former, 2=Current")
    physical_activity: Optional[int] = Field(None, ge=0, le=2, description="0=Sedentary, 1=Moderate, 2=Active")
    cholesterol_total: Optional[float] = Field(None, ge=100, le=500)


class SimulatorRequest(BaseModel):
    patient_id: str
    overrides: SimulatorOverrides


class RiskScoreSnapshot(BaseModel):
    diabetes_risk: float
    hypertension_risk: float
    cvd_risk: float
    overall_risk: float
    risk_tier: str


class SimulatorResponse(BaseModel):
    patient_id: str
    patient_name: str
    original: RiskScoreSnapshot
    simulated: RiskScoreSnapshot
    delta: Dict[str, float]         # e.g., { "overall_risk": -45.2, "diabetes_risk": -30.1 }
    xai_summary: str                # Human-readable: "Risk drops from 87% → 42% with BMI 26 + quit smoking"
    applied_overrides: Dict         # Echo back what was changed
