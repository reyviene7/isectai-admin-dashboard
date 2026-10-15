# iSectAI Architecture & Security Specification

**Author:** iSectAI Platform Engineering Candidate  
**Target:** Senior Leadership & Technical Review Committee, iSectAI (New York)  
**Deliverable:** Database Architecture & Internal Admin Dashboard Trial  

---

## 1. Executive Summary

iSectAI centralizes AI-powered voice reception, triage pre-screening, and automated scheduling/dispatch operations across diverse commercial clients—specifically **medical clinics** (e.g. dental, cardiology, surgery) and **service businesses** (e.g. HVAC, plumbing, electrical).

This document outlines the architectural blueprint, data model, security boundaries, and production roadmap designed to satisfy all requirements specified in the Developer Paid Trial.

---

## 2. Technical Decisions & Technology Choices

### 2.1 Why PostgreSQL & Supabase Were Selected

The client trial document notes:
> *"We're currently using Supabase, but we haven't finalized it as our long-term database solution. You may choose another platform if you believe it's a better option for iSectAI. If you do, please briefly explain why you prefer it over Supabase."*

**Our Recommendation:** We recommend **retaining and standardizing on PostgreSQL / Supabase**, complemented by targeted architectural safeguards. Here is why:

1. **Native Engine-Level Multi-Tenancy via Row-Level Security (RLS):**
   Unlike standard NoSQL databases (e.g., MongoDB, DynamoDB) where tenant isolation must be manually enforced in application code (leaving room for catastrophic data leaks if a single `tenant_id` filter is omitted), PostgreSQL enforces RLS at the kernel level. Even raw SQL queries executed by compromised application layers cannot escape tenant isolation boundaries.
2. **Hybrid Relational + Semi-Structured JSONB:**
   Healthcare clinics and field service companies require strict relational foreign keys for organizations, users, and audit logs, but their domain attributes differ widely. PostgreSQL's binary JSON (`JSONB`) with GIN indexing allows polymorphic extension attributes (e.g., medical insurance details vs. HVAC equipment models) without requiring schema migrations for every new industry onboarded.
3. **Integrated Real-Time Telemetry via WebSockets:**
   Supabase Realtime listens to PostgreSQL write-ahead logs (WAL) to push updates to the internal admin dashboard the instant an AI voice agent finishes triaging a patient or dispatching an emergency plumber—eliminating polling overhead.
4. **Unified Vector Embeddings (`pgvector`):**
   As iSectAI scales its AI voice receptionists, each clinic or contractor needs specialized knowledge retrieval (e.g., doctor biographies, insurance accepted, pricing tables). With `pgvector`, vector embeddings live in the exact same database alongside business operational records, preventing data synchronization drift between vector databases (like Pinecone) and relational stores.

---

## 3. Multi-Tenant & Multi-Industry Data Architecture

### 3.1 Domain Variance Challenge

| Aspect | Medical Clinics (Healthcare) | Service Businesses (Field Trades) |
| :--- | :--- | :--- |
| **Primary Domain Record** | `appointments` | `service_jobs` |
| **Primary Actors** | Treating Physician, Patient, Nurse | Dispatcher, Field Tech, Property Owner |
| **Urgency Classification** | Clinical Triage (Pain Scale 1–10, Symptoms) | Service Priority (`emergency`, `high`, `medium`) |
| **Regulatory Constraint** | **HIPAA Strict Mode** (PII/PHI encryption) | Commercial Billing & Equipment Warranties |
| **Pricing / Financials** | Co-pay, Insurance Pre-auth, Procedure Code | Diagnostic Fee, Parts List, Labor Quote |

### 3.2 Schema Design: The Hybrid Domain Model

Rather than forcing healthcare and plumbing into an over-generalized schema (which leads to "soft typing" bugs) or creating entirely separate databases for each industry (which makes centralized administrative monitoring complex and expensive), we implement a **Hybrid Domain Model**:

```
+------------------------------------------------------------------------+
|                      CORE MULTI-TENANT ENTITIES                         |
|   - tenants (id, name, slug, industry, subscription_tier, status)      |
|   - users (id, tenant_id, role, email, phone)                          |
|   - ai_agents (id, tenant_id, name, agent_type, model, system_prompt)  |
|   - ai_activity_logs (id, tenant_id, tokens_used, duration, sentiment) |
+------------------------------------------------------------------------+
                                    |
      +-----------------------------+-----------------------------+
      |                                                           |
      v                                                           v
+-----------------------------+             +-----------------------------+
|    HEALTHCARE SPECIALIZED   |             |   FIELD SERVICE SPECIALIZED |
|                             |             |                             |
|  - appointments:            |             |  - service_jobs:            |
|    - provider_name          |             |    - technician_name        |
|    - department             |             |    - service_type           |
|    - appointment_type       |             |    - priority (emergency...) |
|    - ai_triage_summary      |             |    - estimated_cost         |
|    - hipaa_notes_masked     |             |    - dispatch_address       |
|    - room_number            |             |    - parts_required (JSONB) |
+-----------------------------+             +-----------------------------+
```

1. **`tenants`:** Root organization table. Differentiates `industry: 'medical_clinic'` vs `'service_business'`.
2. **`contacts`:** Shared table for patients and customers, utilizing `industry_attributes JSONB` for domain-specific schemas.
3. **`appointments`:** Dedicated table for clinics with HIPAA considerations.
4. **`service_jobs`:** Dedicated table for trade companies with work order, dispatch location, and parts arrays.
5. **`ai_activity_logs`:** Telemetry pipeline recording real-time token consumption, duration, and AI transcription snippets.

---

## 4. Security & Tenant Data Isolation

### 4.1 Row-Level Security (RLS) Mechanics

Every table in `supabase/schema.sql` has `ROW LEVEL SECURITY` enabled. 

Isolation is enforced by extracting the tenant ID from the authenticated user's JWT metadata:

```sql
CREATE OR REPLACE FUNCTION auth_user_tenant_id() RETURNS UUID AS $$
    SELECT coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
    );
$$ LANGUAGE sql STABLE;

CREATE POLICY "Tenants can only access their own appointments"
    ON appointments FOR ALL
    USING (tenant_id = auth_user_tenant_id());
```

### 4.2 Distinguishing Internal Admin Access from Customer Access

We establish a clear **Role-Based Access Control (RBAC)** hierarchy:

1. **Platform Administrator (`platform_admin`):**
   - Belongs to iSectAI central operations staff.
   - Has `tenant_id: null` in their JWT claims.
   - The RLS policy explicitly evaluates:
     ```sql
     CREATE POLICY "Platform Admins have full access across tenants"
         ON tenants FOR ALL
         USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');
     ```
   - Enables global monitoring of all clinics, aggregate token metrics, and multi-tenant billing in this dashboard.
2. **Business Owners & Staff (`business_owner`, `business_staff`):**
   - Scoped strictly to their individual `tenant_id`.
   - Cannot query or mutate rows belonging to any other business on the platform.
3. **Autonomous AI Service Role (`service_role`):**
   - Background AI orchestration workers communicate using the backend `service_role` secret to ingest transcripts, update agent states, and book slots directly.

---

## 5. Architectural Advantages & Trade-Offs

### Advantages
- **Fast Tenant Provisioning:** New medical clinics or HVAC companies can be onboarded in milliseconds by inserting a single row into `tenants`, without spinning up new databases or schema migrations.
- **Cross-Tenant Telemetry & Aggregate Analytics:** Platform administrators can run instant aggregation queries (e.g. total AI tokens consumed today, average call resolution time) across all businesses from a single query interface.
- **Cost Efficiency:** Shared infrastructure drastically reduces cost per tenant during early and growth stages.

### Trade-Offs & Current Limitations
- **Noisy Neighbor Contention:** A sudden surge in phone calls at a large clinic could consume database connection pools and IOPS, impacting neighboring tenants if connection pooling (Supabase PgBouncer / Supavisor) is not tuned.
- **Single Regulatory Boundary:** Medical data (HIPAA) resides in the same database cluster as plumbing jobs. While logically segregated by RLS, high-compliance healthcare enterprise clients may request dedicated single-tenant databases.

---

## 6. Production Roadmap & Improvements

With further development time, the following enhancements should be implemented:

1. **HIPAA Business Associate Agreement (BAA) & PHI Cryptographic Shielding:**
   - Sign AWS/Supabase enterprise BAA.
   - Apply column-level encryption via `pgcrypto` or application-level AES-256 for patient names, phone numbers, and clinical intake notes, with keys stored in AWS KMS or HashiCorp Vault.
2. **Multi-Region Read Replicas:**
   - Deploy read replicas in `us-east-1` and `us-west-2` to serve edge AI voice agents within 25ms latency.
3. **Knowledge Base RAG via `pgvector`:**
   - Create a `tenant_knowledge_embeddings` table indexed with HNSW to allow AI agents to instantly reference clinic insurances, dentist schedules, and trade price guides during live phone conversations.
4. **Immutable Compliance Audit Logs:**
   - Implement an append-only `audit_logs` table with tamper-proof triggers recording every time an internal admin or staff member accesses a patient record.
