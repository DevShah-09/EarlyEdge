import os
import asyncio
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

async def test_insert():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    batch_id = str(uuid.uuid4())
    batch_record = {
        "batch_id": batch_id,
        "filename": "test.csv",
        "total_records": 1,
        "processed": 1,
        "failed": 0,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        print(f"Trying to insert batch {batch_id}...")
        res = supabase.table("upload_batches").insert(batch_record).execute()
        print("Batch insert success.")
        
        print("Trying to upsert patient...")
        patient_record = {
            "patient_id": "test-pid-upsert",
            "name": "Test Patient Upsert",
            "age": 41,
            "gender": "M",
            "upload_batch_id": batch_id
        }
        res = supabase.table("patients").upsert(patient_record, on_conflict="patient_id").execute()
        print("Patient upsert success.")
        
    except Exception as e:
        print("Insert failed:", e)

if __name__ == "__main__":
    asyncio.run(test_insert())
