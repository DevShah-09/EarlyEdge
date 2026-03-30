"""
ROUTER: simulator.py
====================
Endpoint: POST /api/simulator

What-If Risk Simulation flow:
1. Load patient's original record from Supabase (patients table)
2. Preprocess the original record through get_feature_matrix()
3. Apply overrides (e.g., bmi=26, smoking_status=0) to the feature vector
4. Run predict_risk_scores() on BOTH original and modified vectors
5. Compute delta (simulated - original) for each condition + overall
6. Build human-readable XAI summary of the simulated change
7. Return SimulatorResponse with original, simulated, delta, and summary

Example:
  Input:  { patient_id: "P001", overrides: { bmi: 26, smoking_status: 0 } }
  Output: {
    original:  { overall_risk: 87% },
    simulated: { overall_risk: 42% },
    delta:     { overall_risk: -45.0 },
    xai_summary: "Risk drops from 87% → 42% (↓45%) with BMI 26 (Normal) + Quit Smoking"
  }

Note: Does NOT save simulation to DB — it's a read-only exploration tool.
Clinic staff can optionally "Apply to Patient Record" from the frontend,
which then updates notes in the patients table.
"""
from fastapi import APIRouter, HTTPException
from schemas.simulator import SimulatorRequest, SimulatorResponse

router = APIRouter(prefix="/simulator", tags=["Risk Simulator"])


@router.post("", response_model=SimulatorResponse)
async def simulate_risk(body: SimulatorRequest):
    """
    Runs a What-If intervention simulation for a patient.
    Returns original vs simulated risk scores and the delta.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
