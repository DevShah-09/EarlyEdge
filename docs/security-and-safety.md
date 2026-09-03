# Security, Privacy, and Clinical Safety

## Current controls

- Supabase Auth manages browser sessions and password authentication.
- Protected React routes prevent unauthenticated navigation through the normal UI.
- Axios attaches the active Supabase JWT to API requests.
- Signup uses a service-role credential only on the server.
- Pydantic validates the numeric bounds of single risk predictions and simulator overrides.
- Uploaded files are limited by extension to CSV/XLS/XLSX.
- Action plans require an explicit approval endpoint before email dispatch.
- SMTP uses STARTTLS.

## Critical production gaps

### API authorization

FastAPI never validates the attached JWT. No endpoint uses the authenticated user identity, roles, or hospital metadata. Anyone able to reach the API can attempt to read, modify, or delete records. Add JWT verification dependencies and object/tenant authorization to every protected router.

### Database isolation

RLS is disabled in the checked-in schema and no policies are defined. Hospital ownership is not stored on patients/tasks/camps/appointments, and `upload_batches.hospital_id` is unused. Introduce a tenant key consistently and enforce it both in queries and RLS.

### Service-role handling

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must remain backend-only. It must never use a `VITE_` name, enter the frontend environment, logs, examples, or committed files. Rotate it if exposure is suspected.

### CORS

The Render blueprint uses wildcard origins. Restrict CORS to known HTTPS application domains. Validate the chosen credential/origin combination in browsers.

### PHI/PII handling

The system stores patient names, clinical data, ward, email, and potentially phone-linked assignments. The repository does not implement consent, retention, encryption-key management, data residency policy, audit logs, record export/correction workflows, or breach monitoring. Logging currently prints filenames, columns, processing errors, email destinations, and in mock mode entire care-plan content.

### Upload hardening

Extension checks do not prove file type. There is no explicit backend file-size, row-count, decompression, formula-injection, malware, or resource-usage limit. Excel/CSV parsing and synchronous model/explanation work can exhaust memory or CPU. Add content sniffing, size/row limits, background jobs, and safe export rules.

### Input validation

Batch ingestion clamps many clinical values but accepts only three required columns and silently imputes the rest. Task statuses, camp date ordering, appointment statuses/types, patient email, and several string categories are not constrained. Silent defaults may look like real measurements and should carry missingness/provenance flags.

## Clinical safety limitations

- Models and reported metrics are based on synthetic data.
- Disease labels were generated from heuristics and random draws.
- Probabilities are not calibrated or externally validated.
- SHAP may explain a surrogate RF while inference uses an ensemble.
- Single and batch risk categories use different thresholds.
- Rule overrides and fallback weights are hand-authored.
- The LLM prompt asks for evidence-based care plans but does not ground output in a vetted guideline source, validate medications/contraindications, or enforce JSON with a schema-aware parser.
- The fallback plan is generic and can include clinical tests or lifestyle advice without checking pregnancy, disability, comorbidities, allergies, or current treatment.

The UI and emails should state that outputs are screening/decision support, not diagnosis or emergency advice. A qualified clinician should review every intervention. Critical readings should trigger an explicit escalation protocol rather than only a colored score.

## Recommended pre-production gate

1. Validate identity and tenant authorization end to end.
2. Enable and test RLS with least-privilege client keys.
3. Replace synthetic-only models with governed, representative, consented data and independent validation.
4. Calibrate scores, choose thresholds from clinical utility/cost analysis, and evaluate sensitivity, specificity, PPV/NPV, subgroup performance, and drift.
5. Align the explained model with the predicting model.
6. Add structured LLM output validation, a curated clinical knowledge source, safety rules, and recorded clinician sign-off.
7. Add immutable audit events for reads, predictions, assignments, plan generation/approval, email delivery, and deletion.
8. Establish retention, backup, recovery, monitoring, incident response, and applicable Indian health-data compliance review.
