"""
Risk Prediction Router
======================
Exposes POST /api/predict-risk which accepts a single patient's vitals
and returns ML-based risk scores, condition breakdown, top factors,
and a clinical explanation.
"""
from fastapi import APIRouter, HTTPException
from backend.schemas.risk_schemas import RiskInput, RiskOutput
from backend.ml.predictor import predict_single

router = APIRouter(tags=["Risk Prediction"])


@router.post(
    "/predict-risk",
    response_model=RiskOutput,
    summary="Predict NCD risk for a single patient",
    description=(
        "Accepts patient vitals (age, BMI, BP, HbA1c, etc.) and returns "
        "ML-based probability scores for Diabetes, Hypertension, and CVD, "
        "a composite risk level, and the top contributing clinical factors."
    ),
)
async def predict_risk(payload: RiskInput) -> RiskOutput:
    try:
        result = predict_single(payload.model_dump())
        return RiskOutput(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
