# Feature: Risk Simulators

The repository contains three similarly named but different simulation paths.

## 1. Standalone ML Risk Simulator page

Route `/simulator` renders `RiskSimulatorPage.jsx`. It is a fresh-profile calculator, not a before/after simulation. Users adjust demographics, BP, BMI, glucose, HbA1c, cholesterol, smoking, activity, and family history. Submit calls `POST /api/predict-risk` and shows condition probabilities, composite level, factors, and severe-rule warnings.

Its defaults are age 45, male, BP 125/82, BMI 26.5, HbA1c 5.8, glucose 105, cholesterol 195, never smoker, moderate activity, and no family histories.

## 2. Patient-detail heuristic estimator

The patient detail page has controls for target systolic BP, weight reduction, and smoking cessation. It does not call the backend or ML models. The displayed estimate is:

```text
simulated = max(0,
  current_overall
  - (10 if smoking_cessation else 0)
  - abs(weight_reduction_kg) * 1.2
  - max(0, current_SBP - target_SBP) * 0.5
)
```

This formula assumes fixed additive percentage-point reductions. `abs(weight_reduction)` means entering weight gain with a positive sign would still be treated as beneficial if the UI permits it. The formula is a presentation heuristic with no evidence/calibration supplied in the repo.

## 3. Backend stored-patient simulator

`POST /api/simulator` and `simulatorService.js` implement an ML-based before/after flow:

1. Fetch current patient from Supabase.
2. Predict the original record again.
3. Apply optional overrides.
4. If weight changes and height is available, calculate `BMI = weight / height_m²`.
5. Predict the modified record.
6. Return condition and overall deltas as `simulated - original`.
7. Build a narrative from the applied values.

It is read-only and does not store scenarios. The current frontend does not import `simulatorService.js`, so this endpoint is effectively unused.

## Interpretation and recommended consolidation

The standalone endpoint’s severe-rule override is used only by `/predict-risk`; batch prediction inside the stored-patient simulator does not apply it. Also, the simulator recomputes “original” rather than using the stored score, which is appropriate for comparable deltas but can differ from the displayed stored value after a model change.

A single product behavior should replace these three concepts: select a patient or baseline profile, compute both scenarios with the same deployed/versioned model and safety rules, clearly label assumptions, and never imply the delta is a guaranteed treatment effect.
