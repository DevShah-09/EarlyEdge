from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Returns a singleton Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        _supabase_client = create_client(url, key)
    return _supabase_client
