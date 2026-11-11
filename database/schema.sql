-- ============================================================
-- DPIS — PostgreSQL Database Schema
-- Run once on a fresh database; idempotent via IF NOT EXISTS.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email            VARCHAR(255) UNIQUE NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    role             VARCHAR(50)  NOT NULL DEFAULT 'patient'
                         CHECK (role IN ('patient', 'clinician', 'admin')),
    is_active        BOOLEAN      DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name               VARCHAR(255) NOT NULL,
    date_of_birth           DATE,
    age                     INTEGER CHECK (age >= 0 AND age <= 150),
    gender                  VARCHAR(20)  CHECK (gender IN ('male', 'female', 'other')),
    weight_kg               DECIMAL(5,2),
    height_cm               DECIMAL(5,2),
    bmi                     DECIMAL(5,2),
    hba1c                   DECIMAL(4,2),
    fasting_glucose         INTEGER,
    blood_pressure_sys      INTEGER,
    blood_pressure_dia      INTEGER,
    family_history          BOOLEAN      DEFAULT FALSE,
    physical_activity_level VARCHAR(20)  DEFAULT 'low'
                                CHECK (physical_activity_level IN ('low', 'medium', 'high')),
    smoking_status          BOOLEAN      DEFAULT FALSE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: prediction_records
-- ============================================================
CREATE TABLE IF NOT EXISTS prediction_records (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prediction_type  VARCHAR(10) NOT NULL
                         CHECK (prediction_type IN ('T1DM', 'T2DM', 'GDM', 'MODY')),
    risk_score       DECIMAL(5,4) NOT NULL
                         CHECK (risk_score >= 0 AND risk_score <= 1),
    risk_category    VARCHAR(10)  NOT NULL
                         CHECK (risk_category IN ('low', 'medium', 'high')),
    model_version    VARCHAR(50)  NOT NULL,
    shap_values      JSONB,
    lime_explanation JSONB,
    input_features   JSONB        NOT NULL,
    recommendations  JSONB,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: audit_logs  (append-only — no UPDATE/DELETE allowed)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50)  NOT NULL,
    resource_id   UUID,
    ip_address    INET,
    user_agent    TEXT,
    details       JSONB,
    timestamp     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_user_id
    ON patients(user_id);

CREATE INDEX IF NOT EXISTS idx_prediction_records_patient_id
    ON prediction_records(patient_id);

CREATE INDEX IF NOT EXISTS idx_prediction_records_risk_category
    ON prediction_records(risk_category);

CREATE INDEX IF NOT EXISTS idx_prediction_records_created_at
    ON prediction_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp
    ON audit_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type
    ON audit_logs(resource_type);

-- ============================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
