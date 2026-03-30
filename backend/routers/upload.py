"""
ROUTER: upload.py
=================
Endpoint: POST /api/upload
         GET  /api/upload/history

Flow:
1. Receive CSV or XLSX file from hospital staff
2. Read into pandas DataFrame
3. Validate required columns (patient_id, name, age, gender)
4. Preprocess & feature-engineer (BMI calc, encoding, imputation)
5. Train ML models on uploaded data (bootstrap via synthetic labels)
6. Generate risk scores for all patients (predict_risk_scores)
7. Generate SHAP top-factor labels (get_top_factor_label) per patient
8. Persist all patient records + scores to Supabase (patients table)
9. Record upload batch in upload_batches table
10. Return UploadResponse with summary stats

Error handling:
- Invalid file type → 400
- Missing required columns → 422 with list of missing columns
- Row-level errors logged but don't abort whole upload
- Max file size: 50MB enforced by FastAPI UploadFile

DB tables used:
- patients           — one row per patient
- upload_batches     — one row per upload event
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.upload import UploadResponse

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts a CSV or XLSX hospital patient dataset.
    Triggers ML training + risk prediction pipeline.
    Returns batch summary with risk tier counts.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/history")
async def get_upload_history():
    """
    Returns all past upload batches for the authenticated hospital.
    Includes: batch_id, date, record count, high/medium/low counts.
    """
    # TODO: implement
    raise HTTPException(status_code=501, detail="Not implemented yet")
