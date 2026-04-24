/**
 * SERVICE: riskService.js
 * Handles: POST /api/predict-risk — single-patient ML risk prediction
 *
 * Payload shape matches backend/schemas/risk_schemas.py → RiskInput
 * Response shape matches backend/schemas/risk_schemas.py → RiskOutput
 */
import api from './api'

/**
 * Send a patient's vitals to the ML endpoint and receive risk scores.
 *
 * @param {object} patientData - Fields matching RiskInput schema:
 *   age, gender, systolic_bp, diastolic_bp, blood_glucose_fasting, hba1c,
 *   cholesterol_total, bmi, smoking_status, physical_activity?,
 *   family_history_diabetes?, family_history_hypertension?, family_history_cvd?,
 *   food_security?, income_level_encoded?, housing_status_encoded?
 *
 * @returns {Promise<RiskOutput>} Object with:
 *   high_risk, risk_score, risk_percent, risk_level, top_factors,
 *   condition_scores (diabetes, hypertension, cvd), rule_triggered, explanation
 */
export const predictRisk = async (patientData) => {
  const { data } = await api.post('/predict-risk', patientData)
  return data
}
