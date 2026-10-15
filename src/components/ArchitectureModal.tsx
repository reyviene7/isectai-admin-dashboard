import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Lock,
  Layers,
  FileCode2,
  Copy,
  Check,
  Server,
  HelpCircle
} from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'answers' | 'erd' | 'schema_sql' | 'seed_sql'>('answers');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaExcerpt = `-- iSectAI PostgreSQL Schema Summary
-- Multi-Tenant Architecture with Row-Level Security (RLS)
CREATE TYPE business_industry AS ENUM ('medical_clinic', 'service_business');
CREATE TYPE user_role AS ENUM ('platform_admin', 'business_owner', 'business_staff', 'practitioner');

-- Root Organizations
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry business_industry NOT NULL,
    subscription_tier subscription_tier NOT NULL DEFAULT 'growth',
    branding JSONB DEFAULT '{"primary_color": "#1e293b"}'::jsonb,
    business_settings JSONB DEFAULT '{"ai_auto_booking": true}'::jsonb
);

-- Row Level Security (RLS) Policy Example:
CREATE POLICY "Platform Admins have full access"
    ON tenants FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Tenants can only access their own appointments"
    ON appointments FOR ALL
    USING (tenant_id = auth_user_tenant_id());`;

  return (
    <div className="modal-overlay" onClick={onClose} id="architecture-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Database Architecture & Security Whitepaper
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Direct answers to iSectAI Developer Trial Requirements (Section 2.C)
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
            id="close-architecture-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="drawer-tabs" style={{ padding: '0 24px' }}>
          <button
            className={`drawer-tab ${activeSubTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('answers')}
          >
            <HelpCircle size={15} />
            <span>Architecture Questions (Section 2.C)</span>
          </button>

          <button
            className={`drawer-tab ${activeSubTab === 'erd' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('erd')}
          >
            <Layers size={15} />
            <span>Entity Relationship Diagram (ERD)</span>
          </button>

          <button
            className={`drawer-tab ${activeSubTab === 'schema_sql' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('schema_sql')}
          >
            <FileCode2 size={15} />
            <span>SQL Schema (DDL)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          {/* TAB 1: SECTION 2.C QUESTION ANSWERS */}
          {activeSubTab === 'answers' && (
            <div>
              {/* Question 1 */}
              <div className="qa-card">
                <div className="qa-question">
                  <Database size={16} color="#6366f1" />
                  <span>1. Why Supabase / PostgreSQL was chosen</span>
                </div>
                <div className="qa-answer">
                  <strong>Supabase (backed by PostgreSQL 15+)</strong> was chosen because iSectAI requires a database that is both strictly relational (for transactions, billing, customer identities, and appointment bookings) and highly flexible (for diverse industry metadata).
                  <br /><br />
                  <strong>Why prefer PostgreSQL/Supabase over alternatives:</strong>
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    <li><strong>Built-in Row Level Security (RLS):</strong> Multi-tenancy security is enforced directly at the database engine level rather than relying solely on error-prone application query filters.</li>
                    <li><strong>Hybrid Relational + JSONB:</strong> Enables relational integrity for tenant IDs, users, and foreign keys while allowing industry-specific fields (e.g. medical insurance and allergies vs. service equipment and warranty) to evolve inside indexed JSONB columns.</li>
                    <li><strong>Realtime WebSockets:</strong> Essential for live AI voice call status updates, incoming bookings, and dispatch status without polling.</li>
                    <li><strong>Vector Extensions (pgvector):</strong> Supabase supports pgvector natively, allowing iSectAI to store voice agent embeddings, patient context memory, and clinic knowledge bases in the exact same database.</li>
                  </ul>
                </div>
              </div>

              {/* Question 2 */}
              <div className="qa-card">
                <div className="qa-question">
                  <Layers size={16} color="#06b6d4" />
                  <span>2. How the design supports multiple businesses and industries</span>
                </div>
                <div className="qa-answer">
                  We implement a <strong>Hybrid Multi-Tenant Pattern</strong>:
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    <li><strong>Shared Core Entities:</strong> <code>tenants</code>, <code>users</code>, <code>ai_agents</code>, <code>ai_activity_logs</code>, and <code>contacts</code> share common relational columns (ID, tenant_id, name, phone, timestamps).</li>
                    <li><strong>Specialized Domain Tables:</strong> Medical clinics operate on <code>appointments</code> (with doctors, departments, AI triage summaries, and HIPAA-protected fields), whereas service businesses operate on <code>service_jobs</code> (with technician assignments, parts required, quotes, and dispatch addresses).</li>
                    <li><strong>Polymorphic Extensibility via JSONB:</strong> The <code>contacts.industry_attributes</code> column allows medical clinics to store DOB and dental insurance, while service companies store property types and HVAC equipment models without altering table schemas.</li>
                  </ul>
                </div>
              </div>

              {/* Question 3 */}
              <div className="qa-card">
                <div className="qa-question">
                  <Lock size={16} color="#f43f5e" />
                  <span>3. How each business's information is kept separate and secure</span>
                </div>
                <div className="qa-answer">
                  Every table contains a foreign key <code>tenant_id UUID REFERENCES tenants(id)</code> with PostgreSQL <strong>Row Level Security (RLS) enabled</strong>.
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    <li>When a customer business queries the database, Supabase evaluates the authenticated user's JWT claims (<code>auth.jwt() -&gt; app_metadata -&gt; 'tenant_id'</code>).</li>
                    <li>The RLS policy automatically filters rows matching <code>tenant_id = auth_user_tenant_id()</code>. Even if client-side code forgets a WHERE clause or attempts SQL injection, Postgres rejects cross-tenant reads or writes at the engine level.</li>
                  </ul>
                </div>
              </div>

              {/* Question 4 */}
              <div className="qa-card">
                <div className="qa-question">
                  <ShieldCheck size={16} color="#10b981" />
                  <span>4. Distinguishing internal administrator access from customer access</span>
                </div>
                <div className="qa-answer">
                  Access is partitioned using <strong>Role-Based Access Control (RBAC)</strong> embedded in JWT custom claims:
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    <li><strong>Platform Admins (iSectAI Internal Staff):</strong> Possess <code>role: 'platform_admin'</code> with <code>tenant_id: null</code>. The RLS policy grants them global access across all tenants, allowing this central monitoring dashboard to observe platform health, aggregated AI token consumption, and system-wide telemetry.</li>
                    <li><strong>Business Owners / Staff (Clinic or Service Co):</strong> Possess <code>role: 'business_owner'</code> or <code>'business_staff'</code> with their specific <code>tenant_id</code> strictly enforced. They have zero visibility into other businesses.</li>
                    <li><strong>Service Role:</strong> Internal background AI workers utilize Supabase's secure backend <code>service_role</code> key to insert AI call logs and update agent states.</li>
                  </ul>
                </div>
              </div>

              {/* Question 5 & 6 */}
              <div className="qa-card">
                <div className="qa-question">
                  <Server size={16} color="#f59e0b" />
                  <span>5 & 6. Advantages, Limitations, and Production Roadmap</span>
                </div>
                <div className="qa-answer">
                  <strong>Advantages:</strong> Single centralized database simplifies cross-tenant analytics, reduces operational cost, and allows instant provisioning of new clinics/businesses in milliseconds.
                  <br /><br />
                  <strong>Current Limitations:</strong> In an ultra-large multi-tenant setup (e.g. 50,000+ tenants), a single shared Postgres instance can face "noisy neighbor" resource contention or cross-region latency.
                  <br /><br />
                  <strong>Production Roadmap for iSectAI:</strong>
                  <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                    <li><strong>HIPAA BAA & Field-Level Encryption:</strong> Sign AWS/Supabase Business Associate Agreement (BAA) and implement pgcrypto client-side encryption for patient medical charts and intake triage notes.</li>
                    <li><strong>Multi-Region Read Replicas:</strong> Deploy read replicas closer to clinic locations (e.g., US-East and US-West) for sub-50ms AI voice latency.</li>
                    <li><strong>pgvector Knowledge Bases:</strong> Embed each clinic's FAQs, insurance policies, and doctor bios directly into Postgres for retrieval-augmented generation (RAG) during live voice calls.</li>
                    <li><strong>Immutable Audit Logging:</strong> Dedicated append-only audit trail table tracking every administrative record view for compliance.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ERD VISUALIZER */}
          {activeSubTab === 'erd' && (
            <div style={{ textAlign: 'center' }}>
              <div className="code-preview-box" style={{ textAlign: 'left', fontSize: '0.8rem' }}>
                <pre style={{ margin: 0, color: '#a5b4fc' }}>
{`+-------------------------------------------------------------------------------------------------+
|                                 iSectAI Multi-Tenant Data Model                                |
+-------------------------------------------------------------------------------------------------+

       +------------------------+
       |        TENANTS         |
       +------------------------+
       | id (UUID, PK)          |<-------------------+
       | name                   |                    |
       | slug (UNIQUE)          |                    |
       | industry (ENUM)        |                    |
       | subscription_tier      |                    |
       | business_settings JSONB|                    |
       +------------------------+                    |
          |       |        |                         |
          |       |        +-------------------------|-------------------------+
          |       v                                  |                         |
          |  +--------------------+                  v                         v
          |  |     AI_AGENTS      |        +-------------------+     +--------------------+
          |  +--------------------+        |   APPOINTMENTS    |     |    SERVICE_JOBS    |
          |  | id (UUID, PK)      |        |   (Medical Clinic)|     |  (Service Business)|
          |  | tenant_id (FK)     |        +-------------------+     +--------------------+
          |  | agent_type         |        | id (UUID, PK)     |     | id (UUID, PK)      |
          |  | system_prompt      |        | tenant_id (FK)    |     | tenant_id (FK)     |
          |  | total_calls_handled|        | provider_name     |     | technician_name    |
          |  +--------------------+        | appointment_type  |     | service_type       |
          |                                | scheduled_start   |     | priority (ENUM)    |
          v                                | ai_triage_summary |     | estimated_cost     |
     +--------------------------+          | hipaa_notes_masked|     | dispatch_address   |
     |    AI_ACTIVITY_LOGS      |          | booked_via_ai     |     | parts_required     |
     +--------------------------+          +-------------------+     +--------------------+
     | id (UUID, PK)            |
     | tenant_id (FK)           |
     | duration_seconds         |
     | tokens_used              |
     | sentiment                |
     | transcript_snippet       |
     +--------------------------+`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SCHEMA CODE */}
          {activeSubTab === 'schema_sql' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Located at: <code>supabase/schema.sql</code>
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(schemaExcerpt)}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="code-preview-box">
                <pre>{schemaExcerpt}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
