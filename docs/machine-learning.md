# Machine-Learning System

## Scope and provenance

The ML subsystem estimates probabilities for diabetes, hypertension, and CVD. The saved report corresponds to 5,000 records and is consistent with `large_patient_dataset_5000.csv`, a synthetic dataset produced by `ml/generate_patients.py`. The repository contains no evidence of training on an external clinical cohort, prospective validation, subgroup fairness analysis, probability calibration, or regulatory review.

Consequently, reported metrics are prototype metrics on synthetic data, not expected clinical performance.

## Training data generation

The generator first chooses a latent profile with probabilities:

- High: 0.15;
- Medium: 0.35;
- Normal: 0.50.

It samples vitals from profile-dependent ranges and adds overlap/noise to 15% of records. Labels are then Bernoulli draws from heuristic probabilities.

### Generated diabetes label

```text
p = 0.05
if HbA1c >= 6.5 or fasting glucose >= 126: p = 0.85
else if HbA1c >= 5.7 or fasting glucose >= 100: p = 0.40
if BMI > 30: p += 0.15
has_diabetes ~ Bernoulli(p)
```

### Generated hypertension label

```text
p = 0.05
if systolic BP >= 140: p = 0.80
else if systolic BP >= 130: p = 0.35
if age > 60: p += 0.10
has_hypertension ~ Bernoulli(p)
```

### Generated CVD label

```text
p = 0.02
if systolic BP > 160 or cholesterol > 240: p = 0.70
else if systolic BP > 140 or cholesterol > 200: p = 0.30
if current smoker: p += 0.20
if age > 65: p += 0.15
has_cvd ~ Bernoulli(p)
```

The code does not explicitly clamp `p` to 1, although the sampled ranges make material overflow uncommon. If a training CSV lacks `has_diabetes` and `has_hypertension`, the trainer creates deterministic labels instead. It assumes `has_cvd` exists whenever the first two label columns exist.

### Deterministic labels used when ground truth is absent

- Diabetes = `HbA1c >= 6.5 OR glucose >= 126 OR (HbA1c >= 5.7 AND BMI >= 30)`.
- Hypertension = `SBP >= 140 OR DBP >= 90 OR (SBP >= 130 AND family_history_hypertension = 1)`.
- CVD = at least two of: `age >= 55`, `cholesterol >= 240`, `SBP >= 130`, current smoker, family history of CVD.

Training on those derived labels can teach a model to reproduce the rules rather than discover independently validated disease risk.

## Input features

The exact 16-column feature vector, in order, is:

1. `age`
2. `bmi`
3. `systolic_bp`
4. `diastolic_bp`
5. `blood_glucose_fasting`
6. `hba1c`
7. `cholesterol_total`
8. `gender_encoded` (female 0, male 1; unknown becomes 0)
9. `smoking_status` (never 0, former 1, current 2)
10. `physical_activity` (sedentary 0, moderate 1, active 2)
11. `family_history_diabetes`
12. `family_history_hypertension`
13. `family_history_cvd`
14. `food_security` (insecure 0, secure 1)
15. `income_level_encoded` (low 0, medium 1, high 2)
16. `housing_status_encoded` (homeless 0, unstable 1, stable 2)

Ward is defined but not part of the model vector. Weight and height are used only to derive BMI when BMI is missing.

## Preprocessing

`backend/ml/preprocessor.py` performs:

- BMI calculation: `BMI = weight_kg / (height_cm / 100)^2`, only when the BMI column is absent or entirely null;
- fixed categorical encodings;
- default imputation rather than fitted statistical imputation;
- hard clipping of clinical ranges.

| Field | Default | Clamp |
|---|---:|---:|
| age | 40 | 0–120 |
| BMI | 22 | 10–70 |
| systolic BP | 120 | 60–240 |
| diastolic BP | 80 | 40–160 |
| fasting glucose | 90 | 40–600 |
| HbA1c | 5.5 | 3–20 |
| cholesterol | 180 | 50–500 |

Other defaults are nonsmoker, moderate activity, no family history, food secure, medium income, female/unknown encoding, and stable housing. Batch and single-record preprocessing are similar but implemented separately, so changes must be synchronized manually.

## Split and imbalance treatment

Each condition is trained independently with an 80/20 stratified train/test split (`random_state=42`). If the positive class has at least five training examples and imbalanced-learn is installed, SMOTE generates synthetic minority rows on the training partition only. `k_neighbors = min(5, positive_training_count - 1)`.

Class balancing is also configured in LR/RF, and `scale_pos_weight = negatives / positives` is passed to XGBoost/LightGBM after SMOTE. When SMOTE makes classes equal this ratio is approximately 1. There is no cross-validation or independent final holdout.

## Candidate models and rationale

| Key | Model/configuration | Intended reason |
|---|---|---|
| `lr` | StandardScaler → LogisticRegression, balanced class weight, max 500 iterations | Linear, explainable baseline; scaling is required for stable coefficient fitting. |
| `rf` | 200-tree RandomForest, depth 12, balanced class weight | Captures nonlinear thresholds/interactions and supports TreeSHAP. |
| `xgb` | 200 trees, depth 6, learning rate 0.05 | Gradient boosting for strong tabular performance. |
| `lgbm` | 200 trees, depth 8, learning rate 0.05 | Efficient gradient boosting with a different tree-growth implementation. |
| `ensemble` | Soft voting over RF, XGB, and LightGBM when at least two exist | Averages predicted probabilities to reduce dependence on one learner. |

XGBoost, LightGBM, and SMOTE imports are optional in code even though they are listed in requirements. Candidate availability therefore depends on the runtime.

## Model-selection discrepancy

The trainer module says selection prioritizes recall, but the implementation initializes `best_accuracy` and replaces the best model when `acc > best_accuracy`. Therefore `{condition}_best.pkl` is selected by accuracy, not recall. The report’s `best_recall` is merely the recall of that accuracy winner.

Inference introduces another distinction: it searches model keys in the order `ensemble`, `best`, `rf`, `lr`. Because ensemble files exist, all three current production predictions use the ensemble, even hypertension’s report says the accuracy winner is RF.

## Saved evaluation report

| Condition | Accuracy winner | Accuracy | Recall | ROC AUC | Runtime inference preference |
|---|---|---:|---:|---:|---|
| Diabetes | Ensemble | 0.831 | 0.7844 | 0.9069 | Ensemble |
| Hypertension | Random Forest | 0.828 | 0.8143 | 0.8897 | Ensemble (accuracy 0.823, recall 0.8196) |
| CVD | Ensemble | 0.801 | 0.6982 | 0.8560 | Ensemble |

Metrics come from `ml/saved_models/training_report.json`. Accuracy is `(TP + TN) / N`; recall is `TP / (TP + FN)`; precision is `TP / (TP + FP)`; F1 is `2 * precision * recall / (precision + recall)`. ROC AUC measures ranking across thresholds. The saved test set contains 1,000 rows per condition.

## Probability and composite formulas

Each model supplies a positive-class probability. Batch output converts it to 0–100. With condition scores `D`, `H`, and `C` on the same scale:

```text
mean = (D + H + C) / 3
overall = 0.5 * max(D, H, C) + 0.5 * mean
```

Thus the largest condition contributes two-thirds of the final weight when expanded, and each other condition contributes one-sixth.

Batch tiers are:

- High: `overall >= 70`;
- Medium: `40 <= overall < 70`;
- Low: `overall < 40`.

The single-patient endpoint uses the same composite on a 0–1 scale, then applies severe-rule logic. Any of these thresholds forces the final score to at least 0.76:

- SBP ≥ 160;
- DBP ≥ 100;
- HbA1c ≥ 8.0;
- fasting glucose ≥ 180;
- cholesterol ≥ 240;
- BMI ≥ 35.

Its display levels are Normal `[0, 0.30)`, Moderate `[0.30, 0.55)`, High `[0.55, 0.75)`, and Critical `[0.75, 1]`. `high_risk` is true if a severe rule fires or score ≥ 0.55. These levels intentionally differ from the stored batch tiers but can be confusing in the UI.

## Rule-based inference fallback

If model files are unavailable or probability prediction throws, additive rules are used:

| Condition | Additions |
|---|---|
| Diabetes | +0.40 HbA1c ≥ 5.7; +0.30 glucose ≥ 100; +0.15 BMI ≥ 25. |
| Hypertension | +0.45 SBP ≥ 130; +0.30 DBP ≥ 85; +0.10 BMI ≥ 30. |
| CVD | +0.25 age ≥ 55; +0.25 current smoker; +0.20 cholesterol ≥ 200; +0.20 SBP ≥ 140. |

Scores are capped at 1. These weights are hand-authored heuristics, not coefficients learned or clinically calibrated in this repository.

## Explainability

The upload pipeline calls `backend/ml/explainer.py`, which always loads `{condition}_rf.pkl` and uses `shap.TreeExplainer`. It ranks absolute SHAP values, retains up to five, and describes positive impacts as risk-increasing and at most one negative impact as protective.

Because inference currently prefers the soft-voting ensemble while the explainer uses RF, uploaded SHAP values explain a surrogate RF, not necessarily the probability returned by the ensemble. In single prediction, the code tries TreeExplainer against `best` then RF; if the selected best object is an ensemble or unsupported object, it silently falls back to ranking absolute deviation from fixed healthy baselines.

SHAP impact is in the model explainer’s output space and should not be labeled as a percentage-point risk change without transformation. The reusable frontend `SHAPBarChart` tooltip currently does label values as percent changes; this is a presentation caveat.

## Retraining

From the repository root:

```powershell
python ml/train.py --csv large_patient_dataset_5000.csv --force
```

Without `--force`, training exits if a best or RF file exists for all conditions. The script writes all successful candidates, `{condition}_best.pkl`, and `training_report.json` to `MODEL_DIR` (default `ml/saved_models`). Reproducibility is partial: split/model/SMOTE random seeds are fixed, but the synthetic dataset generators themselves do not set a random seed.
