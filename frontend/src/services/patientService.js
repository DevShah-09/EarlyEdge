/**
 * SERVICE: patientService.js
 * Handles: GET /api/patients, GET /api/patients/:id, GET /api/action-plans/:id
 */
import api from './api'

/** Get paginated, filtered patient list */
export const getPatients = async ({ page = 1, tier, ward, condition, hasAsha, search } = {}) => {
  const { data } = await api.get('/patients', {
    params: { page, tier, ward, condition, has_asha: hasAsha, search }
  })
  return data
}

/** Get full patient detail with risk scores and SHAP factors */
export const getPatientById = async (patientId) => {
  const { data } = await api.get(`/patients/${patientId}`)
  return data
}

/** Get LangChain-generated 30-day action plan for a patient */
export const getActionPlan = async (patientId, regenerate = false) => {
  const { data } = await api.get(`/action-plans/${patientId}`, {
    params: { regenerate }
  })
  return data
}

/** Assign an ASHA worker to a patient */
export const assignAsha = async (patientId, ashaWorkerId) => {
  const { data } = await api.post(`/patients/${patientId}/assign-asha`, {
    asha_worker_id: ashaWorkerId
  })
  return data
}

/** Approve an AI-generated care plan and send it to the patient via email */
export const approveActionPlan = async (patientId) => {
  const { data } = await api.post(`/patients/${patientId}/approve-plan`)
  return data
}
