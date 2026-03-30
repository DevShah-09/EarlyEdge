"""
SCHEMA: asha.py
===============
Pydantic models for ASHA task management endpoints.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class ASHAWorker(BaseModel):
    worker_id: str
    name: str
    zone: str
    ward: str
    phone: Optional[str] = None
    active_tasks: int = 0
    max_capacity: int = 10   # configurable per deployment


class ASHATask(BaseModel):
    task_id: str
    patient_id: str
    patient_name: str
    patient_risk_score: float
    patient_ward: str
    patient_address: Optional[str] = None
    asha_worker_id: Optional[str] = None
    asha_worker_name: Optional[str] = None
    task_type: str              # "Home Visit", "Follow-up Call", "Sample Collection"
    status: str                 # "Pending", "InProgress", "Done"
    priority: str               # "High", "Medium", "Low" — mirrors risk tier
    due_date: Optional[date] = None
    distance_km: Optional[float] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None


class AutoAssignResponse(BaseModel):
    total_assigned: int
    assignments: List[dict]     # [{ patient_id, patient_name, asha_worker_id, asha_name }]
    unassigned: int             # patients with no available ASHA nearby
    message: str


class TaskStatusUpdate(BaseModel):
    status: str                 # "Pending" | "InProgress" | "Done"


class ManualAssignRequest(BaseModel):
    asha_worker_id: str
