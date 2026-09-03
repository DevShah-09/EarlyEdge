# Feature: ASHA Task Assignment

## Purpose

Prioritizes outreach for High-risk patients, balances assignments across ASHA workers, tracks task states, and optionally notifies an n8n workflow.

## UI

`ASHATasksPage.jsx` concurrently loads tasks and active workers. It shows counts for Pending, InProgress, and Done, client-side filters, worker utilization, an auto-assignment action, and task status updates.

## Automatic assignment algorithm

`POST /api/asha/auto-assign` does the following:

1. For every worker, count tasks whose status is not Done and overwrite `active_tasks`.
2. Fetch patients with `risk_tier=High` and null `asha_worker_id`.
3. Fetch active workers.
4. For each patient, find same-ward workers below capacity.
5. If none, consider any below-capacity worker across wards.
6. Select the candidate with minimum `active_tasks`.
7. Insert a High-priority Home Visit due in two days.
8. Update the patient’s worker ID and increment the in-memory/database count.
9. Fire an optional n8n payload.

Selection is load balancing, not geographic nearest-neighbor matching. There are no coordinates or distance formula. Patient iteration order is not explicitly sorted by overall score.

## Capacity formula

A worker is available when:

```text
active_tasks < max_capacity
```

UI utilization is:

```text
round(active_tasks / (max_capacity or 10) * 100)
```

Default capacity in schema/Pydantic is 10.

## Manual actions and status

- `PUT /asha/tasks/{id}/assign` updates the task and patient and calls an increment RPC.
- `PATCH /asha/tasks/{id}/status` writes the supplied status; when it equals Done it calls a decrement RPC.
- `POST /patients/{id}/assign-asha` creates a new two-day Home Visit and attempts the increment RPC.

The schema does not define the two RPC functions. Status values are not validated as an enum, completion time is not written, and repeated/reassignment operations can corrupt counters. Auto-assignment’s initial synchronization partly repairs counts.

## n8n integration

If `N8N_WEBHOOK_URL` is set, the service POSTs event, task/patient/worker/contact/ward/due-date JSON with a five-second timeout. If the configured URL lacks the word `webhook`, `/asha-assigned` is appended. Errors and unsuccessful HTTP statuses do not affect assignment.

## Filtering limitation

The tasks endpoint implements status and worker filters. It accepts a ward parameter but does nothing with it; ward filtering visible in the page is client-side after all matching tasks are fetched.
