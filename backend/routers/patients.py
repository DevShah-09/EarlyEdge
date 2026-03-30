"""
ROUTER: patients.py
===================
Endpoints:
  GET  /api/patients            — paginated, filtered patient list
  GET  /api/patients/:id        — full patient detail
  POST /api/patients/:id/assign-asha — assign ASHA worker

Patient List (GET /patients):
- Query params: page, tier (High/Medium/Low), ward, condition, has_asha, search
- Returns: PatientListItem[] sorted by overall_risk desc
- DB: SELECT from patients with filters, paginated 50/page

Patient Detail (GET /patients/:id):
- Returns: full PatientWithRisk including:
  - All clinical fields
  - Tri-condition scores (diabetes_risk, hypertension_risk, cvd_risk)
  - SHAP factors (top 5) with display_label and impact
  - XAI summary string
  - Risk tier + trajectory
- Joins with risk_scores table (or embedded JSON in patients table)

DB tables used:
- patients
- risk_scores (or JSONB column in patients)
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from schemas.patient import PatientDetailResponse

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("")
async def list_patients(
    page: int = Query(1, ge=1),
    tier: Optional[str] = None,
    ward: Optional[str] = None,
    condition: Optional[str] = None,
    has_asha: Optional[bool] = None,
    search: Optional[str] = None,
):
    """
    Returns a paginated list of patients sorted by risk score (desc).
    Supports filtering by tier, ward, condition, ASHA assignment, and name/ID search.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{patient_id}", response_model=PatientDetailResponse)
async def get_patient(patient_id: str):
    """
    Returns full patient profile with risk scores, SHAP explanations,
    XAI summary, and risk trajectory.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{patient_id}/assign-asha")
async def assign_asha_to_patient(patient_id: str, body: dict):
    """
    Manually assigns an ASHA worker to a patient.
    Creates or updates the corresponding ASHA task record.
    Body: { asha_worker_id: str }
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
