# Feature: Appointments and Calendar

## Purpose

Provides a doctor calendar with patient-linked appointment creation, listing, status changes, and deletion.

## UI flow

`CalendarPage.jsx` loads the signed-in doctor’s appointments and the patient directory concurrently. It builds a month grid, supports navigation/date selection, shows appointments for selected dates, and opens a creation form populated from patients.

The browser takes the Supabase user ID as `doctor_id` and sends it as a query parameter. Dates are serialized as JavaScript/ISO timestamps and parsed by Pydantic.

## API behavior

- `GET /api/appointments?doctor_id=<uuid>` lists matching appointments ascending by time. If omitted, it lists every doctor’s appointments.
- `POST /api/appointments?doctor_id=<uuid>` inserts patient ID/name, timestamp, type, status, and notes.
- `PATCH /api/appointments/{uuid}?status=...` updates status and `updated_at`.
- `DELETE /api/appointments/{uuid}` deletes matching data and always returns success.

Defaults are type Consultation and status Scheduled. Schema comments additionally name Follow-up/Emergency types and Completed/Cancelled statuses, but inputs are free strings rather than enums.

## Data design

Each row references `patients.patient_id` with cascade deletion and also stores `patient_name`. `doctor_id` is a UUID but has no database foreign key in `schema.sql`; it is intended to match a Supabase Auth user. Timestamps use `TIMESTAMPTZ`.

## Limitations

- Backend does not authenticate the doctor or ensure the supplied ID matches the caller.
- No conflict/overlap checks, duration, timezone preference, recurrence, reminders, clinician availability, rescheduling endpoint, or audit history.
- Patient list retrieval is limited to the first 50 risk-sorted patients, so the scheduling selector may omit others.
- Status update accepts arbitrary values.
- Delete does not report not-found.
- Calendar date comparisons depend on browser/server timestamp conversions and can shift dates if timezone handling is inconsistent.
