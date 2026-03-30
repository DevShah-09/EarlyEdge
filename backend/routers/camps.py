"""
ROUTER: camps.py
================
Endpoints:
  GET  /api/camps               — list upcoming + past screening camps
  GET  /api/camps/plan          — generate ward-level camp recommendations
  POST /api/camps               — create / schedule a new camp

Camp Plan Logic (GET /camps/plan):
1. Aggregate patients by ward from Supabase
2. For each ward: count high-risk patients, compute NNS, recommend camp count
   - Recommended camps = ceil(high_risk_count / 15)
   - NNS = total_patients / high_risk_count
3. Suggest appropriate screenings per condition mix in that ward
   - Diabetes-heavy wards → Blood Glucose, HbA1c
   - HTN-heavy wards → BP Check, ECG
   - CVD-heavy wards → Lipid Panel, ECG, BP
4. Return WardCampPlan[] sorted by high_risk_count desc

NNS (Number Needed to Screen) note:
- Lower NNS = more efficient targeting (fewer healthy people screened per case found)
- Used to demonstrate resource optimization ROI to hospital administrators

DB tables used:
- patients          — ward + risk_tier for aggregation
- screening_camps   — upcoming and past camps
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.camps import CampPlanResponse, CampsListResponse, CreateCampRequest, CampSchedule

router = APIRouter(prefix="/camps", tags=["Screening Camps"])


@router.get("/plan", response_model=CampPlanResponse)
async def get_camp_plan(
    month: Optional[str] = Query(None, description="Format: YYYY-MM, e.g. 2025-04"),
    ward: Optional[str] = None,
):
    """
    Generates ward-level screening camp recommendations based on current
    risk distribution. Returns NNS metric and suggested screenings per ward.
    """
    # TODO: implement via services/camps_service.py
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("", response_model=CampsListResponse)
async def list_camps():
    """Returns all upcoming and past screening camps."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("", response_model=CampSchedule)
async def create_camp(body: CreateCampRequest):
    """Schedule a new screening camp for a ward."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
