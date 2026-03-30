"""
SCHEMA: action_plan.py
======================
Pydantic models for LangChain-generated 30-day action plans.
"""
from pydantic import BaseModel
from typing import List, Optional


class ActionStep(BaseModel):
    week: int                    # 1, 2, 3, or 4
    title: str                   # e.g., "Week 1: Lifestyle Foundation"
    type: str                    # "lifestyle" | "screening" | "medication" | "followup"
    actions: List[str]           # Specific actionable steps
    goal: Optional[str] = None   # Measurable goal for the week


class ActionPlanResponse(BaseModel):
    patient_id: str
    patient_name: str
    overall_risk: float
    risk_tier: str
    primary_conditions: List[str]
    top_risk_factors: List[str]  # Plain text labels
    plan_steps: List[ActionStep]
    generated_at: Optional[str] = None
    is_cached: bool = False      # True if fetched from DB, False if freshly generated
    full_plan_text: Optional[str] = None   # Raw LangChain output (for debugging)
