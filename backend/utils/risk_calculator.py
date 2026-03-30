"""
Risk Calculator Utility
=======================
Standalone helper functions for computing risk-related aggregates,
tier thresholds, and primary condition labels.
Used across routers and services without importing ML models directly.
"""
from typing import Dict, List


RISK_THRESHOLDS = {
    "High": 70.0,
    "Medium": 40.0,
    "Low": 0.0,
}


def score_to_tier(score: float) -> str:
    """Convert a 0-100 risk score to a tier string."""
    if score >= RISK_THRESHOLDS["High"]:
        return "High"
    elif score >= RISK_THRESHOLDS["Medium"]:
        return "Medium"
    return "Low"


def get_primary_condition(diabetes: float, hypertension: float, cvd: float) -> str:
    """
    Returns the condition with the highest risk score, formatted for display.
    e.g., "Diabetes + HTN" if both are above threshold.
    """
    scores = {
        "Diabetes": diabetes,
        "Hypertension": hypertension,
        "CVD": cvd,
    }
    high_conditions = [k for k, v in scores.items() if v >= RISK_THRESHOLDS["High"]]

    if len(high_conditions) >= 2:
        # Abbreviate for display
        abbrev = {"Hypertension": "HTN", "Diabetes": "DM", "CVD": "CVD"}
        return " + ".join(abbrev.get(c, c) for c in high_conditions[:2])
    elif high_conditions:
        return high_conditions[0]

    # No high-risk — return the highest overall
    return max(scores, key=scores.get)


def compute_risk_distribution(risk_scores: List[float]) -> Dict:
    """
    Given a list of overall_risk scores, compute tier counts and percentages.
    Returns: { high, medium, low, high_pct, medium_pct, low_pct }
    """
    total = len(risk_scores)
    if total == 0:
        return {"high": 0, "medium": 0, "low": 0, "high_pct": 0, "medium_pct": 0, "low_pct": 0}

    high = sum(1 for s in risk_scores if s >= RISK_THRESHOLDS["High"])
    medium = sum(1 for s in risk_scores if RISK_THRESHOLDS["Medium"] <= s < RISK_THRESHOLDS["High"])
    low = total - high - medium

    return {
        "high": high,
        "medium": medium,
        "low": low,
        "high_pct": round(high / total * 100, 1),
        "medium_pct": round(medium / total * 100, 1),
        "low_pct": round(low / total * 100, 1),
    }


def recommended_camps(high_risk_count: int, patients_per_camp: int = 15) -> int:
    """
    Calculate number of screening camps recommended for a ward.
    Rule: 1 camp per 15 high-risk patients (configurable).
    """
    import math
    return math.ceil(high_risk_count / patients_per_camp) if high_risk_count > 0 else 0
