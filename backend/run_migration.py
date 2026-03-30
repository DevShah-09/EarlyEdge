import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def run_migration():
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not found")
        return
    
    try:
        conn = psycopg2.connect(url)
        conn.autocommit = True
        cur = conn.cursor()
        print("Adding housing_status column if missing...")
        cur.execute("ALTER TABLE patients ADD COLUMN IF NOT EXISTS housing_status TEXT DEFAULT 'Stable';")
        print("Migration successful.")
        cur.close()
        conn.close()
    except Exception as e:
        print("Migration failed:", e)

if __name__ == "__main__":
    run_migration()
