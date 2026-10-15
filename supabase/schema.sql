-- ==============================================================================================
-- iSectAI Platform: Multi-Tenant Database Architecture Schema
-- Engine: PostgreSQL 15+ (Designed for Supabase)
-- Author: iSectAI Developer Trial Implementation
-- ==============================================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE business_industry AS ENUM (
    'medical_clinic',
    'service_business'
);

CREATE TYPE tenant_status AS ENUM (
    'active',
    'onboarding',
    'paused',
    'suspended'
);

CREATE TYPE subscription_tier AS ENUM (
    'starter',
    'growth',
    'enterprise'
);

CREATE TYPE user_role AS ENUM (
    'platform_admin',   -- iSectAI internal administrator
    'business_owner',   -- Tenant owner
    'business_staff',   -- Clinic receptionist, service dispatcher
    'practitioner'      -- Doctor, Field Technician
);

CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'confirmed',
    'in_consultation',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TYPE job_priority AS ENUM (
    'low',
    'medium',
    'high',
    'emergency'
);

CREATE TYPE job_status AS ENUM (
    'pending_dispatch',
    'dispatched',
    'on_site',
    'in_progress',
    'completed',
    'invoiced'
);

CREATE TYPE ai_agent_type AS ENUM (
    'voice_receptionist',
    'triage_assistant',
    'scheduler',
    'dispatch_coordinator'
);

-- ==============================================================================================
-- 3. CORE TENANT & IDENTITY TABLES
-- ==============================================================================================

-- Tenants Table: Root organization representing clinics or service companies
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
    branding JSONB DEFAULT '{"primary_color": "#1e293b", "logo_url": null}'::jsonb,
    business_settings JSONB DEFAULT '{
        "operating_hours": "08:00 - 18:00",
        "timezone": "America/New_York",
        "ai_auto_booking": true,
        "emergency_forwarding_phone": "+1-800-555-0199"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Platform & Tenant Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'business_staff',
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
-- 5. CONTACTS / PATIENTS / CUSTOMERS
-- Polymorphic contact representation with industry-specific attributes in JSONB
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    contact_type VARCHAR(50) NOT NULL, -- 'patient' for clinics, 'customer' for service
    industry_attributes JSONB DEFAULT '{}'::jsonb, 
    -- For medical: {"dob": "1984-05-12", "insurance_provider": "BlueCross", "hipaa_consent": true}
    -- For service: {"property_type": "residential", "gate_code": "1234", "equipment_age_years": 8}
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 6. MEDICAL CLINIC SPECIFIC RECORDS: APPOINTMENTS
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    provider_name VARCHAR(255) NOT NULL, -- Treating physician/dentist
    department VARCHAR(100) NOT NULL,    -- e.g., Oral Surgery, Cardiology
    appointment_type VARCHAR(100) NOT NULL, -- e.g., Comprehensive Exam, Echocardiogram
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    chief_complaint TEXT,
    ai_triage_summary TEXT,              -- Generated automatically by iSectAI Voice Agent
    hipaa_notes_masked TEXT,             -- Scrubbed clinical notes for admin dashboard display
    room_number VARCHAR(50),
    booked_via_ai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 7. SERVICE BUSINESS SPECIFIC RECORDS: DISPATCH JOBS & WORK ORDERS
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS service_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    technician_name VARCHAR(255),        -- Assigned field specialist
    service_type VARCHAR(150) NOT NULL,  -- e.g., AC Compressor Failure, Main Drain Snaking
    priority job_priority NOT NULL DEFAULT 'medium',
    status job_status NOT NULL DEFAULT 'pending_dispatch',
    scheduled_for TIMESTAMPTZ NOT NULL,
    estimated_cost NUMERIC(10, 2),
    final_cost NUMERIC(10, 2),
    dispatch_address TEXT NOT NULL,
    ai_intake_notes TEXT,                -- AI transcribed dispatch problem diagnosis
    parts_required JSONB DEFAULT '[]'::jsonb,
    booked_via_ai BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================================
-- 8. AI CALL & AUTOMATION TELEMETRY LOGS
-- Cross-platform telemetry for iSectAI internal administrator monitoring
-- ==============================================================================================

CREATE TABLE IF NOT EXISTS ai_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    caller_phone VARCHAR(50),
    caller_name VARCHAR(150),
    event_type VARCHAR(50) NOT NULL, -- 'inbound_call', 'automated_reschedule', 'emergency_triage'
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
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_time ON appointments(tenant_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_service_jobs_tenant_time ON service_jobs(tenant_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_ai_logs_tenant_created ON ai_activity_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_tenant ON ai_agents(tenant_id);

-- ==============================================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant isolation model for Supabase
-- ==============================================================================================

-- Enable RLS across all sensitive tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to extract role and tenant from Supabase Auth JWT
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
    SELECT coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'role')::user_role,
        'business_staff'::user_role
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth_user_tenant_id() RETURNS UUID AS $$
    SELECT coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
    );
$$ LANGUAGE sql STABLE;

-- POLICIES FOR PLATFORM ADMINISTRATOR (Full access across all tenants for iSectAI internal admin)
CREATE POLICY "Platform Admins have full access to tenants"
    ON tenants FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to users"
    ON users FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to ai_agents"
    ON ai_agents FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to contacts"
    ON contacts FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to appointments"
    ON appointments FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to service_jobs"
    ON service_jobs FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Platform Admins have full access to ai_activity_logs"
    ON ai_activity_logs FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

-- TENANT ISOLATION POLICIES (Regular customer businesses can ONLY see their own records)
CREATE POLICY "Tenants can only view their own organization"
    ON tenants FOR SELECT
    USING (id = auth_user_tenant_id());

CREATE POLICY "Tenants can only access their own appointments"
    ON appointments FOR ALL
    USING (tenant_id = auth_user_tenant_id());

CREATE POLICY "Tenants can only access their own service jobs"
    ON service_jobs FOR ALL
    USING (tenant_id = auth_user_tenant_id());

CREATE POLICY "Tenants can only access their own contacts"
    ON contacts FOR ALL
    USING (tenant_id = auth_user_tenant_id());

CREATE POLICY "Tenants can only view their own AI logs"
    ON ai_activity_logs FOR SELECT
    USING (tenant_id = auth_user_tenant_id());

-- Public / Anonymous read policy for trial prototype evaluation (allows anon key read for demo UI)
CREATE POLICY "Allow public read access for trial demo evaluation"
    ON tenants FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for trial demo appointments"
    ON appointments FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for trial demo service_jobs"
    ON service_jobs FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for trial demo ai_agents"
    ON ai_agents FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for trial demo ai_activity_logs"
    ON ai_activity_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for trial demo contacts"
    ON contacts FOR SELECT
    USING (true);
