# Feature: AI Action Plans and Email Approval

## Purpose

Generates a four-week, culturally contextual NCD risk-reduction plan, caches it, displays it for clinician review, records approval, and sends it to the patient.

## Generation flow

1. Patient detail requests `GET /api/action-plans/{patient_id}?regenerate=true`.
2. The backend loads demographics, three risks, one top-factor label, income level, and food security.
3. `langchain_service.py` generates four weekly steps using OpenAI or a deterministic fallback.
4. The response adds overall/tier, primary condition, factors, time, and cache flag.
5. Existing patient plans are deleted and the new JSON is inserted.

The page always requests regeneration, so the cache-return path is not used by this UI. Other callers can omit `regenerate`; expiry is not checked and the unsorted first row is used.

## LLM model and why

The executable code uses `ChatOpenAI(model="gpt-4o-mini", temperature=0.3)`. The service header incorrectly says GPT-4o. A smaller model is consistent with a structured, relatively narrow generation task and lower cost/latency. Temperature 0.3 aims for limited variation and more consistent structure. No repository benchmark documents this choice.

The system message asks for clinical decision support specialized in Indian NCD prevention, evidence-based/culturally appropriate plans, and JSON-only output. The user prompt includes patient risk/SDOH context. `json.loads` parses free-form model text; there is no JSON schema response mode or ActionStep validation before caching beyond final FastAPI response validation.

## Fallback plan

If the API key is absent or the call/parsing fails, a four-week rule template is returned. The dominant condition is the maximum of diabetes, hypertension, and CVD (ties favor diabetes, then hypertension). Weeks 1–2 use condition-specific diet/activity/testing suggestions; weeks 3–4 are common clinical check-in and follow-up steps.

## Approval and email

`POST /api/patients/{id}/approve-plan` finds the latest plan by generation time, fetches name/email, records `is_approved=true` and `approved_at`, then passes `plan_steps` to the email service.

With SMTP credentials, it sends an HTML message using STARTTLS. Without them, it logs the destination and whole plan, returns success, and the API says it was sent. Email content uses RAMBharose branding rather than EarlyEdge.

Approval is written before sending, and delivery failure does not roll approval back. There is no delivery-status field, retry queue, idempotency key, approval user ID, plan edit/redline workflow, or audit record.

## Clinical limitations

The LLM is not grounded against a versioned guideline corpus and receives no medication, allergy, pregnancy, renal/hepatic, disability, or comorbidity information. Clinician approval is essential, but the backend currently does not verify that the approver is an authenticated clinician.
