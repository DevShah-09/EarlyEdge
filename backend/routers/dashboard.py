"""
ROUTER: dashboard.py
====================
Endpoint: GET /api/dashboard

Returns all data needed to render the main clinic dashboard in one call:
- KPI cards (total patients, high-risk count, pending tasks, upcoming camps)
- Risk distribution (high/medium/low counts + percentages)
- Condition breakdown per tier
- Monthly trend (last 6 months of high-risk counts per condition)
- Ward-level summary (patients per ward, high-risk, recommended camps)

Implementation notes:
- All aggregations run against the patients table in Supabase
- Monthly trend derived from created_at / last_visit_date
- Pending ASHA tasks count from asha_tasks table (status = "Pending")
- Upcoming camps from screening_camps table (start_date >= today)
- Response is cached for 5 minutes to avoid heavy DB hits on every page load
  (use a simple in-memory TTL cache or Redis if available)

DB tables used:
- patients          — all patient rows with risk_tier, risk scores, ward
- asha_tasks        — for pending task count KPI
- screening_camps   — for upcoming camps count KPI
"""
from fastapi import APIRouter, HTTPException
from schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard():
    """
    Returns all aggregated metrics for the main clinic dashboard.
    Includes KPIs, risk distribution, 6-month trend, and ward summaries.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
