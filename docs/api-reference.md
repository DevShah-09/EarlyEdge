# API Reference

Default local base URL: `http://localhost:8000/api`. Interactive OpenAPI UI: `http://localhost:8000/api/docs`.

The frontend sends a Supabase bearer token, but the backend currently does not authenticate or authorize it.

## Health

| Method | Path | Behavior |
|---|---|---|
| GET | `/` | Returns API-running message and docs path. |
| GET | `/health` | Returns `healthy` and version `1.0.0`. |

## Authentication

| Method | Path | Input | Behavior |
|---|---|---|---|
| POST | `/api/auth/register` | email, password, full name, hospital name/type, designation | Uses Supabase Admin Auth with the service-role key, auto-confirms the user, and stores fields in user metadata. |

Login, logout, session refresh, and profile metadata updates go directly from the browser to Supabase Auth, not through FastAPI.

## Upload

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/upload` | Multipart `file`; accepts CSV/XLS/XLSX, validates, predicts, explains, and persists. |
| GET | `/api/upload/history` | Returns up to 50 batches ordered newest first as `{history: [...]}`. |
| DELETE | `/api/upload/batch/{batch_id}` | Deletes patients in the batch, then the batch. Patient child rows cascade where foreign keys define it. |

Upload requires only `name`, `age`, and `gender` columns. Most missing clinical inputs are silently defaulted. The response reports batch ID, processed/failed counts, failed row numbers, and tier counts.

## Single-patient risk

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/predict-risk` | Validates one profile, computes condition/composite risk, checks severe rules, and returns factors/explanation. |

Required field: `age`. Defaults exist for gender, all vitals, smoking, and enrichment fields. Response condition scores use 0–100; `risk_score` uses 0–1.

## Patients and plans

| Method | Path | Query/body | Behavior |
|---|---|---|---|
| GET | `/api/patients` | `page`, `tier`, `ward`, `has_asha`, `search` | Returns up to 50 patients ordered by overall risk descending. |
| GET | `/api/patients/{patient_id}` | — | Full patient, SHAP factors, and up to 50 history points plus trajectory label. |
| POST | `/api/patients/{patient_id}/assign-asha` | `{asha_worker_id}` | Updates patient, inserts a two-day Home Visit task, attempts counter RPC. |
| POST | `/api/patients/{patient_id}/approve-plan` | — | Approves latest generated plan and sends/logs email. |
| GET | `/api/action-plans/{patient_id}` | `regenerate=false` | Returns cache or generates, replaces, and caches a 30-day plan. |

The frontend includes a `condition` patient filter parameter, but the backend endpoint does not declare or apply it.

## Dashboard

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/dashboard` | Returns KPI counts, overall distribution, per-condition distribution, monthly averages/fallback, ward summaries, and model report metrics. |

## ASHA workflow

| Method | Path | Input | Behavior |
|---|---|---|---|
| GET | `/api/asha/tasks` | `status`, `ward`, `worker_id` | Lists joined task/patient/worker data. Ward is accepted but currently ignored. |
| POST | `/api/asha/auto-assign` | — | Syncs counters and assigns unassigned High-risk patients. |
| PUT | `/api/asha/tasks/{task_id}/assign` | `{asha_worker_id}` | Manually assigns task/patient and increments worker counter through RPC. |
| PATCH | `/api/asha/tasks/{task_id}/status` | `{status}` | Writes any supplied string; decrements worker counter when status equals Done. |
| GET | `/api/asha/workers` | — | Lists active workers. |

## Risk simulation

| Method | Path | Input | Behavior |
|---|---|---|---|
| POST | `/api/simulator` | patient ID plus optional overrides | Recomputes original and modified model risks and returns four deltas. Does not save results. |

Overrides: BMI, weight, SBP, DBP, glucose, HbA1c, smoking, activity, and cholesterol. A weight change recalculates BMI if height is present. This endpoint is not currently called by a page; the standalone page uses `/predict-risk` instead.

## Screening camps

| Method | Path | Input | Behavior |
|---|---|---|---|
| GET | `/api/camps/plan` | optional `month` | Computes ward recommendations; month is echoed but does not filter patient data. |
| GET | `/api/camps` | — | Separates upcoming and past camps using end date. |
| POST | `/api/camps` | ward, dates, venue, target count, screenings | Inserts a Planned camp. |

The frontend can send a `ward` planning parameter, but the backend does not accept it.

## Appointments

| Method | Path | Input | Behavior |
|---|---|---|---|
| GET | `/api/appointments` | optional doctor UUID | Lists appointments in ascending date order. Without a doctor ID it returns all doctors’ records. |
| POST | `/api/appointments` | required doctor UUID query + appointment JSON | Creates an appointment. |
| PATCH | `/api/appointments/{appointment_id}` | required `status` query | Updates status and timestamp. |
| DELETE | `/api/appointments/{appointment_id}` | — | Deletes matching row and always returns success. |

## Error behavior

Pydantic validation normally returns HTTP 422. Several workflow services catch broad exceptions and either convert them to HTTP 500 or return a successful HTTP response containing an error-like message. In particular, camp planning and ASHA auto-assignment suppress internal exceptions into empty/zero response objects.
