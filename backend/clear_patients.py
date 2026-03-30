import time
from database import get_supabase

def clear_data():
    db = get_supabase()

    # 1. Clear patient_risk_history
    print("Fetching patient_risk_history...")
    res = db.table("patient_risk_history").select("history_id").execute()
    for row in res.data:
        db.table("patient_risk_history").delete().eq("history_id", row["history_id"]).execute()
    print(f"Deleted {len(res.data)} history records.")

    # 2. Clear asha_tasks
    print("Fetching asha_tasks...")
    res = db.table("asha_tasks").select("task_id").execute()
    for row in res.data:
        db.table("asha_tasks").delete().eq("task_id", row["task_id"]).execute()
    print(f"Deleted {len(res.data)} tasks.")

    # 3. Clear action_plans
    print("Fetching action_plans...")
    res = db.table("action_plans").select("plan_id").execute()
    for row in res.data:
        db.table("action_plans").delete().eq("plan_id", row["plan_id"]).execute()
    print(f"Deleted {len(res.data)} action plans.")

    # 4. Clear patients
    print("Fetching patients...")
    res = db.table("patients").select("patient_id").execute()
    for row in res.data:
        db.table("patients").delete().eq("patient_id", row["patient_id"]).execute()
    print(f"Deleted {len(res.data)} patients.")

    # 5. Clear upload_batches
    print("Fetching upload_batches...")
    res = db.table("upload_batches").select("batch_id").execute()
    for row in res.data:
        db.table("upload_batches").delete().eq("batch_id", row["batch_id"]).execute()
    print(f"Deleted {len(res.data)} batches.")

    print("\n✅ All data wiped successfully. Please re-upload your 15-patient CSV now.")

if __name__ == "__main__":
    clear_data()
