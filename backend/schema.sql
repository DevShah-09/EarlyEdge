-- ============================================================
-- EarlyEdge — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable UUID generation ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: upload_batches
-- One row per hospital CSV upload event
-- ============================================================
CREATE TABLE IF NOT EXISTS upload_batches (
    batch_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     TEXT,                      -- for multi-tenant later
    filename        TEXT NOT NULL,
    total_records   INT  NOT NULL DEFAULT 0,
    processed       INT  NOT NULL DEFAULT 0,
    failed          INT  NOT NULL DEFAULT 0,
    high_risk_count INT  NOT NULL DEFAULT 0,
    medium_risk_count INT NOT NULL DEFAULT 0,
    low_risk_count  INT  NOT NULL DEFAULT 0,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: patients
-- Core patient table — one row per patient
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
    -- Identity
    patient_id          TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    age                 INT,
    gender              TEXT,                  -- 'M' or 'F'

    -- Clinical measurements
    weight_kg           NUMERIC(5,2),
    height_cm           NUMERIC(5,2),
    bmi                 NUMERIC(5,2),
    systolic_bp         INT,
    diastolic_bp        INT,
    blood_glucose_fasting NUMERIC(6,2),
    hba1c               NUMERIC(4,2),
    cholesterol_total   NUMERIC(6,2),

    -- Lifestyle
    smoking_status      INT DEFAULT 0,         -- 0=Never,1=Former,2=Current
    physical_activity   INT DEFAULT 1,         -- 0=Sedentary,1=Moderate,2=Active

    -- Family history
    family_history_diabetes    INT DEFAULT 0,  -- 0=No, 1=Yes
    family_history_hypertension INT DEFAULT 0,
    family_history_cvd         INT DEFAULT 0,

    -- Social Determinants Of Health (SDOH)
    income_level        TEXT DEFAULT 'Medium', -- 'Low','Medium','High'
    food_security       INT DEFAULT 1,         -- 0=Insecure, 1=Secure
    housing_status      TEXT DEFAULT 'Stable', -- 'Stable','Unstable','Homeless'
    ward                TEXT,
    last_visit_date     DATE,

    -- ASHA assignment
    asha_worker_id      TEXT,

    -- ML Risk Scores (populated after prediction pipeline)
    diabetes_risk       NUMERIC(5,2),
    hypertension_risk   NUMERIC(5,2),
    cvd_risk            NUMERIC(5,2),
    overall_risk        NUMERIC(5,2),
    risk_tier           TEXT,                  -- 'High','Medium','Low'
    primary_condition   TEXT,                  -- e.g. 'Diabetes + HTN'
    xai_summary         TEXT,                  -- e.g. 'High risk due to BMI 31 + Smoking'
    top_factor_label    TEXT,                  -- Short label for table display

    -- SHAP factors stored as JSONB array
    shap_factors        JSONB,

    -- Metadata
    email               TEXT,
    upload_batch_id     UUID REFERENCES upload_batches(batch_id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast risk-tier filtering (most common dashboard query)
CREATE INDEX IF NOT EXISTS idx_patients_risk_tier ON patients(risk_tier);
CREATE INDEX IF NOT EXISTS idx_patients_ward ON patients(ward);
CREATE INDEX IF NOT EXISTS idx_patients_overall_risk ON patients(overall_risk DESC);

-- ============================================================
-- TABLE: action_plans
-- Cached LangChain-generated 30-day action plans
-- ============================================================
CREATE TABLE IF NOT EXISTS action_plans (
    plan_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      TEXT REFERENCES patients(patient_id) ON DELETE CASCADE,
    plan_json       JSONB NOT NULL,            -- Full ActionPlanResponse JSON
    is_approved     BOOLEAN DEFAULT FALSE,     -- Doctor verification status
    approved_at     TIMESTAMPTZ,
    generated_at    TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_action_plans_patient ON action_plans(patient_id);

-- ============================================================
-- TABLE: asha_workers
-- ASHA health worker roster
-- ============================================================
CREATE TABLE IF NOT EXISTS asha_workers (
    worker_id       TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    phone           TEXT,
    ward            TEXT,
    zone            TEXT,
    active_tasks    INT DEFAULT 0,
    max_capacity    INT DEFAULT 10,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asha_workers_ward ON asha_workers(ward);

-- ============================================================
-- TABLE: asha_tasks
-- Task assignments for ASHA workers
-- ============================================================
CREATE TABLE IF NOT EXISTS asha_tasks (
    task_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      TEXT REFERENCES patients(patient_id) ON DELETE CASCADE,
    asha_worker_id  TEXT REFERENCES asha_workers(worker_id),
    task_type       TEXT DEFAULT 'Home Visit',  -- 'Home Visit','Follow-up Call','Sample Collection'
    status          TEXT DEFAULT 'Pending',      -- 'Pending','InProgress','Done'
    priority        TEXT,                        -- mirrors patient risk_tier
    due_date        DATE,
    distance_km     NUMERIC(5,2),
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asha_tasks_status ON asha_tasks(status);
CREATE INDEX IF NOT EXISTS idx_asha_tasks_worker ON asha_tasks(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_asha_tasks_patient ON asha_tasks(patient_id);

-- ============================================================
-- TABLE: screening_camps
-- Planned and completed screening camp events
-- ============================================================
CREATE TABLE IF NOT EXISTS screening_camps (
    camp_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward            TEXT NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    venue           TEXT,
    target_count    INT DEFAULT 0,
    status          TEXT DEFAULT 'Planned',     -- 'Planned','Active','Completed'
    screenings      JSONB,                       -- ["Blood Glucose","BP Check","BMI"]
    staff_required  JSONB,                       -- {"doctors":2,"nurses":3,"ashas":5}
    estimated_cost  NUMERIC(10,2),
    actual_screened INT,
    high_risk_detected INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camps_ward ON screening_camps(ward);
CREATE INDEX IF NOT EXISTS idx_camps_start_date ON screening_camps(start_date);

-- ============================================================
-- Row Level Security (RLS) — Enable for production
-- Uncomment and configure after setting up auth
-- ============================================================
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE asha_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE screening_camps ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: patient_risk_history
-- Temporal history of patient risk scores across multi-visits
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_risk_history (
    history_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      TEXT REFERENCES patients(patient_id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    diabetes_risk   NUMERIC(5,2),
    hypertension_risk NUMERIC(5,2),
    cvd_risk        NUMERIC(5,2),
    overall_risk    NUMERIC(5,2),
    risk_tier       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_patient ON patient_risk_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON patient_risk_history(assessment_date);
