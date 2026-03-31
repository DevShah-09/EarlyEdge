"""
Auth Router
===========
Handles hospital registration (signup) and user management using
Supabase Admin Auth (service_role key) to bypass email confirmation limits.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from backend.database import get_supabase
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])


class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    hospital_name: str
    hospital_type: str = ""
    designation: str = ""


@router.post("/register")
async def register_hospital(body: SignUpRequest):
    """
    Registers a new hospital user via Supabase Admin API.
    Uses service_role key to auto-confirm the user (no email verification needed).
    """
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not service_key:
            raise HTTPException(status_code=500, detail="Server auth configuration missing.")
        
        # Create admin client with service role key
        admin_client = create_client(supabase_url, service_key)
        
        # Create user with auto-confirm using admin API
        user_response = admin_client.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,  # Auto-confirm, no email needed
            "user_metadata": {
                "full_name": body.full_name,
                "hospital_name": body.hospital_name,
                "hospital_type": body.hospital_type,
                "designation": body.designation,
                "role": "hospital_admin",
            }
        })
        
        return {
            "status": "success",
            "message": "Hospital account created successfully. You can now log in.",
            "user_id": user_response.user.id,
            "email": user_response.user.email,
        }
        
    except Exception as e:
        error_msg = str(e)
        
        # Handle duplicate user
        if "already been registered" in error_msg.lower() or "already exists" in error_msg.lower():
            raise HTTPException(status_code=409, detail="An account with this email already exists. Please log in instead.")
        
        print(f"Registration error: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
