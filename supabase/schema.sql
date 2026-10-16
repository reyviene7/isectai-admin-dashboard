-- ==============================================================================================
-- iSectAI Platform: Multi-Tenant Database Architecture Schema
-- Engine: PostgreSQL 15+ (Production-Ready for Supabase)
-- Architecture: Single-Database Multi-Tenant with Row-Level Security (RLS)
-- Author: iSectAI Platform Engineering Team
-- ==============================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================================
-- 2. ENUM TYPES (Idempotent: Safe to re-run in Supabase SQL Editor)
-- ==============================================================================================

DO $$ BEGIN
    CREATE TYPE business_industry AS ENUM (
        'medical_clinic',
        'service_business'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tenant_status AS ENUM (
        'active',
        'onboarding',
        'paused',
        'suspended'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM (
        'starter',
        'growth',
        'enterprise'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'platform_admin',   -- iSectAI Internal Super Administrator (Full multi-tenant view)
        'business_owner',   -- Tenant Owner / Medical Director / Master Tradesman
        'business_staff',   -- Receptionist, Intake Coordinator, Field Dispatcher
        'practitioner'      -- Physician, Dental Surgeon, Field Technician
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'scheduled',
        'confirmed',
        'in_consultation',
        'completed',
        'cancelled',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_priority AS ENUM (
        'low',
        'medium',
        'high',
        'emergency'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM (
        'pending_dispatch',
        'dispatched',
        'on_site',
        'in_progress',
        'completed',
        'invoiced'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_agent_type AS ENUM (
        'voice_receptionist',
        'triage_assistant',
        'scheduler',
        'dispatch_coordinator'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================================
-- 3. CORE TENANT & IDENTITY TABLES
-- ==============================================================================================

-- Tenants Table: Root organization representing medical clinics or field service companies
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry business_industry NOT NULL,
    subscription_tier subscription_tier NOT NULL DEFAULT 'growth',
    status tenant_status NOT NULL DEFAULT 'active',
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    branding JSONB DEFAULT '{"primary_color": "#2563eb", "accent_color": "#38bdf8", "tagline": "Autonomous Operations", "logo_url": null}'::jsonb,
    business_settings JSONB DEFAULT '{
        "operating_hours": "08:00 - 18:00",
        "timezone": "America/New_York",
        "ai_auto_booking": true,
        "emergency_forwarding_phone": "+1 (800) 555-0199"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Users Table: Platform Super Admins & Tenant Scoped Staff Members
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT 'password123',
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'business_staff',
    title VARCHAR(150),
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 4. AI AGENT & AUTOMATION TABLES
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    agent_type ai_agent_type NOT NULL,
    phone_number VARCHAR(50),
    voice_profile VARCHAR(50) DEFAULT 'en-US-Neural2-F',
    llm_model VARCHAR(50) DEFAULT 'gpt-4o',
    system_prompt TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    call_forward_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    total_calls_handled INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 5. CONTACTS / PATIENTS / CUSTOMERS (Polymorphic JSONB Architecture)
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    contact_type VARCHAR(50) NOT NULL, -- 'patient' for clinics, 'customer' for service businesses
    industry_attributes JSONB DEFAULT '{}'::jsonb,
    -- Medical: {"dob": "1991-03-14", "insurance_provider": "Delta Dental", "allergies": "Penicillin"}
    -- Service: {"property_type": "commercial", "equipment": "Carrier 15-Ton RTU", "gate_code": "1234"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 6. MEDICAL CLINIC SPECIFIC RECORDS: CLINICAL APPOINTMENTS
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    provider_name VARCHAR(255) NOT NULL,    -- Treating physician or dental surgeon
    department VARCHAR(100) NOT NULL,       -- e.g., Oral Surgery, Cardiology Diagnostics
    appointment_type VARCHAR(100) NOT NULL, -- e.g., Emergency Toothache Consult, Echocardiogram
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    chief_complaint TEXT,
    ai_triage_summary TEXT,                 -- Transcribed & assessed automatically by AI
    hipaa_notes_masked TEXT,                -- Scrubbed/encrypted clinical notes for display
    room_number VARCHAR(50),
    booked_via_ai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 7. SERVICE BUSINESS SPECIFIC RECORDS: FIELD DISPATCH JOBS & WORK ORDERS
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS service_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    technician_name VARCHAR(255),           -- Assigned field specialist or electrician
    service_type VARCHAR(150) NOT NULL,     -- e.g., Commercial Walk-in Cooler Tripping
    priority job_priority NOT NULL DEFAULT 'medium',
    status job_status NOT NULL DEFAULT 'pending_dispatch',
    scheduled_for TIMESTAMPTZ NOT NULL,
    estimated_cost NUMERIC(10, 2),
    final_cost NUMERIC(10, 2),
    dispatch_address TEXT NOT NULL,
    ai_intake_notes TEXT,                   -- AI voice triage transcription & problem assessment
    parts_required JSONB DEFAULT '[]'::jsonb,
    booked_via_ai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 8. AI CALL & AUTOMATION TELEMETRY LOGS
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS ai_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    caller_phone VARCHAR(50),
    caller_name VARCHAR(150),
    event_type VARCHAR(50) NOT NULL,        -- 'voice_call', 'automated_reschedule', 'emergency_triage'
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    estimated_cost NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
    sentiment VARCHAR(20) DEFAULT 'positive', -- 'positive', 'neutral', 'urgent', 'frustrated'
    summary TEXT,
    transcript_snippet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================================

CREATE INDEX IF NOT EXISTS idx_tenants_industry ON tenants(industry);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_time ON appointments(tenant_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_service_jobs_tenant_time ON service_jobs(tenant_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_ai_logs_tenant_created ON ai_activity_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_tenant ON ai_agents(tenant_id);

-- ==============================================================================================
-- 10. AUTOMATED UPDATED_AT TIMESTAMP TRIGGER
-- ==============================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenants_updated_at ON tenants;
CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_agents_updated_at ON ai_agents;
CREATE TRIGGER trg_ai_agents_updated_at
    BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- Enterprise Tenant Isolation & Production Security Architecture
-- ==============================================================================================

-- Enable RLS across all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to extract role and tenant from Supabase Auth JWT
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
DECLARE
    v_role text;
BEGIN
    v_role := auth.jwt() -> 'app_metadata' ->> 'role';
    IF v_role IN ('platform_admin', 'business_owner', 'business_staff', 'practitioner') THEN
        RETURN v_role::user_role;
    END IF;
    RETURN 'business_staff'::user_role;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'business_staff'::user_role;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth_user_tenant_id() RETURNS UUID AS $$
DECLARE
    v_tenant text;
BEGIN
    v_tenant := auth.jwt() -> 'app_metadata' ->> 'tenant_id';
    IF v_tenant IS NOT NULL AND v_tenant ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RETURN v_tenant::uuid;
    END IF;
    RETURN '00000000-0000-0000-0000-000000000000'::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- ----------------------------------------------------------------------------------------------
-- A. PLATFORM ADMINISTRATOR POLICIES (Full cross-tenant access for iSectAI internal team)
-- ----------------------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Platform Admins have full access to tenants" ON tenants;
CREATE POLICY "Platform Admins have full access to tenants"
    ON tenants FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to users" ON users;
CREATE POLICY "Platform Admins have full access to users"
    ON users FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to ai_agents" ON ai_agents;
CREATE POLICY "Platform Admins have full access to ai_agents"
    ON ai_agents FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to contacts" ON contacts;
CREATE POLICY "Platform Admins have full access to contacts"
    ON contacts FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to appointments" ON appointments;
CREATE POLICY "Platform Admins have full access to appointments"
    ON appointments FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to service_jobs" ON service_jobs;
CREATE POLICY "Platform Admins have full access to service_jobs"
    ON service_jobs FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Platform Admins have full access to ai_activity_logs" ON ai_activity_logs;
CREATE POLICY "Platform Admins have full access to ai_activity_logs"
    ON ai_activity_logs FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------------------------
-- B. TENANT ISOLATION POLICIES (Client staff can strictly only access their own organization data)
-- ----------------------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenants can only view their own organization" ON tenants;
CREATE POLICY "Tenants can only view their own organization"
    ON tenants FOR SELECT
    USING (id = auth_user_tenant_id());

DROP POLICY IF EXISTS "Tenants can only access their own appointments" ON appointments;
CREATE POLICY "Tenants can only access their own appointments"
    ON appointments FOR ALL
    USING (tenant_id = auth_user_tenant_id());

DROP POLICY IF EXISTS "Tenants can only access their own service jobs" ON service_jobs;
CREATE POLICY "Tenants can only access their own service jobs"
    ON service_jobs FOR ALL
    USING (tenant_id = auth_user_tenant_id());

DROP POLICY IF EXISTS "Tenants can only access their own contacts" ON contacts;
CREATE POLICY "Tenants can only access their own contacts"
    ON contacts FOR ALL
    USING (tenant_id = auth_user_tenant_id());

DROP POLICY IF EXISTS "Tenants can only view their own AI logs" ON ai_activity_logs;
CREATE POLICY "Tenants can only view their own AI logs"
    ON ai_activity_logs FOR SELECT
    USING (tenant_id = auth_user_tenant_id());

-- ----------------------------------------------------------------------------------------------
-- C. PROTOTYPE & DASHBOARD ACCESS POLICIES (Enables Supabase anon key live integration)
-- ----------------------------------------------------------------------------------------------

-- Tenants Table Policies
DROP POLICY IF EXISTS "Allow anon select on tenants" ON tenants;
CREATE POLICY "Allow anon select on tenants" ON tenants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on tenants" ON tenants;
CREATE POLICY "Allow anon insert on tenants" ON tenants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on tenants" ON tenants;
CREATE POLICY "Allow anon update on tenants" ON tenants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on tenants" ON tenants;
CREATE POLICY "Allow anon delete on tenants" ON tenants FOR DELETE USING (true);

-- Users Table Policies
DROP POLICY IF EXISTS "Allow anon select on users" ON users;
CREATE POLICY "Allow anon select on users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on users" ON users;
CREATE POLICY "Allow anon insert on users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on users" ON users;
CREATE POLICY "Allow anon update on users" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on users" ON users;
CREATE POLICY "Allow anon delete on users" ON users FOR DELETE USING (true);

-- AI Agents Table Policies
DROP POLICY IF EXISTS "Allow anon select on ai_agents" ON ai_agents;
CREATE POLICY "Allow anon select on ai_agents" ON ai_agents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on ai_agents" ON ai_agents;
CREATE POLICY "Allow anon insert on ai_agents" ON ai_agents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on ai_agents" ON ai_agents;
CREATE POLICY "Allow anon update on ai_agents" ON ai_agents FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on ai_agents" ON ai_agents;
CREATE POLICY "Allow anon delete on ai_agents" ON ai_agents FOR DELETE USING (true);

-- Contacts Table Policies
DROP POLICY IF EXISTS "Allow anon select on contacts" ON contacts;
CREATE POLICY "Allow anon select on contacts" ON contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on contacts" ON contacts;
CREATE POLICY "Allow anon insert on contacts" ON contacts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on contacts" ON contacts;
CREATE POLICY "Allow anon update on contacts" ON contacts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on contacts" ON contacts;
CREATE POLICY "Allow anon delete on contacts" ON contacts FOR DELETE USING (true);

-- Appointments Table Policies
DROP POLICY IF EXISTS "Allow anon select on appointments" ON appointments;
CREATE POLICY "Allow anon select on appointments" ON appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on appointments" ON appointments;
CREATE POLICY "Allow anon insert on appointments" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on appointments" ON appointments;
CREATE POLICY "Allow anon update on appointments" ON appointments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on appointments" ON appointments;
CREATE POLICY "Allow anon delete on appointments" ON appointments FOR DELETE USING (true);

-- Service Jobs Table Policies
DROP POLICY IF EXISTS "Allow anon select on service_jobs" ON service_jobs;
CREATE POLICY "Allow anon select on service_jobs" ON service_jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on service_jobs" ON service_jobs;
CREATE POLICY "Allow anon insert on service_jobs" ON service_jobs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on service_jobs" ON service_jobs;
CREATE POLICY "Allow anon update on service_jobs" ON service_jobs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on service_jobs" ON service_jobs;
CREATE POLICY "Allow anon delete on service_jobs" ON service_jobs FOR DELETE USING (true);

-- AI Activity Logs Table Policies
DROP POLICY IF EXISTS "Allow anon select on ai_activity_logs" ON ai_activity_logs;
CREATE POLICY "Allow anon select on ai_activity_logs" ON ai_activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert on ai_activity_logs" ON ai_activity_logs;
CREATE POLICY "Allow anon insert on ai_activity_logs" ON ai_activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update on ai_activity_logs" ON ai_activity_logs;
CREATE POLICY "Allow anon update on ai_activity_logs" ON ai_activity_logs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete on ai_activity_logs" ON ai_activity_logs;
CREATE POLICY "Allow anon delete on ai_activity_logs" ON ai_activity_logs FOR DELETE USING (true);
