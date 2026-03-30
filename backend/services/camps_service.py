"""
SERVICE: camps_service.py
==========================
Business logic for the Screening Camp Planner feature.

Ward Aggregation Logic:
1. Group patients by ward (Supabase GROUP BY ward)
2. For each ward:
   - total_patients = count(*)
   - high_risk_count = count(*) WHERE risk_tier = 'High'
   - medium_risk_count = count(*) WHERE risk_tier = 'Medium'
   - Coverage %: patients reachable in a camp / high_risk_count * 100
3. recommended_camps = ceil(high_risk_count / PATIENTS_PER_CAMP)
4. NNS = total_patients / high_risk_count (lower = better targeting)
5. suggested_screenings = determined by condition_mix in that ward
   (if >50% diabetes-risk → add "HbA1c", if >50% cvd-risk → add "ECG", etc.)

NNS Interpretation:
- NNS < 3: Excellent targeting — very efficient use of camp resources
- NNS 3–6: Good targeting
- NNS > 6: Consider more specific outreach before running a camp

PATIENTS_PER_CAMP: 15 (configurable via env var CAMP_CAPACITY)
"""
import os
import math
from typing import List
from database import get_supabase
from schemas.camps import WardCampPlan

PATIENTS_PER_CAMP = int(os.getenv("CAMP_CAPACITY", 15))


def get_suggested_screenings(ward_data: dict) -> List[str]:
    """
    Recommends screenings based on condition risk distribution in a ward.
    Always includes BP + BMI as baseline. Adds condition-specific tests.
    """
    screenings = ["Blood Pressure Check", "BMI Measurement"]

    diabetes_rate = ward_data.get("diabetes_high_rate", 0)
    cvd_rate = ward_data.get("cvd_high_rate", 0)
    htn_rate = ward_data.get("htn_high_rate", 0)

    if diabetes_rate > 0.3:
        screenings += ["Fasting Blood Glucose", "HbA1c Test"]
    if cvd_rate > 0.3:
        screenings += ["Lipid Panel", "ECG"]
    if htn_rate > 0.3:
        screenings.append("24-hour BP Monitoring")

    return list(dict.fromkeys(screenings))   # Deduplicate, preserve order


async def generate_camp_plan(month: str = None, ward: str = None) -> List[WardCampPlan]:
    """
    Aggregates patient risk data by ward and returns camp recommendations.
    """
    # TODO: implement full DB aggregation
    # db = get_supabase()
    # result = db.table("patients").select("ward, risk_tier, diabetes_risk, cvd_risk, hypertension_risk").execute()
    # ... aggregate by ward, compute NNS, recommended_camps, suggested_screenings
    return []
