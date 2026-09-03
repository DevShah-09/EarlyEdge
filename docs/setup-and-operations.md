# Setup and Operations

## Prerequisites

- Python 3.10 or newer;
- Node.js 18 or newer (the current frontend packages may require a newer compatible Node release; check Vite 8 requirements in the installed lockfile/runtime);
- a Supabase project whose schema matches the application;
- optional OpenAI, SMTP, and n8n credentials.

## Backend environment

Create a root or backend `.env` that is visible when starting from the repository root.

| Variable | Required | Purpose/default |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL. |
| `SUPABASE_KEY` | Yes | Backend database client key. Its privilege level determines table access. |
| `SUPABASE_SERVICE_ROLE_KEY` | For signup | Admin user creation and automatic email confirmation. Never expose to frontend. |
| `OPENAI_API_KEY` | No | Enables LLM plans; absent/failure uses deterministic plan. |
| `SMTP_HOST` | No | Default `smtp.gmail.com`. |
| `SMTP_PORT` | No | Default `587`. |
| `SMTP_USER`, `SMTP_PASS` | No | Enable real email; absent means mock logging. |
| `SENDER_EMAIL` | No | Defaults to `SMTP_USER`. |
| `N8N_WEBHOOK_URL` | No | Receives ASHA assignment events. |
| `MODEL_DIR` | No | Default `./ml/saved_models`. |
| `CAMP_CAPACITY` | No | Patients per recommended camp; default 15. |
| `PORT` | No | Uvicorn port; default 8000. |
| `RENDER` | No | `true` disables reload in `run_api.py`. |
| `FRONTEND_URL` | No | Adds one allowed CORS origin. |
| `CORS_ORIGINS` | No | Comma-separated additional origins. |
| `ALLOW_ALL_CORS` | No | `true` replaces origin list with wildcard. |
| `DATABASE_URL` | Only migration script | Direct Postgres URL for `backend/run_migration.py`. |

## Frontend environment

Create `frontend/.env`:

| Variable | Required | Purpose/default |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase browser project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser-safe anonymous key. |
| `VITE_API_URL` | Recommended | Complete API base including `/api`; default `http://localhost:8000/api`. |
| `VITE_API_BASE_URL` | Optional/inconsistent | Signup checks this before `VITE_API_URL`; other services ignore it. |

All `VITE_*` values are compiled into browser assets and must not contain secrets.

## Database preparation

Run `backend/schema.sql` in the Supabase SQL editor, then reconcile these missing items before using all workflows:

- add `upload_batches.status` or remove it from the insert payload;
- define `increment_asha_task_count` and `decrement_asha_task_count` RPCs;
- create authorization/RLS policies appropriate to the deployment;
- seed `asha_workers` if assignment is required.

The repository does not automatically run the full schema at startup.

## Install and run

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

Set-Location frontend
npm install
Set-Location ..

python run_api.py
```

In a second terminal:

```powershell
Set-Location frontend
npm run dev
```

Backend docs are at `/api/docs`; the frontend defaults to port 5173.

The root README currently says `python run_api.py` starts both backend and frontend. The executable only starts Uvicorn, so the frontend requires its own command.

## Model generation

Serialized models are checked in. To reproduce them from the synthetic 5,000-row data:

```powershell
python ml\train.py --csv large_patient_dataset_5000.csv --force
```

Do not train against a routine upload in production. The upload pipeline can train when files are missing, making request latency, model provenance, and concurrent behavior unpredictable.

## Useful verification commands

```powershell
python -m compileall backend ml

Set-Location frontend
npm run lint
npm run build
```

The checked-in Python files named `test_*.py` are mostly manual scripts that call configured/local services; there is no complete pytest suite. Several scripts can modify live Supabase data, so inspect targets and environment before running them.

## Render deployment

`render.yaml` deploys the API and static frontend. Supply Supabase values in the dashboard and add OpenAI/SMTP/n8n variables only if needed. The current backend blueprint enables wildcard CORS and the frontend API URL is hardcoded to a particular Render hostname; update both for the real deployment.

## Data generators

- `ml/generate_patients.py`: creates 5,000 synthetic, one-visit labeled rows by default.
- `generate_historical_data.py`: creates 50 patients × six visits = 300 rows.

Neither generator fixes Python’s random seed, so reruns do not reproduce byte-identical data.
