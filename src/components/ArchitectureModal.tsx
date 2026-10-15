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
  const [activeSubTab, setActiveSubTab] = useState<'answers' | 'erd' | 'schema_sql'>('answers');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaExcerpt = `-- iSectAI PostgreSQL Multi-Tenant Schema
CREATE TYPE business_industry AS ENUM ('medical_clinic', 'service_business');
CREATE TYPE user_role AS ENUM ('platform_admin', 'business_owner', 'business_staff', 'practitioner');

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry business_industry NOT NULL,
    subscription_tier subscription_tier NOT NULL DEFAULT 'growth',
    branding JSONB DEFAULT '{"primary_color": "#2563eb"}'::jsonb,
    business_settings JSONB DEFAULT '{"ai_auto_booking": true}'::jsonb
);

-- Row Level Security (RLS) Policy:
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform Admins have full access"
    ON tenants FOR ALL
    USING (auth_user_role() = 'platform_admin' OR auth.role() = 'service_role');

CREATE POLICY "Tenants can only access their own appointments"
    ON appointments FOR ALL
    USING (tenant_id = auth_user_tenant_id());`;

  return (
    <div className="clean-modal-overlay" onClick={onClose} id="architecture-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Database Architecture & Security
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Direct answers to iSectAI Trial Requirements (Section 2.C)
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
            id="close-architecture-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="drawer-nav-tabs" style={{ padding: '0 24px' }}>
          <button
            className={`drawer-nav-btn ${activeSubTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('answers')}
          >
            <HelpCircle size={15} />
            <span>Architecture Rationale</span>
          </button>

          <button
            className={`drawer-nav-btn ${activeSubTab === 'erd' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('erd')}
          >
            <Layers size={15} />
            <span>ERD Data Model</span>
          </button>

          <button
            className={`drawer-nav-btn ${activeSubTab === 'schema_sql' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('schema_sql')}
          >
            <FileCode2 size={15} />
            <span>SQL Schema</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="clean-modal-body">
          {activeSubTab === 'answers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Q1 */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}
                >
                  <Database size={16} color="var(--primary)" />
                  1. Why Supabase / PostgreSQL was chosen
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  PostgreSQL 15+ backed by Supabase was selected because iSectAI requires both <strong>kernel-enforced Row Level Security (RLS)</strong> and <strong>hybrid relational + JSONB flexibility</strong>. RLS ensures tenant data isolation at the database layer rather than relying on error-prone application query filters. Real-time WebSockets push instant voice call updates, and native <code>pgvector</code> support enables knowledge-base RAG for AI receptionists in the exact same database.
                </p>
              </div>

              {/* Q2 */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}
                >
                  <Layers size={16} color="var(--medical-color)" />
                  2. Supporting Multiple Businesses & Industries
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  We implement a <strong>Hybrid Multi-Tenant Pattern</strong>: Core platform entities (<code>tenants</code>, <code>users</code>, <code>ai_agents</code>, <code>contacts</code>) are shared, while domain-specific tables cater directly to each industry—<code>appointments</code> (with doctors, departments, and clinical triage) for healthcare, and <code>service_jobs</code> (with technician dispatches, quotes, and parts) for field trades.
                </p>
              </div>

              {/* Q3 & Q4 */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}
                >
                  <Lock size={16} color="#059669" />
                  3 & 4. Tenant Isolation & Admin vs. Customer RBAC
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Every sensitive table has RLS enabled with foreign key <code>tenant_id UUID</code>. Supabase evaluates authenticated JWT metadata: Customer staff (<code>role: 'business_staff'</code>) are strictly restricted to <code>tenant_id = auth_user_tenant_id()</code>. Platform Administrators (<code>role: 'platform_admin'</code>) bypass tenant scoping to monitor system-wide AI calls, billing, and health metrics.
                </p>
              </div>

              {/* Q5 & Q6 */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6
                  }}
                >
                  <Server size={16} color="var(--service-color)" />
                  5 & 6. Production Roadmap & Improvements
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  For production rollout at scale: (1) Execute HIPAA Business Associate Agreement (BAA) and apply column-level encryption for patient medical intake notes; (2) Deploy multi-region read replicas for sub-30ms voice agent response; (3) Store practice FAQs and trade rate cards via <code>pgvector</code> for context retrieval during live voice calls.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'erd' && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                overflowX: 'auto'
              }}
            >
              <pre style={{ margin: 0 }}>
{`tenants (id, name, slug, industry, status, branding, settings)
   ├── users (id, tenant_id, role: platform_admin | business_owner | staff)
   ├── ai_agents (id, tenant_id, name, model, system_prompt, total_calls)
   ├── contacts (id, tenant_id, full_name, phone, industry_attributes: JSONB)
   ├── appointments (id, tenant_id, provider_name, scheduled_start, ai_triage_summary)
   ├── service_jobs (id, tenant_id, technician_name, priority, estimated_cost, parts)
   └── ai_activity_logs (id, tenant_id, duration_seconds, tokens_used, transcript)`}
              </pre>
            </div>
          )}

          {activeSubTab === 'schema_sql' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  File: <code>supabase/schema.sql</code>
                </span>
                <button
                  className="btn-clean-secondary"
                  onClick={() => copyToClipboard(schemaExcerpt)}
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto'
                }}
              >
                <pre>{schemaExcerpt}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="clean-modal-footer">
          <button className="btn-clean-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
