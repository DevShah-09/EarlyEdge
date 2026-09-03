# Feature: Dataset Upload and Ingestion

## Purpose

Imports a hospital patient spreadsheet, computes risk and explanation fields, stores the latest patient snapshot plus temporal history, and displays upload history and outcome counts.

## UI and API

`UploadPage.jsx` and `UploadDropzone.jsx` provide selection/drag-and-drop, progress, result counts, prior batches, and deletion. `uploadService.js` calls:

- `POST /api/upload`;
- `GET /api/upload/history`;
- `DELETE /api/upload/batch/{batch_id}`.

The dropzone’s default accept value is `.csv`, while the backend and page descriptions support CSV, XLSX, and XLS. The browser progress callback measures network upload bytes, not backend ML/database completion.

## Accepted structure

Column names are trimmed, lowercased, and spaces/hyphens become underscores. Only these columns are required:

- `name`;
- `age`;
- `gender`.

Important optional columns include patient ID, weight/height/BMI, BP, glucose, HbA1c, cholesterol, lifestyle, family histories, income/food/housing, ward, visit date, ASHA ID, and email. Unavailable ML values are defaulted; see [Machine learning](../machine-learning.md#preprocessing).

## Pipeline

1. Validate extension.
2. Read bytes with pandas (`read_csv` or `read_excel`).
3. Reject empty data and missing required columns.
4. Preprocess and clamp features.
5. Load/train models and predict three condition risks.
6. Calculate composite score and risk tier.
7. Choose the highest-scoring condition for explanation.
8. Attempt up to five RF TreeSHAP factors; fall back to empty factors on error.
9. Build current patient records and risk-history rows.
10. Insert upload batch, bulk-upsert patients, and bulk-insert history.

The overall formula is:

```text
overall = 0.5 * max(diabetes, hypertension, CVD)
        + 0.5 * (diabetes + hypertension + CVD) / 3
```

Tiers are High ≥ 70, Medium ≥ 40 and < 70, Low < 40.

## IDs and repeated uploads

Provided patient IDs are retained. Otherwise ID is a short MD5-derived value based on normalized name and integer age. Current patient data is upserted by that key. Every processed input row adds a history record, even if duplicate.

Within one uploaded file, current patient records are held in a dictionary by ID, so duplicate IDs collapse to the final row for the `patients` upsert, while every row still contributes to history and tier counters.

## Persistence and failure behavior

Row transformation errors are counted and returned with 1-based spreadsheet row numbers (`index + 2`). Database operations happen after transformation and are not transactional. A database failure returns HTTP 500 and can leave partial data.

The batch is inserted before patients to satisfy the foreign key. However, the payload contains `status="SUCCESS"` and the checked-in schema does not define that column.

Deleting a batch first deletes all patients whose current `upload_batch_id` matches it. Cascading child records may also be removed. This is destructive and can delete a patient that existed earlier but was most recently updated by the selected batch.

## Dataset files in the repository

- `sample_patients.csv`: 15 upload rows.
- `sample_patients_50.csv`: 50 upload rows.
- `historical_trend_data.csv`: 300 rows representing 50 patients × six visits.
- `large_patient_dataset_5000.csv`: 5,000 labeled synthetic training rows; usable for upload but primarily intended for training.

## Limitations

No backend size/row limits, MIME validation, background queue, per-hospital ownership, transaction, idempotency key, missingness flags, or detailed persisted row-error log is implemented.
