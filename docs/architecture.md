# Architecture

## Component view

```text
Browser (React/Vite)
  |-- Supabase JS SDK --------------------> Supabase Auth
  |-- Axios + optional Supabase JWT ------> FastAPI /api/*
                                               |
                                               |-- Supabase Python client --> PostgreSQL
                                               |-- joblib models ----------> local .pkl files
                                               |-- LangChain -------------> OpenAI API
                                               |-- smtplib ----------------> SMTP server
                                               `-- requests ---------------> n8n webhook
```

### Frontend

`frontend/src/App.jsx` defines two public routes (`/login`, `/signup`) and nine protected application routes. `AuthContext` owns the Supabase session. `ProtectedRoute` blocks protected pages when no session exists. `AppContext` contains in-memory upload/notification flags; it is not persisted.

All normal API services share `frontend/src/services/api.js`. Its Axios interceptor retrieves the current Supabase access token and sends it as `Authorization: Bearer <JWT>`. The API base is `VITE_API_URL`, defaulting to `http://localhost:8000/api`.

### Backend

`backend/main.py` creates one FastAPI application and mounts ten routers under `/api`: upload, patients, dashboard, action plans, ASHA, simulator, camps, auth, appointments, and risk prediction. It also exposes `/` and `/health` outside the API prefix.

The backend uses a lazily created singleton Supabase client from `backend/database.py`. That client uses `SUPABASE_KEY`. The registration endpoint separately requires `SUPABASE_SERVICE_ROLE_KEY` for Supabase Admin Auth.

There is no repository/service abstraction around tables: routers and services build Supabase queries directly. Aggregation-heavy features often load an entire selected table into pandas.

### ML runtime

Serialized joblib objects live in `ml/saved_models/`. `backend/ml/predictor.py` caches loaded models in-process. The default model directory is `./ml/saved_models`, which assumes the process working directory is the repository root. If required models are absent during a batch upload, training can run synchronously on the uploaded dataset; without a dataset, inference falls back to clinical scoring rules.

### Persistence

Supabase PostgreSQL stores upload batches, the latest patient state, risk history, action plans, ASHA workers/tasks, camps, and appointments. Supabase Auth stores application users separately. See [Database and data model](data-model.md).

## Runtime request paths

### Upload path

```text
UploadPage -> POST /api/upload -> pandas reader -> preprocess
           -> model inference -> SHAP attempt -> batch insert
           -> patient upsert -> risk-history insert -> summary response
```

### Interactive risk path

```text
RiskSimulatorPage -> POST /api/predict-risk -> Pydantic validation
                  -> preprocessing -> cached model probabilities
                  -> severe-threshold override -> explanation -> response
```

### Care-plan path

```text
PatientDetailPage -> GET /api/action-plans/{id}?regenerate=true
                  -> OpenAI gpt-4o-mini OR deterministic fallback
                  -> replace cached plan
                  -> clinician approves
                  -> POST /api/patients/{id}/approve-plan -> SMTP/mock dispatch
```

## Route protection and trust boundary

The frontend protects pages and attaches a JWT, but the FastAPI backend does not validate that JWT or enforce roles/tenant ownership. Therefore browser route protection is a user-experience control, not an API security boundary. RLS statements in `backend/schema.sql` are commented out. A production deployment needs backend token verification, authorization, tenant filters, and enabled RLS.

## Deployment

`render.yaml` defines:

- a Python web service that installs `backend/requirements.txt` and starts `python run_api.py`;
- a static site that runs `npm install && npm run build` inside `frontend/` and serves `frontend/dist`;
- a catch-all rewrite to `/index.html` for client-side routing.

The backend is configured with `ALLOW_ALL_CORS=true` in the current blueprint. This changes the curated origin list to `*`. Because `allow_credentials=True` is also set, this should be reviewed and tightened for production.

## Technology rationale

| Technology | Role | Why it fits this prototype |
|---|---|---|
| React | Component UI and client routing | Supports data-heavy screens and reusable widgets. |
| Vite | Development/build tooling | Fast local server and static production output. |
| Tailwind CSS | UI styling | Rapid utility-based styling without a custom component framework. |
| Chart.js | Risk, trend, and explanation charts | Direct React integration for common clinical dashboard charts. |
| FastAPI/Pydantic | HTTP API and contracts | Async endpoints, validation, and generated OpenAPI docs. |
| pandas | Upload cleanup and aggregation | Convenient CSV/Excel and tabular transformations. |
| Supabase | PostgreSQL plus authentication | Managed persistence and client/server SDKs. |
| scikit-learn/XGBoost/LightGBM | Classification | Provides interpretable baseline and nonlinear ensemble candidates. |
| SHAP | Feature attribution | Produces local signed contributions for tree models. |
| LangChain + OpenAI | Care-plan generation | Wraps structured prompting and asynchronous chat-model invocation. |

These are engineering choices visible in the repository; no formal architecture decision records or benchmark comparisons are included.
