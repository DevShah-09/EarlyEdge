import os
from dotenv import load_dotenv

# ── Load Environment Variables ───────────────────────────────────────────────
# Must happen before importing any local modules that depend on os.getenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.upload import router as upload_router
from backend.routers.patients import router as patients_router
from backend.routers.dashboard import router as dashboard_router
from backend.routers.action_plans import router as action_plans_router
from backend.routers.asha import router as asha_router
from backend.routers.simulator import router as simulator_router
from backend.routers.camps import router as camps_router
from backend.routers.auth import router as auth_router
from backend.routers.appointments import router as appointments_router
from backend.routers.risk import router as risk_router


# ── App init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EarlyEdge API",
    description=(
        "NCD Risk Prediction Platform — ML-powered risk scoring, "
        "SHAP explainability, 30-day action plans, ASHA task management, "
        "and screening camp planning for hospitals in India."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow localhost for development and wildcard or specific domain for production
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173", # Vite preview port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://earlyedge-frontend.onrender.com"
]

# Add production URL if available in environment
prod_url = os.getenv("FRONTEND_URL")
if prod_url:
    origins.append(prod_url)

cors_origins = os.getenv("CORS_ORIGINS")
if cors_origins:
    origins.extend([origin.strip() for origin in cors_origins.split(",")])

# If we want to be very loose for the demo/first deploy:
if os.getenv("ALLOW_ALL_CORS", "false").lower() == "true":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers (all under /api prefix) ─────────────────────────────────
app.include_router(upload_router,       prefix="/api")
app.include_router(patients_router,     prefix="/api")
app.include_router(dashboard_router,    prefix="/api")
app.include_router(action_plans_router, prefix="/api")
app.include_router(asha_router,         prefix="/api")
app.include_router(simulator_router,    prefix="/api")
app.include_router(camps_router,        prefix="/api")
app.include_router(auth_router,         prefix="/api")
app.include_router(appointments_router, prefix="/api")
app.include_router(risk_router,         prefix="/api")


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"message": "EarlyEdge API is running", "docs": "/api/docs"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
