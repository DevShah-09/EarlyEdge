"""
ROUTER: action_plans.py
=======================
Endpoint: GET /api/action-plans/:patient_id?regenerate=false

Generates or retrieves a personalized 30-day action plan for a patient.

Flow:
1. Load patient record + risk scores from Supabase
2. Check if a cached plan exists in action_plans table (and regenerate=False)
   - If cached and fresh (< 7 days old) → return cached plan
3. Build LangChain prompt with:
   - Patient age, gender, risk scores per condition
   - Top 3 SHAP risk factors (human-readable labels)
   - SDOH context (income, food security)
4. Call LangChain → LLM generates structured 4-week plan
5. Parse LLM response into ActionStep objects
6. Save plan to action_plans table with patient_id + generated_at timestamp
7. Return ActionPlanResponse

LangChain details:
- Uses ChatOpenAI (GPT-4o) or Gemini via langchain-google-genai
- System prompt: "You are a clinical decision support assistant..."
- User prompt: structured patient summary with specific output format
- Output parser: structured JSON format for week-by-week steps

DB tables used:
- patients           — patient data + risk scores
- action_plans       — cached plan storage (patient_id, plan_json, generated_at)
"""
from fastapi import APIRouter, Query, HTTPException
from schemas.action_plan import ActionPlanResponse

router = APIRouter(prefix="/action-plans", tags=["Action Plans"])


@router.get("/{patient_id}", response_model=ActionPlanResponse)
async def get_action_plan(patient_id: str, regenerate: bool = Query(False)):
    """
    Returns the 30-day LangChain-generated action plan for a patient.
    If regenerate=True, bypasses cache and calls LLM fresh.
    """
    # TODO: implement via services/langchain_service.py
    raise HTTPException(status_code=501, detail="Not implemented yet")
