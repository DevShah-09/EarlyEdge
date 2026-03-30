import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def reset_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return
        
    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        # We use CASCADE to drop any linked rows automatically (e.g. tasks, history).
        # We clear the tables in correct topological order, or just let CASCADE handle it.
        print("Truncating tables...")
        cur.execute("""
            TRUNCATE TABLE 
                patients,
                upload_batches
            CASCADE;
        """)
        
        print("\n✅ Database has been successfully cleared! You can now upload your 15-patient CSV fresh.")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    reset_db()
