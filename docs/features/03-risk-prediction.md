# Feature: NCD Risk Prediction

## Purpose

Produces diabetes, hypertension, CVD, and combined risk for batch records and interactive single profiles.

## Models used

The training pipeline evaluates Logistic Regression, Random Forest, XGBoost, LightGBM, and a soft-voting tree ensemble. Current files report:

| Condition | Reported accuracy winner | Accuracy | Actual inference preference |
|---|---|---:|---|
| Diabetes | Ensemble | 83.1% | Ensemble |
| Hypertension | Random Forest | 82.8% | Ensemble |
| CVD | Ensemble | 80.1% | Ensemble |

Inference prefers `{condition}_ensemble.pkl` before `{condition}_best.pkl`, then RF, then LR. This is why hypertension inference does not use its reported accuracy winner.

The ensemble uses soft voting: its member classifiers’ positive-class probabilities are averaged by scikit-learn. There are no custom voting weights. Logistic regression supplies a linear baseline; RF and boosting models capture nonlinear clinical thresholds/interactions; ensembling seeks reduced learner-specific variance.

## Interactive endpoint

`POST /api/predict-risk` accepts age plus defaultable demographics, vitals, lifestyle, family history, and SDOH encodings. Pydantic enforces clinical numeric bounds. It returns:

- `condition_scores` on 0–100;
- `risk_score` on 0–1 and integer `risk_percent`;
- Normal/Moderate/High/Critical label;
- boolean `high_risk`;
- top factors, triggered severe rules, and explanation.

## Composite and severe-rule formulas

For probabilities `D`, `H`, `C`:

```text
ml_score = 0.5 * max(D,H,C) + 0.5 * mean(D,H,C)
final_score = max(ml_score, 0.76 if any severe rule else 0)
```

Severe thresholds are SBP 160, DBP 100, HbA1c 8, fasting glucose 180, cholesterol 240, or BMI 35. Any one makes `high_risk=true` and normally yields Critical because the forced score is 0.76.

Risk labels use Normal < 30%, Moderate 30–<55%, High 55–<75%, and Critical ≥ 75%. Batch/stored tier cutoffs instead use 40% and 70%.

## Fallback behavior

If model artifacts are absent for a single prediction or a model errors, hand-weighted additive rules generate condition scores. On batch upload, absent models can cause synchronous training on that upload; otherwise the same rule fallback applies. See [Machine learning](../machine-learning.md) for every weight and preprocessing default.

## User interface

The standalone `RiskSimulatorPage` is actually an interactive prediction form. It starts with a 45-year-old male profile and submits the full form to `/predict-risk`, then displays the overall level, per-condition bars, factors, severe-rule notices, and narrative.

## Interpretation

Outputs are model probabilities transformed into a prioritization score. They are not a diagnosis or a validated absolute event probability. The synthetic training provenance, lack of calibration, and rule override make clinical interpretation particularly limited.
