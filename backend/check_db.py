import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

async def check_columns():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    try:
        # Check patients table
        res = supabase.table("patients").select("*").limit(1).execute()
        if res.data:
            print("Columns in patients:")
            for k in res.data[0].keys():
                print(f" - {k}")
        else:
            print("Patients table is empty.")
            # If empty, maybe check structure via another way or just try to insert one
        
        # Check upload_batches table
        res = supabase.table("upload_batches").select("*").limit(1).execute()
        print("Upload batches exists.")
    except Exception as e:
        print("Error checking columns:", e)

if __name__ == "__main__":
    asyncio.run(check_columns())
