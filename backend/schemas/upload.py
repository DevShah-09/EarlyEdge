from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class UploadResponse(BaseModel):
    batch_id: str
    total_records: int
    processed: int
    failed: int
    failed_rows: List[int]
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    message: str


class UploadError(BaseModel):
    row: int
    patient_id: Optional[str]
    error: str
