# Database and Data Model

The backend uses Supabase PostgreSQL through the Python SDK. `backend/schema.sql` is the main declarative schema, while Supabase Auth stores user identities outside these application tables.

## Relationships

```text
upload_batches 1 ---- * patients
                         |
                         |---- * patient_risk_history
                         |---- * action_plans
                         |---- * asha_tasks * ---- 1 asha_workers
                         `---- * appointments

screening_camps (ward-level, no foreign key to patients)
```

Patient-related children use `ON DELETE CASCADE` for their patient foreign key where defined. `patients.upload_batch_id` does not specify `ON DELETE CASCADE`, so the application deletes patients before deleting a batch.

## Tables

### `upload_batches`

One record per upload: UUID, filename, counts for total/processed/failed and each risk tier, optional hospital ID, and upload time. The upload router inserts a `status: "SUCCESS"` field, but `backend/schema.sql` does not define a `status` column. A database created exactly from the checked-in schema will reject that insert.

### `patients`

The current patient snapshot keyed by text `patient_id`. It contains demographics, vitals, lifestyle, family history, SDOH fields, ward/visit/ASHA assignment, three condition risks, composite risk, tier, primary condition, explanation strings, JSONB SHAP factors, email, upload batch, and timestamps.

Repeated uploads use `upsert(..., on_conflict="patient_id")`, so a matching patient ID replaces the latest values. `created_at` is preserved unless Supabase upsert behavior or payload changes it; `updated_at` is explicitly written.

If an input has no ID, the backend calculates:

```text
normalized = lowercase(name) with spaces removed + "-" + integer(age)
hash = first 6 hexadecimal characters of MD5(normalized)
patient_id = "P-" + normalized_name + "-" + hash
```

This is deterministic but can merge different people with the same name and age. MD5 is used only as a short identifier here, not for security.

### `patient_risk_history`

Append-only snapshots for each processed upload row. Assessment date is `last_visit_date`, otherwise the server’s current date. There is no uniqueness constraint on patient/date, so repeated uploads can create duplicates. The patient-detail API limits history to 50 points.

### `action_plans`

Stores full response JSON, approval state/time, generation time, and a nominal seven-day expiry. The API currently ignores `expires_at`, returns the first unsorted cached match, and deletes all old plans before inserting a regenerated plan. In normal operation this yields one row per patient despite the one-to-many schema.

### `asha_workers`

Worker identity, ward/zone/contact, active-task counter, capacity, and active flag. `active_tasks` is denormalized and periodically recomputed by the auto-assignment service.

### `asha_tasks`

Links patient and worker, with task type, status, priority, due date, distance, notes, completion time, and creation time. The application uses Pending → InProgress → Done but does not constrain those values in the database.

### `screening_camps`

Ward, dates, venue, target, status, JSONB screenings/staff, cost, and outcome counts. Creation currently populates only ward, dates, venue, target, Planned status, and screenings.

### `appointments`

UUID appointment and doctor IDs, patient foreign key and copied patient name, timestamp, type, status, notes, and audit timestamps. The copied name avoids a join for calendar rendering but can become stale if a patient name changes.

## Indexes

The schema indexes common patient risk/ward queries, patient history by patient/date, action plans by patient, ASHA worker/task filters, camp ward/date, and appointment doctor/date/patient. Dashboard aggregation still retrieves all patient rows rather than delegating grouping to SQL.

## Required database functions not declared in the schema

The backend calls these Supabase RPCs, but `backend/schema.sql` contains no definitions:

- `increment_asha_task_count(worker_id)`;
- `decrement_asha_task_count(worker_id)`.

Manual task operations will fail unless these functions were created separately in the deployed database. Auto-assignment updates counts directly and does not rely on them.

## Row-level security

RLS commands are present only as comments. No policies or hospital/tenant foreign keys are actively enforced. `upload_batches.hospital_id` is unused, and most queries have no organization filter. This is not suitable for multi-hospital production data isolation without further work.

## Migration tooling

`backend/run_migration.py` only adds `patients.housing_status`, using `psycopg2`; however `psycopg2` is not listed in `backend/requirements.txt`. The main schema already contains that field. The repository has no ordered migration history or automatic schema bootstrap.
