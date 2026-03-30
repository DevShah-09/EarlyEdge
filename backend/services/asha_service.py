"""
SERVICE: asha_service.py
=========================
Business logic for ASHA task auto-assignment.

Auto-Assignment Algorithm:
1. Query all high-risk patients (overall_risk >= 70) with no assigned ASHA
2. Query all ASHA workers where active_tasks < max_capacity
3. For each unassigned patient:
   a. First try to find an ASHA in the same WARD (proximity)
   b. If none available in same ward, expand to adjacent wards
   c. Assign the ASHA with fewest current active tasks (load balance)
4. Create asha_tasks records in Supabase
5. Increment asha_workers.active_tasks count
6. Trigger n8n webhook (optional — if N8N_WEBHOOK_URL is set)

Task Creation Rules:
- task_type: "Home Visit" for High risk, "Follow-up Call" for Medium
- priority: mirrors patient risk_tier
- due_date: today + 2 days (High), today + 5 days (Medium)

n8n Webhook:
- Fires POST to N8N_WEBHOOK_URL/asha-assigned
- Payload: { task_id, patient_name, patient_ward, asha_name, asha_phone, due_date }
- n8n then routes to SMS / WhatsApp notification
"""
import os
from datetime import date, timedelta
from typing import List, Dict
from database import get_supabase

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


async def auto_assign_asha_tasks() -> Dict:
    """
    Main auto-assignment function.
    Returns summary dict: { total_assigned, assignments, unassigned }
    """
    # TODO: implement full logic
    # Steps:
    # 1. db.table("patients").select(...).eq("risk_tier", "High").is_("asha_worker_id", "null")
    # 2. db.table("asha_workers").select(...).lt("active_tasks", "max_capacity")
    # 3. Match by ward, load balance, create task records
    # 4. Fire n8n webhook if configured
    return {"total_assigned": 0, "assignments": [], "unassigned": 0, "message": "Not implemented yet"}


def _fire_n8n_webhook(task_payload: dict):
    """Fires n8n webhook for ASHA assignment notification (non-blocking)."""
    if not N8N_WEBHOOK_URL:
        return
    try:
        import requests
        requests.post(f"{N8N_WEBHOOK_URL}/asha-assigned", json=task_payload, timeout=3)
    except Exception as e:
        print(f"n8n webhook failed (non-critical): {e}")


def compute_due_date(risk_tier: str) -> date:
    """Returns due date based on risk tier urgency."""
    days = {"High": 2, "Medium": 5, "Low": 10}
    return date.today() + timedelta(days=days.get(risk_tier, 5))
