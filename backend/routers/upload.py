import io
import uuid
import traceback
from datetime import date, datetime, timezone
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional

from backend.database import get_supabase
from backend.ml.preprocessor import preprocess, validate_dataframe
from backend.ml.predictor import predict_risk_scores
from backend.ml.explainer import get_shap_factors, build_xai_summary, get_top_factor_label
from backend.utils.risk_calculator import get_primary_condition, score_to_tier
from backend.schemas.upload import UploadResponse

router = APIRouter(prefix="/upload", tags=["Upload"])

# ── helpers ──────────────────────────────────────────────────────────────────

def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercases and strips column names to handle variations."""
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
    return df


def _generate_patient_id(row: pd.Series) -> str:
    """Generates a deterministic ID from name and age if patient_id is missing."""
    import hashlib
    name = str(row.get("name", "anon")).lower().replace(" ", "")
    age = str(int(row.get("age", 40)))
    combined = f"{name}-{age}"
    # Adding a short hash of the name/age for extra stability
    h = hashlib.md5(combined.encode()).hexdigest()[:6]
    return f"P-{name}-{h}"

# ── main upload endpoint ─────────────────────────────────────────────────────

@router.post("", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts a CSV or XLSX hospital patient dataset.
    Triggers ML training + risk prediction pipeline.
    Persists risk scores, SHAP explanations, and historical snapshots.
    """
    if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload CSV or Excel.")

    try:
        # 1. Read file
        content = await file.read()
        filename = file.filename or ""
        
        if filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            df = pd.read_csv(io.BytesIO(content))
            
        df = _normalize_columns(df)
        total_records = len(df)
        
        if total_records == 0:
            raise HTTPException(status_code=400, detail="Uploaded file contains no data rows.")

        # 2. Validate required columns
        is_valid, missing = validate_dataframe(df)
        if not is_valid:
            raise HTTPException(
                status_code=422,
                detail=f"Missing required columns: {', '.join(missing)}",
            )

        # 3. Preprocess
        df_processed = preprocess(df)

        # 4. Run ML prediction pipeline
        risk_results = predict_risk_scores(df_processed)

        # 5. Build patient records and persist
        supabase = get_supabase()
        batch_id = str(uuid.uuid4())
        high, medium, low = 0, 0, 0
        failed = 0
        failed_rows = []
        today_str = date.today().isoformat()

        # We'll collect all records for bulk upsert where possible, 
        # but history needs individual treatment or bulk insert.
        patient_records = []
        history_records = []

        for idx, risk in enumerate(risk_results):
            try:
                row = df_processed.iloc[idx]
                
                # Use provided patient_id or generate one
                if "patient_id" in row and pd.notna(row["patient_id"]):
                    pid = str(row["patient_id"])
                else:
                    pid = _generate_patient_id(row)

                # Risk scores
                d_risk = risk["diabetes_risk"]
                h_risk = risk["hypertension_risk"]
                c_risk = risk["cvd_risk"]
                overall = risk["overall_risk"]
                tier = risk["risk_tier"]

                if tier == "High": high += 1
                elif tier == "Medium": medium += 1
                else: low += 1

                # Explainer logic
                primary_cond_key = "diabetes"
                max_score = d_risk
                for ckey, cscore in [("hypertension", h_risk), ("cvd", c_risk)]:
                    if cscore > max_score:
                        primary_cond_key = ckey
                        max_score = cscore

                try:
                    shap_factors = get_shap_factors(row, primary_cond_key, top_n=5)
                    xai_summary = build_xai_summary(shap_factors, tier)
                    top_factor = get_top_factor_label(row, primary_cond_key)
                except Exception:
                    shap_factors = []
                    xai_summary = f"{tier} risk based on patient profile."
                    top_factor = "—"

                primary_condition = get_primary_condition(d_risk, h_risk, c_risk)

                # Patient Record
                patient_record = {
                    "patient_id": pid,
                    "name": str(df.iloc[idx].get("name", "Unknown")),
                    "age": int(row.get("age", 40)),
                    "gender": str(df.iloc[idx].get("gender", "U")),
                    "bmi": round(float(row.get("bmi", 22)), 2),
                    "systolic_bp": int(row.get("systolic_bp", 120)),
                    "diastolic_bp": int(row.get("diastolic_bp", 80)),
                    "blood_glucose_fasting": round(float(row.get("blood_glucose_fasting", 90)), 2),
                    "hba1c": round(float(row.get("hba1c", 5.5)), 2),
                    "cholesterol_total": round(float(row.get("cholesterol_total", 180)), 2),
                    "smoking_status": int(row.get("smoking_status", 0)),
                    "physical_activity": int(row.get("physical_activity", 1)),
                    "family_history_diabetes": int(row.get("family_history_diabetes", 0)),
                    "family_history_hypertension": int(row.get("family_history_hypertension", 0)),
                    "family_history_cvd": int(row.get("family_history_cvd", 0)),
                    "income_level": str(df.iloc[idx].get("income_level", "Medium")),
                    "food_security": int(row.get("food_security", 1)),
                    "housing_status": str(df.iloc[idx].get("housing_status", "Stable")),
                    "ward": str(df.iloc[idx].get("ward", "")),
                    "diabetes_risk": round(d_risk, 2),
                    "hypertension_risk": round(h_risk, 2),
                    "cvd_risk": round(c_risk, 2),
                    "overall_risk": round(overall, 2),
                    "risk_tier": tier,
                    "primary_condition": primary_condition,
                    "xai_summary": xai_summary,
                    "top_factor_label": top_factor,
                    "shap_factors": shap_factors,
                    "email": str(df.iloc[idx].get("email", "")) if "email" in df.columns else None,
                    "upload_batch_id": batch_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }

                # Optional fields
                if "weight_kg" in df.columns:
                    patient_record["weight_kg"] = round(float(df.iloc[idx].get("weight_kg", 0)), 2) or None
                if "height_cm" in df.columns:
                    patient_record["height_cm"] = round(float(df.iloc[idx].get("height_cm", 0)), 2) or None
                if "last_visit_date" in df.columns:
                    lvd = df.iloc[idx].get("last_visit_date", None)
                    patient_record["last_visit_date"] = str(lvd) if pd.notna(lvd) else None
                if "asha_worker_id" in df.columns:
                    awid = df.iloc[idx].get("asha_worker_id", None)
                    patient_record["asha_worker_id"] = str(awid) if pd.notna(awid) and str(awid).strip() else None

                patient_records.append(patient_record)

                # History Record
                history_records.append({
                    "patient_id": pid,
                    "assessment_date": today_str,
                    "diabetes_risk": round(d_risk, 2),
                    "hypertension_risk": round(h_risk, 2),
                    "cvd_risk": round(c_risk, 2),
                    "overall_risk": round(overall, 2),
                    "risk_tier": tier,
                })

            except Exception as e:
                print(f"Error processing row {idx}: {e}")
                failed += 1
                failed_rows.append(idx + 2)

        # 6. Log the upload batch (First, to satisfy patients FK)
        batch_record = {
            "batch_id": batch_id,
            "filename": filename,
            "total_records": total_records,
            "processed": total_records - failed,
            "failed": failed,
            "high_risk_count": high,
            "medium_risk_count": medium,
            "low_risk_count": low,
            "status": "SUCCESS",
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("upload_batches").insert(batch_record).execute()

        # 7. Bulk Upsert Patients
        if patient_records:
            supabase.table("patients").upsert(patient_records, on_conflict="patient_id").execute()
        
        # 8. Bulk Insert History
        if history_records:
            supabase.table("patient_risk_history").insert(history_records).execute()

        return UploadResponse(
            batch_id=batch_id,
            total_records=total_records,
            processed=total_records - failed,
            failed=failed,
            failed_rows=failed_rows,
            high_risk_count=high,
            medium_risk_count=medium,
            low_risk_count=low,
            message=f"Successfully processed {total_records - failed}/{total_records} patients. "
                    f"Risk distribution: {high} High, {medium} Medium, {low} Low.",
        )

    except Exception as e:
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# ── upload history ───────────────────────────────────────────────────────────

@router.get("/history")
async def get_upload_history():
    """
    Returns all past upload batches.
    """
    supabase = get_supabase()
    result = supabase.table("upload_batches") \
        .select("*") \
        .order("uploaded_at", desc=True) \
        .limit(50) \
        .execute()
    return {"history": result.data}


@router.delete("/batch/{batch_id}")
async def delete_upload_batch(batch_id: str):
    """
    Deletes an upload batch and all patients associated with it.
    """
    supabase = get_supabase()
    
    try:
        # 1. Delete patients belonging to this batch
        # We delete patients first because they reference the batch (though no hard FK constraint prevents this order, it's cleaner)
        supabase.table("patients") \
            .delete() \
            .eq("upload_batch_id", batch_id) \
            .execute()
            
        # 2. Delete the batch record itself
        result = supabase.table("upload_batches") \
            .delete() \
            .eq("batch_id", batch_id) \
            .execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Batch not found")
            
        return {"status": "success", "message": f"Batch {batch_id} and associated records deleted."}
        
    except Exception as e:
        print(f"Deletion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
