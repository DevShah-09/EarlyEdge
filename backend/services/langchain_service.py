"""
SERVICE: langchain_service.py
==============================
Handles LangChain / LLM calls for generating personalized 30-day action plans.

LLM Setup:
- Primary: OpenAI GPT-4o via langchain-openai (ChatOpenAI)
- Fallback: Rule-based template if OPENAI_API_KEY not set

Prompt Design:
- System: Clinical decision support assistant for NCD prevention in India.
          Output must be structured as JSON with 4 ActionStep objects (one per week).
- User:   Structured patient summary including age, gender, risk scores,
          top SHAP factors, SDOH context, and current medications (if known).

Output format (JSON):
{
  "plan_steps": [
    {
      "week": 1,
      "title": "Week 1: Lifestyle Foundation",
      "type": "lifestyle",
      "goal": "Reduce fasting glucose below 110 mg/dL",
      "actions": [
        "Walk 30 minutes every morning",
        "Reduce refined carbohydrates (rice, maida) by 50%",
        "Drink 2-3 liters of water daily"
      ]
    },
    ...
  ]
}

Caching: Caller (router) checks action_plans table before calling this service.
"""
import os
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def build_patient_prompt(patient_data: dict) -> str:
    """
    Builds the user-facing LangChain prompt from patient data.
    patient_data should include: name, age, gender, risk scores,
    top_factors (list of display_label strings), income_level, food_security.
    """
    name = patient_data.get("name", "Patient")
    age = patient_data.get("age", "Unknown")
    gender = patient_data.get("gender", "Unknown")
    diabetes = patient_data.get("diabetes_risk", 0)
    hypertension = patient_data.get("hypertension_risk", 0)
    cvd = patient_data.get("cvd_risk", 0)
    factors = patient_data.get("top_factors", [])
    income = patient_data.get("income_level", "Medium")
    food_secure = patient_data.get("food_security", 1)

    factor_text = "\n".join(f"- {f}" for f in factors) if factors else "- No specific factors identified"
    food_note = "has food insecurity (limited access to healthy food)" if not food_secure else "has adequate food access"

    return f"""
Patient: {name}, {age} years old, {gender}

Risk Scores:
- Diabetes Risk: {diabetes:.1f}%
- Hypertension Risk: {hypertension:.1f}%
- CVD Risk: {cvd:.1f}%

Top Risk Factors:
{factor_text}

Social Context:
- Income Level: {income}
- Patient {food_note}

Generate a personalized, culturally appropriate 30-day action plan for this patient
to reduce their NCD risk. Focus on practical, affordable interventions that work
in an Indian primary healthcare setting. Format your response as JSON.
""".strip()


async def generate_action_plan(patient_data: dict) -> Optional[dict]:
    """
    Calls LangChain LLM to generate a 30-day action plan.
    Returns parsed dict with plan_steps, or None if LLM unavailable.
    """
    if not OPENAI_API_KEY:
        return _rule_based_fallback_plan(patient_data)

    try:
        from langchain_openai import ChatOpenAI
        from langchain.schema import SystemMessage, HumanMessage

        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=OPENAI_API_KEY)

        system_msg = SystemMessage(content=(
            "You are a clinical decision support assistant specializing in NCD prevention "
            "in Indian primary healthcare. Generate structured, evidence-based, culturally "
            "appropriate 30-day action plans. Always respond with valid JSON only."
        ))
        user_msg = HumanMessage(content=build_patient_prompt(patient_data))

        response = await llm.ainvoke([system_msg, user_msg])
        plan_json = json.loads(response.content)
        return plan_json

    except Exception as e:
        print(f"LangChain call failed: {e}. Using fallback plan.")
        return _rule_based_fallback_plan(patient_data)


def _rule_based_fallback_plan(patient_data: dict) -> dict:
    """
    Returns a generic but structured 4-week plan when LLM is unavailable.
    Tailored by dominant condition (diabetes / hypertension / CVD).
    """
    diabetes = patient_data.get("diabetes_risk", 0)
    hypertension = patient_data.get("hypertension_risk", 0)
    cvd = patient_data.get("cvd_risk", 0)

    if diabetes >= max(hypertension, cvd):
        condition_focus = "blood sugar control"
        week1_actions = ["Reduce sugary foods and refined carbohydrates", "Walk 30 minutes daily", "Monitor blood sugar weekly"]
        week2_actions = ["Follow low-glycaemic diet (millets, vegetables)", "Avoid fried foods", "Schedule HbA1c test"]
    elif hypertension >= cvd:
        condition_focus = "blood pressure management"
        week1_actions = ["Reduce salt intake to <5g/day", "Avoid processed foods", "Practice deep breathing 10 min/day"]
        week2_actions = ["Increase potassium-rich foods (banana, spinach)", "Walk 30 min daily", "Monitor BP every 3 days"]
    else:
        condition_focus = "cardiovascular health"
        week1_actions = ["Quit smoking — contact helpline 1800-112-356", "Reduce saturated fats", "Walk 20 min daily"]
        week2_actions = ["Add omega-3 foods (fish, flaxseed)", "Learn stress management", "Get lipid panel done"]

    return {
        "plan_steps": [
            {
                "week": 1, "type": "lifestyle", "title": f"Week 1: Starting {condition_focus.title()}",
                "goal": "Establish daily healthy habits", "actions": week1_actions
            },
            {
                "week": 2, "type": "lifestyle", "title": "Week 2: Diet & Activity Improvements",
                "goal": "Strengthen dietary changes", "actions": week2_actions
            },
            {
                "week": 3, "type": "screening", "title": "Week 3: Clinical Check-in",
                "goal": "Assess progress with lab values",
                "actions": ["Visit clinic for progress check", "Repeat key lab tests", "Review medication adherence if applicable"]
            },
            {
                "week": 4, "type": "followup", "title": "Week 4: Review & Next Steps",
                "goal": "Reinforce gains and plan next month",
                "actions": ["Review all habit changes made this month", "Set new measurable goals for next 30 days", "Schedule ASHA follow-up visit"]
            },
        ]
    }
