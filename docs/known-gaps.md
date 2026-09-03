# Known Gaps and Technical Debt

This list records behavior found in the repository so maintainers can distinguish implemented functionality from intended functionality.

## Highest priority

| Area | Current behavior | Consequence | Suggested correction |
|---|---|---|---|
| Backend auth | JWT is sent but never verified. | API data/actions are not protected. | Add FastAPI auth dependency, role and tenant checks. |
| RLS/tenancy | RLS commented out; hospital ID unused. | Cross-hospital isolation is absent. | Add tenant columns, policies, scoped queries. |
| Clinical validity | Models use synthetic generated labels/data. | Metrics do not establish real-world safety. | Governed clinical data and external validation. |
| Upload schema | Router inserts batch `status`; schema lacks it. | Upload can fail on schema created from repository. | Align migration/schema and payload. |
| Model choice | Comments say recall; code selects accuracy. | Rationale and actual artifact differ. | Choose metric explicitly, add tests, rename report fields. |
| Prediction choice | Ensemble is preferred before `best`. | Hypertension does not use reported winner. | Load a recorded deployment model per condition. |
| Explainability | RF SHAP explains ensemble predictions. | Factors may not explain displayed score. | Explain exact model or disclose validated surrogate method. |

## Feature inconsistencies

- The root README says `run_api.py` starts frontend and backend; it starts only the backend.
- `RiskSimulatorPage` is a fresh single-profile prediction form using `/predict-risk`, not a before/after stored-patient simulator.
- The patient-detail “intervention simulator” never calls ML. It uses `max(0, overall - smoking*10 - abs(weight change)*1.2 - max(0, original SBP-target SBP)*0.5)`.
- The implemented `/api/simulator` performs model-based before/after prediction but its service is unused by current pages.
- Patient service sends `condition`, but patient router ignores it.
- Camp service can send `ward`, but camp router ignores it.
- ASHA task endpoint accepts `ward`, but contains only `pass` and does not filter.
- Camp `month` changes the label but not the data window.
- Dashboard monthly fallback is fabricated demo data, not patient history.
- Actual history months are grouped by formatted strings without explicit chronological sorting and averages are truncated to integers.
- Care-plan cache declares expiry but never checks it.
- Patient detail always requests `regenerate=true`, so it bypasses cache from the main UI.
- SMTP mock mode returns `True`; the API/UI can report a plan as sent when it was only logged.
- Care-plan email branding says RAMBharose while the application is named EarlyEdge.
- Signup supports `VITE_API_BASE_URL`, while other services only support `VITE_API_URL`.

## Workflow integrity

- Required ASHA increment/decrement RPC functions are absent from the schema.
- Manual task reassignments increment the new worker without decrementing the previous worker.
- Marking an already Done task Done again can decrement again.
- Completing a task does not set `completed_at`.
- Status fields accept arbitrary strings.
- Auto-assignment falls back to any ward; it does not compute geographic distance despite “nearest” wording.
- n8n delivery is synchronous, exceptions are swallowed, and response status is not checked.
- Batch deletion can erase the current patient row even if that patient was previously part of another batch and later upserted into the deleted batch.
- Generated patient IDs can collide for people sharing normalized name and integer age.
- History has no uniqueness constraint and can duplicate assessments.
- Appointment GET returns every doctor when no doctor ID is provided.
- Appointment DELETE returns success even when no record existed.

## ML and data quality

- No version metadata connects model files to dataset hash, code commit, features, or training time.
- No calibration, cross-validation, hyperparameter search, confidence intervals, subgroup/fairness tests, or drift monitoring.
- SMOTE can generate fractional values for categorical integer features because all columns are oversampled together.
- Class weighting and `scale_pos_weight` are applied after SMOTE; their interaction is not evaluated.
- Preprocessing objects are not persisted as one pipeline for all models; batch and single preprocessing are separate code paths.
- Unknown gender maps to female, and missing clinical measurements are silently replaced with healthy-looking defaults.
- BMI is calculated only when the whole BMI column is null/absent, so partially missing BMI rows receive 22 rather than being calculated from their own weight/height.
- Upload-time training can train on small unlabeled uploads with synthetic labels and blocks the request.
- Pickle/joblib model loading executes serialized Python objects; artifacts must be trusted and integrity-controlled.
- Model paths depend on working directory in the explainer.
- CVD fallback tops out at 0.90 with the current four additions.

## Engineering quality

- No complete automated backend/API/end-to-end test suite.
- Manual test and database-reset scripts can touch configured Supabase data.
- Broad exception catches obscure partial failure and sometimes return HTTP 200 with error text.
- Upload persistence is not a database transaction; batch, patients, and history can become partially written.
- Large dashboard/task operations use multiple network queries and client-side pandas aggregation.
- No pagination metadata/total is returned with patients.
- Dependency versions are unpinned in Python requirements.
- `run_migration.py` imports unlisted `psycopg2`.
- Console text contains signs of character-encoding corruption in several files.

## Documentation maintenance rule

When fixing an item above, update the applicable feature document, API reference, and this page in the same change. Model behavior changes should also regenerate `training_report.json` and record artifact provenance.
