import os
import requests
from datetime import date, timedelta
from typing import List, Dict
from database import get_supabase

# Load from environment
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


async def auto_assign_asha_tasks() -> Dict:
    """
    Main auto-assignment logic:
    1. Finds high-risk patients without an ASHA.
    2. Matches them to available ASHA workers in their ward.
    3. Load balances tasks and updates database.
    """
    db = get_supabase()
    
    try:
        # 1. Fetch unassigned high-risk patients
        patients_res = db.table("patients").select("patient_id, name, ward, risk_tier, overall_risk")\
            .eq("risk_tier", "High").is_("asha_worker_id", "null").execute()
        unassigned_patients = patients_res.data
        
        if not unassigned_patients:
            return {
                "total_assigned": 0, 
                "assignments": [], 
                "unassigned": 0, 
                "message": "No unassigned high-risk patients found."
            }

        # 2. Fetch active ASHA workers
        workers_res = db.table("asha_workers").select("*").eq("is_active", True).execute()
        workers = workers_res.data
        
        if not workers:
             return {
                 "total_assigned": 0, 
                 "assignments": [], 
                 "unassigned": len(unassigned_patients), 
                 "message": "No active ASHA workers found."
             }

        assignments = []
        unassigned_count = 0
        
        # 3. Assignment Loop
        for patient in unassigned_patients:
            ward = patient["ward"]
            
            # Find workers in the same ward who are below capacity
            available_in_ward = [w for w in workers if w["ward"] == ward and w["active_tasks"] < w["max_capacity"]]
            
            if not available_in_ward:
                # Fallback: assign to ANY available worker regardless of ward if none in current ward
                available_anywhere = [w for w in workers if w["active_tasks"] < w["max_capacity"]]
                if not available_anywhere:
                    unassigned_count += 1
                    continue
                available_in_ward = available_anywhere
            
            # Select the one with the fewest active tasks (load balancing)
            selected_worker = min(available_in_ward, key=lambda x: x["active_tasks"])
            
            # 4. Perform DB updates
            task_data = {
                "patient_id": patient["patient_id"],
                "asha_worker_id": selected_worker["worker_id"],
                "task_type": "Home Visit",
                "status": "Pending",
                "priority": "High",
                "due_date": (date.today() + timedelta(days=2)).isoformat()
            }
            
            # Create task record
            task_res = db.table("asha_tasks").insert(task_data).execute()
            
            if task_res.data:
                # Update patient record with assigned worker
                db.table("patients").update({"asha_worker_id": selected_worker["worker_id"]})\
                    .eq("patient_id", patient["patient_id"]).execute()
                
                # Increment worker's active task count
                selected_worker["active_tasks"] += 1
                db.table("asha_workers").update({"active_tasks": selected_worker["active_tasks"]})\
                    .eq("worker_id", selected_worker["worker_id"]).execute()
                
                assignments.append({
                    "patient_id": patient["patient_id"],
                    "patient_name": patient["name"],
                    "asha_worker_id": selected_worker["worker_id"],
                    "asha_name": selected_worker["name"]
                })
                
        # Trigger n8n webhook notification
        _fire_n8n_webhook({
            "event": "asha_task_assigned",
            "task_id": task_res.data[0]["task_id"],
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "asha_name": selected_worker["name"],
            "asha_phone": selected_worker.get("phone"),
            "ward": ward,
            "due_date": task_data["due_date"]
        })

        return {
            "total_assigned": len(assignments),
            "assignments": assignments,
            "unassigned": unassigned_count,
            "message": f"Successfully assigned {len(assignments)} tasks. {unassigned_count} patients remain unassigned."
        }

    except Exception as e:
        print(f"ASHA auto-assign error: {e}")
        return {
            "total_assigned": 0, 
            "assignments": [], 
            "unassigned": 0, 
            "message": f"Server error: {str(e)}"
        }


def _fire_n8n_webhook(task_payload: dict):
    """Fires n8n webhook for ASHA assignment notification."""
    if not N8N_WEBHOOK_URL:
        return
    try:
        # If the URL already contains a UUID/webhook-test, we post directly.
        # Otherwise we append the path.
        url = N8N_WEBHOOK_URL
        if "webhook" not in url.lower():
             url = f"{url.rstrip('/')}/asha-assigned"
             
        requests.post(url, json=task_payload, timeout=5)
    except Exception as e:
        print(f"n8n Webhook Error: {e}")


def compute_due_date(risk_tier: str) -> date:
    """Returns due date based on risk tier urgency."""
    days = {"High": 2, "Medium": 5, "Low": 10}
    return date.today() + timedelta(days=days.get(risk_tier, 5))
