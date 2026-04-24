from pydantic import BaseModel
from typing import List, Dict


class KPICard(BaseModel):
    total_patients: int
    high_risk_count: int
    high_risk_percent: float
    medium_risk_count: int
    low_risk_count: int
    pending_asha_tasks: int
    upcoming_camps: int
    new_this_week: int


class RiskDistribution(BaseModel):
    high: int
    medium: int
    low: int
    high_pct: float
    medium_pct: float
    low_pct: float


class ConditionBreakdown(BaseModel):
    condition: str
    high_risk: int
    medium_risk: int
    low_risk: int


class TrendPoint(BaseModel):
    month: str
    diabetes: int
    hypertension: int
    cvd: int


class WardRiskSummary(BaseModel):
    ward: str
    total_patients: int
    high_risk: int
    recommended_camps: int


class MLModelMetric(BaseModel):
    condition: str
    best_model: str
    accuracy: float
    recall: float


class DashboardResponse(BaseModel):
    kpis: KPICard
    risk_distribution: RiskDistribution
    condition_breakdown: List[ConditionBreakdown]
    monthly_trend: List[TrendPoint]
    ward_summary: List[WardRiskSummary]
    ml_metrics: List[MLModelMetric] = []
