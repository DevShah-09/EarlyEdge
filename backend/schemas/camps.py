"""
SCHEMA: camps.py
================
Pydantic models for the Screening Camp Planner feature.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class WardCampPlan(BaseModel):
    ward: str
    total_patients: int
    high_risk_count: int
    medium_risk_count: int
    recommended_camps: int
    number_needed_to_screen: Optional[float] = None    # NNS = total / high_risk  (resource efficiency KPI)
    coverage_percent: float
    suggested_screenings: List[str]   # ["Blood Glucose", "BP Check", "BMI", "Lipid Panel"]
    estimated_patients_per_camp: int


class CampSchedule(BaseModel):
    camp_id: Optional[str] = None
    ward: str
    start_date: date
    end_date: date
    target_patient_count: int
    status: str = "Planned"           # "Planned", "Active", "Completed"
    venue: Optional[str] = None
    staff_required: Optional[dict] = None   # { "doctors": 2, "nurses": 3, "ashas": 5 }
    screenings: List[str] = []
    estimated_cost: Optional[float] = None  # in INR
    actual_screened: Optional[int] = None   # filled after camp completion
    high_risk_detected: Optional[int] = None


class CampPlanResponse(BaseModel):
    month: str
    total_high_risk: int
    total_recommended_camps: int
    ward_plans: List[WardCampPlan]


class CampsListResponse(BaseModel):
    upcoming: List[CampSchedule]
    past: List[CampSchedule]
    total_upcoming: int
    total_past: int


class CreateCampRequest(BaseModel):
    ward: str
    start_date: date
    end_date: date
    venue: Optional[str] = None
    target_patient_count: int
    screenings: List[str]
