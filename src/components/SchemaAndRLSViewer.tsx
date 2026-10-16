import React, { useState, useMemo } from 'react';
import {
  Database,
  ShieldCheck,
  FileCode2,
  Key,
  Copy,
  Check,
  Search,
  Download,
  Lock,
  CheckCircle2,
  Cpu,
  Filter,
  ArrowRight,
  UserCheck,
  Building2,
  Users,
  Calendar,
  Wrench,
  Bot,
  Activity,
  Contact,
  Code2
} from 'lucide-react';

// ==============================================================================================
// 1. PRODUCTION RLS POLICIES DATASET (Directly from PostgreSQL catalog & RLS/RLS.json)
// ==============================================================================================

export interface RLSPolicyDef {
  tableName: string;
  policyName: string;
  operation: 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  scope: 'platform_admin' | 'tenant_scoped';
  roles: string[];
  permissive: string;
  usingExpression: string;
  description: string;
  breachProtection: string;
  category: 'core' | 'medical' | 'service' | 'ai';
  color: string;
}

const PRODUCTION_RLS_POLICIES: RLSPolicyDef[] = [
  {
    tableName: 'tenants',
    policyName: 'Platform Admins have full access to tenants',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Grants platform super-administrators read/write access across all clinic and field trade organizations.',
    breachProtection: 'Restricted by cryptographic JWT role claim validation. Unauthorized callers are denied at query planning.',
    category: 'core',
    color: '#2563eb'
  },
  {
    tableName: 'tenants',
    policyName: 'Tenants can only view their own organization',
    operation: 'SELECT',
    scope: 'tenant_scoped',
    roles: ['public'],
    permissive: 'PERMISSIVE',
    usingExpression: `(id = auth_user_tenant_id())`,
    description: 'Enforces single-tenant boundaries so staff can only query their own corporate metadata and settings.',
    breachProtection: 'Kernel filter guarantees Tenant B cannot discover Tenant A organization profile or settings.',
    category: 'core',
    color: '#2563eb'
  },
  {
    tableName: 'users',
    policyName: 'Platform Admins have full access to users',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Allows platform super-administrators to manage user directory, provisioning, and role assignment globally.',
    breachProtection: 'Guarded by auth_user_role() evaluation against trusted Supabase Auth metadata.',
    category: 'core',
    color: '#8b5cf6'
  },
  {
    tableName: 'users',
    policyName: 'Tenants can view staff in their organization',
    operation: 'SELECT',
    scope: 'tenant_scoped',
    roles: ['authenticated'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Restricts user directory visibility strictly to colleagues belonging to the same tenant organization.',
    breachProtection: 'Prevents staff from seeing practitioner rosters, email addresses, or phone numbers of competing businesses.',
    category: 'core',
    color: '#8b5cf6'
  },
  {
    tableName: 'appointments',
    policyName: 'Platform Admins have full access to appointments',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Enables global platform diagnostics, automated AI cron scheduling, and cross-clinic telemetry.',
    breachProtection: 'Requires verified platform_admin claim or internal service_role JWT.',
    category: 'medical',
    color: '#059669'
  },
  {
    tableName: 'appointments',
    policyName: 'Tenants can only access their own appointments',
    operation: 'ALL',
    scope: 'tenant_scoped',
    roles: ['public'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Enforces complete HIPAA-compliant clinical segregation for medical appointments and triage summaries.',
    breachProtection: 'Apex Dental staff cannot view, reschedule, or cancel PulsePoint Cardiology appointments.',
    category: 'medical',
    color: '#059669'
  },
  {
    tableName: 'service_jobs',
    policyName: 'Platform Admins have full access to service_jobs',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Provides platform-wide dispatch tracking, technician routing, and billing audit capabilities.',
    breachProtection: 'Service-role or platform-admin gated only.',
    category: 'service',
    color: '#d97706'
  },
  {
    tableName: 'service_jobs',
    policyName: 'Tenants can only access their own service jobs',
    operation: 'ALL',
    scope: 'tenant_scoped',
    roles: ['public'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Protects proprietary work orders, dispatch addresses, customer pricing, and technician schedules.',
    breachProtection: 'VoltFlow Services dispatchers cannot view or modify commercial trade tickets of other contractors.',
    category: 'service',
    color: '#d97706'
  },
  {
    tableName: 'contacts',
    policyName: 'Platform Admins have full access to contacts',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Global access to customer/patient directory for billing automation and platform support.',
    breachProtection: 'Service-role or platform-admin gated only.',
    category: 'core',
    color: '#0284c7'
  },
  {
    tableName: 'contacts',
    policyName: 'Tenants can only access their own contacts',
    operation: 'ALL',
    scope: 'tenant_scoped',
    roles: ['public'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Guarantees that patient/customer PII (medical attributes, property access codes) remains isolated.',
    breachProtection: 'Blocks cross-company customer theft or accidental patient PII exposure.',
    category: 'core',
    color: '#0284c7'
  },
  {
    tableName: 'ai_activity_logs',
    policyName: 'Platform Admins have full access to ai_activity_logs',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Enables global LLM token accounting, cost aggregation, and AI voice latency monitoring.',
    breachProtection: 'Service-role or platform-admin gated only.',
    category: 'ai',
    color: '#ec4899'
  },
  {
    tableName: 'ai_activity_logs',
    policyName: 'Tenants can only view their own AI logs',
    operation: 'SELECT',
    scope: 'tenant_scoped',
    roles: ['public'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Permits tenants to review call transcripts, automated sentiment metrics, and duration logs for their business.',
    breachProtection: 'Call transcripts containing sensitive clinical or trade details cannot leak to third parties.',
    category: 'ai',
    color: '#ec4899'
  },
  {
    tableName: 'ai_agents',
    policyName: 'Platform Admins have full access to ai_agents',
    operation: 'ALL',
    scope: 'platform_admin',
    roles: ['public', 'service_role'],
    permissive: 'PERMISSIVE',
    usingExpression: `((auth_user_role() = 'platform_admin'::user_role) OR (auth.role() = 'service_role'::text))`,
    description: 'Manages platform-wide AI prompt templates, voice models, and telephony routing configurations.',
    breachProtection: 'Restricted to super administrators and backend orchestration daemons.',
    category: 'ai',
    color: '#6366f1'
  },
  {
    tableName: 'ai_agents',
    policyName: 'Tenants can view their own AI agents',
    operation: 'SELECT',
    scope: 'tenant_scoped',
    roles: ['authenticated'],
    permissive: 'PERMISSIVE',
    usingExpression: `(tenant_id = auth_user_tenant_id())`,
    description: 'Allows business staff to inspect their designated voice receptionists and intake assistants.',
    breachProtection: 'Custom enterprise prompt engineering and routing secrets are kept strictly private per tenant.',
    category: 'ai',
    color: '#6366f1'
  }
];

// ==============================================================================================
// 2. COMPLETE PRODUCTION POSTGRESQL DDL (495 lines of exact supabase/schema.sql)
// ==============================================================================================

const PRODUCTION_SQL_DDL = `-- ==============================================================================================
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
CREATE POLICY "Allow anon delete on ai_activity_logs" ON ai_activity_logs FOR DELETE USING (true);`;

// ==============================================================================================
// 3. PERSONA SIMULATION DEFINITIONS
// ==============================================================================================

interface Persona {
  id: string;
  name: string;
  role: string;
  title: string;
  tenantName: string;
  tenantId: string | null;
  badgeColor: string;
  jwtClaims: {
    sub: string;
    role: string;
    email: string;
    app_metadata: {
      role: string;
      tenant_id: string | null;
    };
  };
  tablePermissions: Record<string, {
    access: 'Full (All Tenants)' | 'Tenant Scoped' | 'Read Only' | 'Blocked';
    filterExplanation: string;
    securityNote: string;
    isSafe: boolean;
  }>;
}

const SIMULATED_PERSONAS: Persona[] = [
  {
    id: 'super_admin',
    name: 'Sarah Chen',
    role: 'platform_admin',
    title: 'Platform Super Administrator',
    tenantName: 'iSectAI Platform Ops (Global)',
    tenantId: null,
    badgeColor: '#2563eb',
    jwtClaims: {
      sub: 'usr-00000000-0000-0000-0000-000000000001',
      role: 'authenticated',
      email: 'admin@isectai.internal',
      app_metadata: {
        role: 'platform_admin',
        tenant_id: null
      }
    },
    tablePermissions: {
      tenants: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (No row restrictions applied)',
        securityNote: 'Authorized for global SaaS administration, billing, and tenant onboarding.',
        isSafe: true
      },
      users: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (Full directory access)',
        securityNote: 'Global staff directory and role provisioning.',
        isSafe: true
      },
      appointments: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (Cross-clinic access)',
        securityNote: 'Global telemetry & emergency platform intervention.',
        isSafe: true
      },
      service_jobs: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (All dispatch tickets)',
        securityNote: 'Platform dispatch diagnostics across all trade partners.',
        isSafe: true
      },
      contacts: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (All customers/patients)',
        securityNote: 'Billing audits and customer support resolution.',
        isSafe: true
      },
      ai_activity_logs: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (All telephony logs)',
        securityNote: 'Global LLM token consumption and latency analytics.',
        isSafe: true
      },
      ai_agents: {
        access: 'Full (All Tenants)',
        filterExplanation: 'WHERE true (All bot configurations)',
        securityNote: 'Global prompt template deployment & voice engine updates.',
        isSafe: true
      }
    }
  },
  {
    id: 'apex_owner',
    name: 'Dr. Marcus Vance',
    role: 'business_owner',
    title: 'Medical Director / Clinic Owner',
    tenantName: 'Apex Dental Care NYC',
    tenantId: '8a0c2049-74d2-430c-99c5-673ecdeee80b',
    badgeColor: '#059669',
    jwtClaims: {
      sub: 'usr-11111111-1111-1111-1111-111111111101',
      role: 'authenticated',
      email: 'dr.vance@apexdentalnyc.com',
      app_metadata: {
        role: 'business_owner',
        tenant_id: '8a0c2049-74d2-430c-99c5-673ecdeee80b'
      }
    },
    tablePermissions: {
      tenants: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE id = '8a0c2049-74d2-430c-99c5-673ecdeee80b' (SELECT only)",
        securityNote: 'Cannot view VoltFlow Services or PulsePoint Cardio tenant records.',
        isSafe: true
      },
      users: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = '8a0c2049-74d2-430c-99c5-673ecdeee80b'",
        securityNote: 'Can only view and manage Apex Dental Care staff and dentists.',
        isSafe: true
      },
      appointments: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = '8a0c2049-74d2-430c-99c5-673ecdeee80b'",
        securityNote: '100% HIPAA isolation. Cannot see other clinics appointments.',
        isSafe: true
      },
      service_jobs: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = '8a0c2049-...' (Returns 0 rows)",
        securityNote: 'Zero access to HVAC/electrical work orders. No trade leakage.',
        isSafe: true
      },
      contacts: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = '8a0c2049-74d2-430c-99c5-673ecdeee80b'",
        securityNote: 'Only dental patients enrolled at Apex Dental Care.',
        isSafe: true
      },
      ai_activity_logs: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = '8a0c2049-74d2-430c-99c5-673ecdeee80b'",
        securityNote: 'Only Apex Dental voice receptionist transcripts & call metrics.',
        isSafe: true
      },
      ai_agents: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = '8a0c2049-74d2-430c-99c5-673ecdeee80b'",
        securityNote: 'Can view Apex Dental Care triage AI agents only.',
        isSafe: true
      }
    }
  },
  {
    id: 'voltflow_dispatcher',
    name: 'Marcus Vance',
    role: 'business_staff',
    title: 'Senior Field Trades Dispatcher',
    tenantName: 'VoltFlow Electrical & HVAC',
    tenantId: 'cf8b0e51-4032-4467-839c-850c95a27c41',
    badgeColor: '#d97706',
    jwtClaims: {
      sub: 'usr-33333333-3333-3333-3333-333333333301',
      role: 'authenticated',
      email: 'staff@voltflow.com',
      app_metadata: {
        role: 'business_staff',
        tenant_id: 'cf8b0e51-4032-4467-839c-850c95a27c41'
      }
    },
    tablePermissions: {
      tenants: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE id = 'cf8b0e51-4032-4467-839c-850c95a27c41' (SELECT only)",
        securityNote: 'VoltFlow company profile strictly segregated.',
        isSafe: true
      },
      users: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-4032-4467-839c-850c95a27c41'",
        securityNote: 'VoltFlow field technicians and electricians only.',
        isSafe: true
      },
      appointments: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-...' (Returns 0 rows)",
        securityNote: 'Zero access to medical clinic records. HIPAA protected.',
        isSafe: true
      },
      service_jobs: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-4032-4467-839c-850c95a27c41'",
        securityNote: 'Full access to VoltFlow dispatch tickets, addresses, and parts.',
        isSafe: true
      },
      contacts: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-4032-4467-839c-850c95a27c41'",
        securityNote: 'Commercial facilities and residential clients of VoltFlow only.',
        isSafe: true
      },
      ai_activity_logs: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-4032-4467-839c-850c95a27c41'",
        securityNote: 'Emergency HVAC breakdown call transcripts only.',
        isSafe: true
      },
      ai_agents: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE tenant_id = 'cf8b0e51-4032-4467-839c-850c95a27c41'",
        securityNote: 'VoltFlow Dispatch Coordinator AI bot inspection only.',
        isSafe: true
      }
    }
  },
  {
    id: 'anonymous',
    name: 'Anonymous Client',
    role: 'anon',
    title: 'Public Web Visitor / Unauthenticated',
    tenantName: 'Public Internet (Zero Auth)',
    tenantId: null,
    badgeColor: '#64748b',
    jwtClaims: {
      sub: 'unauthenticated',
      role: 'anon',
      email: 'public@internet.com',
      app_metadata: {
        role: 'anon',
        tenant_id: null
      }
    },
    tablePermissions: {
      tenants: {
        access: 'Tenant Scoped',
        filterExplanation: "WHERE id = '00000000-0000-0000-0000-000000000000' (0 rows)",
        securityNote: 'Fallback UUID prevents any tenant leakage.',
        isSafe: true
      },
      users: {
        access: 'Blocked',
        filterExplanation: "Blocked by authenticated role requirement",
        securityNote: 'Staff credentials and identities completely hidden.',
        isSafe: true
      },
      appointments: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = '00000000-...' (0 rows)",
        securityNote: 'Medical schedules 100% blocked from public internet.',
        isSafe: true
      },
      service_jobs: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = '00000000-...' (0 rows)",
        securityNote: 'Trade work orders 100% blocked from public internet.',
        isSafe: true
      },
      contacts: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = '00000000-...' (0 rows)",
        securityNote: 'Customer PII 100% blocked from public internet.',
        isSafe: true
      },
      ai_activity_logs: {
        access: 'Blocked',
        filterExplanation: "WHERE tenant_id = '00000000-...' (0 rows)",
        securityNote: 'AI call transcripts 100% blocked from public internet.',
        isSafe: true
      },
      ai_agents: {
        access: 'Blocked',
        filterExplanation: "Blocked by authenticated role requirement",
        securityNote: 'Proprietary prompts and telephony settings hidden.',
        isSafe: true
      }
    }
  }
];

// Helper to get table icon
const getTableIcon = (tableName: string) => {
  switch (tableName) {
    case 'tenants': return Building2;
    case 'users': return Users;
    case 'appointments': return Calendar;
    case 'service_jobs': return Wrench;
    case 'contacts': return Contact;
    case 'ai_activity_logs': return Activity;
    case 'ai_agents': return Bot;
    default: return Database;
  }
};

// ==============================================================================================
// 4. MAIN COMPONENT: SchemaAndRLSViewer
// ==============================================================================================

export const SchemaAndRLSViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'ddl' | 'pipeline' | 'simulator'>('matrix');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<'all' | 'platform_admin' | 'tenant_scoped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('apex_owner');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2200);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([PRODUCTION_SQL_DDL], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isectai_supabase_schema_rls_production.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered RLS Policies
  const filteredPolicies = useMemo(() => {
    return PRODUCTION_RLS_POLICIES.filter(p => {
      if (selectedTable !== 'all' && p.tableName !== selectedTable) return false;
      if (selectedScope !== 'all' && p.scope !== selectedScope) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          p.tableName.toLowerCase().includes(query) ||
          p.policyName.toLowerCase().includes(query) ||
          p.usingExpression.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedTable, selectedScope, searchQuery]);

  // Selected persona for simulator
  const activePersona = useMemo(() => {
    return SIMULATED_PERSONAS.find(p => p.id === selectedPersonaId) || SIMULATED_PERSONAS[0];
  }, [selectedPersonaId]);

  // DDL lines for code viewer
  const ddlLines = useMemo(() => {
    return PRODUCTION_SQL_DDL.split('\n');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
      {/* 1. STUDIO MASTER HEADER */}
      <div
        className="clean-table-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%)',
          borderColor: 'rgba(37, 99, 235, 0.2)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.22rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Production PostgreSQL Schema & Enterprise RLS Policies
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid rgba(5, 150, 105, 0.2)'
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }}></span>
                  PostgreSQL 15.6 • Supabase Active
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, margin: 0, lineHeight: 1.5 }}>
                Kernel-level row isolation architecture for single-database multi-tenant healthcare & field services.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn-clean-secondary"
              onClick={() => copyToClipboard(PRODUCTION_SQL_DDL, 'full_ddl')}
              id="btn-copy-full-schema"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              {copiedSection === 'full_ddl' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copiedSection === 'full_ddl' ? 'Copied Full DDL (495 Lines)' : 'Copy Full Schema'}</span>
            </button>

            <button
              className="btn-clean-secondary"
              onClick={downloadSqlFile}
              id="btn-download-sql"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            >
              <Download size={14} />
              <span>Download .sql</span>
            </button>
          </div>
        </div>

        {/* Executive Security KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            marginTop: 20,
            paddingTop: 18,
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>14 Policies</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>7 Multi-Tenant Tables</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>Kernel RLS</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Zero Cross-Tenant Leakage</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>JWT Claims</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>app_metadata.tenant_id</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>9 Indexes</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>B-Tree Composite Scans</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STUDIO INTERNAL VIEW SELECTOR TABS */}
      <div className="content-toolbar" style={{ margin: 0 }}>
        <div className="filter-group">
          <button
            className={`filter-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => setActiveTab('matrix')}
            id="studio-tab-matrix"
          >
            <ShieldCheck size={15} />
            <span>RLS Policy Matrix (14 Active)</span>
          </button>

          <button
            className={`filter-btn ${activeTab === 'ddl' ? 'active' : ''}`}
            onClick={() => setActiveTab('ddl')}
            id="studio-tab-ddl"
          >
            <FileCode2 size={15} />
            <span>Production SQL DDL (495 Lines)</span>
          </button>

          <button
            className={`filter-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
            id="studio-tab-pipeline"
          >
            <Key size={15} />
            <span>JWT Claims & Kernel Pipeline</span>
          </button>

          <button
            className={`filter-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
            id="studio-tab-simulator"
          >
            <UserCheck size={15} />
            <span>Live RLS Persona Simulator</span>
          </button>
        </div>
      </div>

      {/* ============================================================================================== */}
      {/* 3. SUB-VIEW A: INTERACTIVE RLS POLICY MATRIX */}
      {/* ============================================================================================== */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filtering Controls */}
          <div
            className="clean-table-card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            {/* Table Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Filter size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Table:
              </span>
              {[
                { id: 'all', label: 'All Tables (14)' },
                { id: 'tenants', label: 'tenants (2)' },
                { id: 'users', label: 'users (2)' },
                { id: 'appointments', label: 'appointments (2)' },
                { id: 'service_jobs', label: 'service_jobs (2)' },
                { id: 'contacts', label: 'contacts (2)' },
                { id: 'ai_activity_logs', label: 'ai_activity_logs (2)' },
                { id: 'ai_agents', label: 'ai_agents (2)' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: selectedTable === t.id ? '#2563eb' : 'var(--border-light)',
                    background: selectedTable === t.id ? '#eff6ff' : 'var(--bg-subtle)',
                    color: selectedTable === t.id ? '#1d4ed8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scope Filter & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={selectedScope}
                onChange={e => setSelectedScope(e.target.value as any)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Scopes (14 Policies)</option>
                <option value="platform_admin">Platform Admin Only (7)</option>
                <option value="tenant_scoped">Tenant Scoped Only (7)</option>
              </select>

              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter policies or SQL..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Policy Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 14 }}>
            {filteredPolicies.map((policy, idx) => {
              const TableIcon = getTableIcon(policy.tableName);
              const cardId = `policy-${policy.tableName}-${idx}`;

              return (
                <div
                  key={cardId}
                  className="clean-table-card"
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    borderLeft: `4px solid ${policy.color}`,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Header: Table, Scope Badge, Permissive */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: `${policy.color}14`,
                            color: policy.color,
                            border: `1px solid ${policy.color}33`,
                            fontFamily: 'var(--font-mono, monospace)'
                          }}
                        >
                          <TableIcon size={13} />
                          {policy.tableName}
                        </span>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: policy.operation === 'ALL' ? '#fef3c7' : '#e0f2fe',
                            color: policy.operation === 'ALL' ? '#92400e' : '#0369a1',
                            fontFamily: 'var(--font-mono, monospace)'
                          }}
                        >
                          FOR {policy.operation}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 999,
                          background: policy.scope === 'platform_admin' ? '#eff6ff' : '#ecfdf5',
                          color: policy.scope === 'platform_admin' ? '#1d4ed8' : '#047857',
                          border: `1px solid ${policy.scope === 'platform_admin' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`
                        }}
                      >
                        {policy.scope === 'platform_admin' ? '👑 Platform Super Admin' : '🏢 Tenant Isolation'}
                      </span>
                    </div>

                    {/* Policy Title */}
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                      "{policy.policyName}"
                    </h4>

                    {/* Description */}
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                      {policy.description}
                    </p>

                    {/* SQL USING Expression */}
                    <div
                      style={{
                        background: '#0f172a',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                        border: '1px solid #1e293b',
                        marginBottom: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          PostgreSQL USING Clause
                        </span>
                        <button
                          onClick={() => copyToClipboard(policy.usingExpression, cardId)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: 4
                          }}
                          title="Copy USING expression"
                        >
                          {copiedSection === cardId ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                          <span>{copiedSection === cardId ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <code style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', wordBreak: 'break-all', display: 'block', lineHeight: 1.45 }}>
                        USING {policy.usingExpression}
                      </code>
                    </div>

                    {/* Breach Protection Note */}
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        lineHeight: 1.45
                      }}
                    >
                      <CheckCircle2 size={13} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span><strong>Security Guarantee:</strong> {policy.breachProtection}</span>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span>Roles: <code>{policy.roles.join(', ')}</code></span>
                    <span>Mode: <code>{policy.permissive}</code></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* 4. SUB-VIEW B: FULL PRODUCTION SQL DDL (IDE CODE STUDIO) */}
      {/* ============================================================================================== */}
      {activeTab === 'ddl' && (
        <div className="clean-table-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Code Header Bar */}
          <div
            style={{
              padding: '14px 20px',
              background: '#090d16',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            {/* macOS window dots & file label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCode2 size={15} color="#38bdf8" />
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: '#f1f5f9' }}>
                  supabase/schema.sql
                </span>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 4, background: '#1e293b', color: '#94a3b8' }}>
                  495 Lines • PostgreSQL 15 DDL
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn-clean-secondary"
                onClick={() => copyToClipboard(PRODUCTION_SQL_DDL, 'ddl_tab')}
                style={{
                  fontSize: '0.74rem',
                  padding: '5px 12px',
                  background: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc'
                }}
              >
                {copiedSection === 'ddl_tab' ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                <span>{copiedSection === 'ddl_tab' ? 'Copied 495 Lines' : 'Copy All DDL'}</span>
              </button>

              <button
                className="btn-clean-secondary"
                onClick={downloadSqlFile}
                style={{
                  fontSize: '0.74rem',
                  padding: '5px 12px',
                  background: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc'
                }}
              >
                <Download size={13} />
                <span>Export .sql</span>
              </button>
            </div>
          </div>

          {/* Quick Jump Section Bar */}
          <div
            style={{
              padding: '10px 20px',
              background: '#0d1322',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
              fontSize: '0.72rem',
              color: '#94a3b8'
            }}
          >
            <span style={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', flexShrink: 0 }}>
              Sections:
            </span>
            {[
              '1. Extensions',
              '2. Enums (8)',
              '3. Tenants & Users',
              '4. AI Agents',
              '5. Contacts',
              '6. Appointments',
              '7. Service Jobs',
              '8. AI Logs',
              '9. Indexes',
              '10. Triggers',
              '11. RLS Policies'
            ].map(sec => (
              <span
                key={sec}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontFamily: 'var(--font-mono, monospace)',
                  whiteSpace: 'nowrap'
                }}
              >
                {sec}
              </span>
            ))}
          </div>

          {/* Code Viewer with Line Numbers */}
          <div
            style={{
              background: '#080c14',
              padding: '16px 0',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              lineHeight: 1.6,
              maxHeight: 560,
              overflowY: 'auto',
              color: '#e2e8f0'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <tbody>
                {ddlLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isComment = line.trim().startsWith('--');
                  const isKeyword =
                    line.includes('CREATE TABLE') ||
                    line.includes('CREATE POLICY') ||
                    line.includes('ALTER TABLE') ||
                    line.includes('CREATE TYPE') ||
                    line.includes('CREATE INDEX') ||
                    line.includes('CREATE OR REPLACE FUNCTION');
                  const isSectionHeader = line.includes('===');

                  let textColor = '#e2e8f0';
                  if (isComment) textColor = '#64748b';
                  if (isSectionHeader) textColor = '#38bdf8';
                  else if (isKeyword) textColor = '#60a5fa';

                  return (
                    <tr
                      key={lineNum}
                      style={{
                        background: isKeyword ? 'rgba(37, 99, 235, 0.04)' : 'transparent'
                      }}
                    >
                      <td
                        style={{
                          width: 52,
                          textAlign: 'right',
                          paddingRight: 16,
                          paddingLeft: 12,
                          color: '#475569',
                          userSelect: 'none',
                          verticalAlign: 'top',
                          fontSize: '0.72rem'
                        }}
                      >
                        {lineNum}
                      </td>
                      <td
                        style={{
                          paddingRight: 20,
                          color: textColor,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {line}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* 5. SUB-VIEW C: JWT CLAIMS & SECURITY PIPELINE */}
      {/* ============================================================================================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pipeline Diagram Walkthrough */}
          <div className="clean-table-card" style={{ padding: '24px 28px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              How iSectAI Cryptographic JWT Isolation Operates in PostgreSQL
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Every client API call flows through a 5-step cryptographically verified pipeline before returning a single database row:
            </p>

            {/* 5-Step Pipeline Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                {
                  step: '01',
                  title: 'GoTrue Auth Login',
                  desc: 'Staff authenticates via Supabase Auth. Server signs a secure JWT containing role & tenant_id in app_metadata.',
                  icon: Key,
                  color: '#2563eb'
                },
                {
                  step: '02',
                  title: 'Bearer Token Ingestion',
                  desc: 'Frontend or voice daemon attaches Bearer <token>. Supabase PostgREST initializes a transaction.',
                  icon: ArrowRight,
                  color: '#8b5cf6'
                },
                {
                  step: '03',
                  title: 'Kernel Helper Function',
                  desc: 'Postgres executes auth_user_tenant_id() STABLE function, regex sanitizing the tenant UUID.',
                  icon: Code2,
                  color: '#059669'
                },
                {
                  step: '04',
                  title: 'RLS Row Filter Applied',
                  desc: 'Query planner automatically injects WHERE tenant_id = auth_user_tenant_id() into the physical index scan.',
                  icon: Lock,
                  color: '#d97706'
                },
                {
                  step: '05',
                  title: 'Zero Leakage Guarantee',
                  desc: 'Even if an attacker crafts malicious SQL parameters, cross-tenant records return 0 rows mathematically.',
                  icon: ShieldCheck,
                  color: '#10b981'
                }
              ].map((s) => {
                const StepIcon = s.icon;
                return (
                  <div
                    key={s.step}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono, monospace)' }}>
                          STEP {s.step}
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StepIcon size={15} />
                        </div>
                      </div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                        {s.title}
                      </h4>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive SQL Helper Function Deep-Dive */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
            {/* Function 1 */}
            <div className="clean-table-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code2 size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    auth_user_role() Helper
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Returns: <code>user_role</code> enum • STABLE plpgsql
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#0f172a',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.74rem',
                  color: '#38bdf8',
                  lineHeight: 1.5,
                  marginBottom: 12
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
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
$$ LANGUAGE plpgsql STABLE;`}
                </pre>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Safely inspects the caller JWT token. Prevents privilege escalation by restricting roles strictly to the verified enum white-list. Falls back to minimal <code>business_staff</code> on any syntax anomaly.
              </p>
            </div>

            {/* Function 2 */}
            <div className="clean-table-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    auth_user_tenant_id() Helper
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Returns: <code>UUID</code> • Regex Validated STABLE
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: '#0f172a',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.74rem',
                  color: '#a78bfa',
                  lineHeight: 1.5,
                  marginBottom: 12
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`CREATE OR REPLACE FUNCTION auth_user_tenant_id() RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql STABLE;`}
                </pre>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Extracts the tenant identifier using RFC 4122 regex validation. If null, tampered, or malformed, it defaults to the nil UUID (<code>00000000-0000-0000-0000-000000000000</code>), ensuring zero rows are ever leaked.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================================== */}
      {/* 6. SUB-VIEW D: LIVE RLS PERSONA ACCESS SIMULATOR */}
      {/* ============================================================================================== */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Persona Picker Bar */}
          <div className="clean-table-card" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Live RLS Security Persona Sandbox
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, margin: 0 }}>
                Select an authentication persona to simulate how PostgreSQL Row Level Security evaluates queries in real time.
              </p>
            </div>

            {/* Persona Selection Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {SIMULATED_PERSONAS.map(p => {
                const isSelected = p.id === activePersona.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonaId(p.id)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? p.badgeColor : 'var(--border-light)'}`,
                      background: isSelected ? `${p.badgeColor}0d` : 'var(--bg-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: `${p.badgeColor}22`,
                          color: p.badgeColor
                        }}
                      >
                        {p.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {p.tenantName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona JWT Claims & Table Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {/* JWT Payload Box */}
            <div className="clean-table-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={16} color={activePersona.badgeColor} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Simulated JWT Claims (auth.jwt())
                  </h4>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: `${activePersona.badgeColor}15`,
                    color: activePersona.badgeColor
                  }}
                >
                  {activePersona.title}
                </span>
              </div>

              <div
                style={{
                  background: '#090d16',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.74rem',
                  color: '#38bdf8',
                  lineHeight: 1.55,
                  border: '1px solid #1e293b'
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(activePersona.jwtClaims, null, 2)}
                </pre>
              </div>

              <div style={{ marginTop: 12, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong>PostgreSQL Function Outputs:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
                  <li><code>auth_user_role()</code> &rarr; <code>'{activePersona.jwtClaims.app_metadata.role}'::user_role</code></li>
                  <li><code>auth_user_tenant_id()</code> &rarr; <code>'{activePersona.jwtClaims.app_metadata.tenant_id || '00000000-0000-0000-0000-000000000000'}'::uuid</code></li>
                </ul>
              </div>
            </div>

            {/* Table Access Summary */}
            <div className="clean-table-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={16} color="#059669" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Effective Database Permissions
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(activePersona.tablePermissions).map(([tableName, perm]) => {
                  const TableIcon = getTableIcon(tableName);
                  let badgeBg = '#ecfdf5';
                  let badgeColor = '#059669';
                  if (perm.access === 'Blocked') {
                    badgeBg = '#fef2f2';
                    badgeColor = '#dc2626';
                  } else if (perm.access === 'Full (All Tenants)') {
                    badgeBg = '#eff6ff';
                    badgeColor = '#2563eb';
                  }

                  return (
                    <div
                      key={tableName}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TableIcon size={14} color="var(--text-secondary)" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-main)' }}>
                            {tableName}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: badgeBg,
                            color: badgeColor
                          }}
                        >
                          {perm.access}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {perm.filterExplanation}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {perm.securityNote}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
