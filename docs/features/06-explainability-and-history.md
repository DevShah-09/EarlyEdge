# Feature: Explainable AI and Risk History

## Purpose

Provides patient-level reasons for risk scores and a temporal view of how model risk changes across uploads/visits.

## SHAP generation

During upload, the highest-scoring condition is selected and `get_shap_factors` loads that condition’s Random Forest artifact. `shap.TreeExplainer` returns local feature contributions. The code handles SHAP’s list, 3-D array, and 2-D array binary-output shapes, then emits up to five factors sorted by absolute impact:

```json
{
  "feature": "hba1c",
  "value": 8.1,
  "impact": 0.1234,
  "display_label": "HbA1c 8.1% (Diabetic)"
}
```

Positive impact is interpreted as increasing risk; negative impact as protective. The summary uses up to three positive labels and at most one negative label.

## Why SHAP

SHAP attributes the difference between a model’s baseline output and a local prediction using Shapley-value principles. TreeExplainer is computationally efficient for tree models and returns signed local contributions, making it more informative than global feature importance.

## Explanation mismatch

Predictions prefer soft-voting ensembles, while upload explanations always use RF. These are surrogate explanations. A feature may influence RF differently from the ensemble’s other members. For faithful explanations, either deploy/explain the same RF or calculate and combine member-level attributions under a documented method.

The frontend bar chart colors positive values red and negative green. SHAP values are not inherently percentage-point changes. Tooltip copy in `SHAPBarChart.jsx` calling them percentages is mathematically misleading.

## Single-prediction factor fallback

The interactive endpoint tries SHAP for the highest-risk condition. Unsupported estimators/errors are swallowed. It then ranks absolute proportional deviation from fixed baselines:

```text
deviation = abs(patient_value - baseline) / max(baseline, 1)
```

Baselines are HbA1c 5.5, SBP 120, DBP 80, glucose 90, cholesterol 180, BMI 22, and age 40. Absolute deviation can rank unusually low values as “risk factors” even when protective, so it is descriptive rather than causal.

## History lifecycle

Each successfully transformed upload row produces a history row using its `last_visit_date` or today. Patient detail orders up to 50 points ascending. Dashboard trends aggregate all history rows into monthly means.

There is no uniqueness rule, source batch ID on history, confidence interval, model version, or raw-feature snapshot. After model retraining, old and new risk values can therefore be plotted together without indicating they came from different models.

## Safe interpretation

An attribution means the model associated that feature with a change in output for this record. It does not prove causality, prescribe treatment, or quantify how real risk will change under intervention.
