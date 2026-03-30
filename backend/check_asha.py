import os
from database import get_supabase

def check_data():
    db = get_supabase()
    
    # Check patients count
    res_patients = db.table("patients").select("patient_id, name, risk_tier, asha_worker_id, ward").execute()
    print(f"Total patients in DB: {len(res_patients.data)}")
    
    # Check high risk patients
    high_risk = [p for p in res_patients.data if p['risk_tier'] == 'High']
    print(f"High risk patients: {len(high_risk)}")
    
    # Check ASHA workers
    res_workers = db.table("asha_workers").select("worker_id, name, ward, active_tasks, max_capacity, is_active").execute()
    print(f"ASHA workers in DB: {len(res_workers.data)}")
    for w in res_workers.data:
         print(f" - {w['name']} | Ward: '{w['ward']}' | Active: {w['active_tasks']}/{w['max_capacity']}")

if __name__ == "__main__":
    check_data()
