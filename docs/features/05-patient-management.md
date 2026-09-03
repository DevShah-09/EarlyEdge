# Feature: Patient Directory and Patient Detail

## Purpose

Lets clinical users find prioritized patients, inspect the complete record, understand risk, see history, generate/approve care plans, and view an intervention estimate.

## Patient directory

`PatientsPage.jsx` calls `GET /api/patients` after a short filter/search debounce. The backend returns 50 rows per page ordered by descending `overall_risk`.

Supported backend filters:

- exact risk tier;
- exact ward;
- assigned/unassigned ASHA state;
- case-insensitive partial patient name or ID;
- page number.

The frontend also sends `condition`, but it is ignored. The response has no total-row/page count, so the client cannot know the final page from metadata.

Each list item contains name, age/gender, overall score/tier, primary condition, top factor, last visit, ward, and ASHA assignment.

## Primary-condition formula

If at least two condition risks are ≥ 70, the first two in Diabetes → Hypertension → CVD order are abbreviated and joined (for example `DM + HTN`). If one is ≥ 70, it is returned. Otherwise the largest of the three is returned.

## Patient detail

`GET /api/patients/{id}` returns:

- demographics, vitals, lifestyle, family history, SDOH, ward/contact;
- condition/composite risks and tier;
- stored SHAP factors and explanation;
- up to 50 risk-history snapshots in ascending date order;
- a trajectory label.

The page displays risk charts, vitals, explanation bars, history, ASHA state, AI-plan controls, and a local intervention widget.

## Trajectory formula

The backend compares only the first and last historical `overall_risk`:

- difference ≥ 10: Rapidly worsening;
- difference ≥ 3: Worsening;
- difference ≤ -10: Rapidly improving;
- difference ≤ -3: Improving;
- otherwise Stable.

Despite its code comment, this is not a regression slope and does not account for time spacing or intermediate points.

If there is no real history, the frontend plots a visual fallback `[overall - 5, overall]`, which can go below zero and is not stored data.

## Manual ASHA assignment

The backend has `POST /patients/{id}/assign-asha`, which updates the patient, creates a Home Visit due in two days, and attempts a counter RPC. The current patient detail code imports approval but does not expose this assignment service in the shown flow; ASHA management has its own page.

## Important data behavior

The `patients` table is the latest snapshot, not a visit table. Upserts overwrite clinical fields while `patient_risk_history` accumulates scores. The API does not support editing patient data, merging identities, or viewing raw upload provenance beyond `upload_batch_id`.
