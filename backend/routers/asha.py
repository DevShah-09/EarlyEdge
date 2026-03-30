"""
ROUTER: asha.py
===============
Endpoints:
  GET  /api/asha/tasks          — list all tasks (filterable)
  POST /api/asha/auto-assign    — auto-assign nearest ASHA to high-risk patients
  PUT  /api/asha/tasks/:id/assign  — manually assign ASHA to task
  PATCH /api/asha/tasks/:id/status — update task status
  GET  /api/asha/workers        — list all ASHA workers with capacity

Auto-Assign Logic (POST /asha/auto-assign):
1. Fetch all high-risk patients without an ASHA assignment
2. Fetch all available ASHA workers with remaining capacity (active_tasks < max_capacity)
3. For each patient, find the nearest ASHA worker (by ward matching, then distance_km)
4. Create ASHATask records in DB
5. Return summary of assignments made

Priority Rule:
- Task priority = patient risk tier (High risk → High priority task)
- Due date = today + 2 days for High, + 5 days for Medium

n8n Integration note:
- After auto-assign, fires a webhook to n8n workflow
- n8n then sends SMS to ASHA worker via WhatsApp/SMS gateway
- Endpoint: POST {N8N_WEBHOOK_URL}/asha-assigned with task payload

DB tables used:
- patients       — for unassigned high-risk patients
- asha_workers   — worker roster with zone/ward/capacity
- asha_tasks     — task records (created by auto-assign or manual)
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.asha import AutoAssignResponse, TaskStatusUpdate, ManualAssignRequest

router = APIRouter(prefix="/asha", tags=["ASHA Tasks"])


@router.get("/tasks")
async def list_tasks(
    status: Optional[str] = None,
    ward: Optional[str] = None,
    worker_id: Optional[str] = None,
):
    """Returns ASHA tasks filtered by status, ward, or assigned worker."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/auto-assign", response_model=AutoAssignResponse)
async def auto_assign_tasks():
    """
    Auto-assigns nearest available ASHA workers to all unassigned high-risk patients.
    Triggers n8n webhook for SMS notifications after assignment.
    """
    # TODO: implement via services/asha_service.py
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.put("/tasks/{task_id}/assign")
async def manually_assign_task(task_id: str, body: ManualAssignRequest):
    """Manually assigns a specific ASHA worker to a task."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, body: TaskStatusUpdate):
    """Update a task's status: Pending → InProgress → Done."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/workers")
async def list_workers():
    """Returns all ASHA workers with their active task count and capacity."""
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
