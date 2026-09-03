# Feature: Dashboard and Analytics

## Purpose

Provides a clinic-wide summary: patient counts, risk tiers, operational work, condition distribution, trends, ward priorities, model metrics, and a high-risk patient preview.

## Data loading

`DashboardPage.jsx` loads dashboard data and a High-tier patient list concurrently. The backend `GET /api/dashboard` fetches selected fields for every patient into pandas, then queries pending ASHA-task and upcoming-camp counts.

## KPI formulas

- Total patients = number of current rows in `patients`.
- High/Medium/Low counts = rows whose stored `risk_tier` equals that label.
- Tier percentage = `tier_count / total_patients * 100`, rounded to one decimal.
- Pending tasks = exact count where task status is Pending.
- Upcoming camps = camps whose `start_date >= today` (this can include already-ended data anomalies and excludes currently active camps that started earlier).
- New this week = patient rows whose `created_at` is within seven days. Upserting existing patients normally does not make them new.

## Condition breakdown

For each condition score independently:

- High ≥ 70;
- Medium ≥ 40 and < 70;
- Low < 40.

This can count one patient in multiple conditions, unlike the mutually exclusive overall distribution.

## Ward summary and camp recommendation

Patients are grouped by ward. For each ward:

```text
recommended_camps = ceil(high_risk_patients / 15)
```

Rows are sorted by descending High-risk count. A null ward may be dropped by pandas groupby.

## Monthly trend

When history exists, the backend groups all risk-history rows by formatted `"Mon YYYY"` and returns the mean diabetes/hypertension/CVD risk truncated to integers. The result is not explicitly sorted chronologically after grouping.

When no history exists or history access fails, it returns six synthetic demo points based on `20 + 2i`, `15 + 3i`, and `10 + 2i`. These are not derived from patient data and should be visibly labeled or removed in a production dashboard.

## Model metrics and export

The backend reads `training_report.json` on each dashboard request and returns the reported best model, accuracy, and recall. The page can export these metrics as CSV. These metrics represent a synthetic held-out set, not live monitoring.

## Scalability and correctness limits

The API performs full-table reads and client-side aggregation. It has no date/tenant filters, cached views, database aggregation, or live refresh. Failure of any main query makes the whole endpoint return 500. For large data, use secured SQL views/materialized aggregates and explicit time windows.
