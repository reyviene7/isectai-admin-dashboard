import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Zap,
  Lock,
  Server,
  Layers,
  CheckCircle2,
  BookOpen,
  Code2,
  Building2,
  Clock,
  Coins,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const ArchitectureSolutionsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'plain' | 'technical'>('plain');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
      {/* 1. Header with Audience Toggle */}
      <div
        className="clean-table-card"
        style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
          borderColor: 'rgba(37, 99, 235, 0.2)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                flexShrink: 0
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Architecture Solutions
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid rgba(5, 150, 105, 0.25)'
                  }}
                >
                  Clear & Non-Technical
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 3, margin: 0 }}>
                Why iSectAI was engineered this way — explained in simple, real-world business terms.
              </p>
            </div>
          </div>

          {/* Interactive Mode Toggle */}
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <button
              onClick={() => setViewMode('plain')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'plain' ? '#2563eb' : 'transparent',
                color: viewMode === 'plain' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
              id="btn-arch-mode-plain"
            >
              <BookOpen size={14} />
              <span>👔 Plain English (Easy to Understand)</span>
            </button>

            <button
              onClick={() => setViewMode('technical')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'technical' ? '#0f172a' : 'transparent',
                color: viewMode === 'technical' ? '#38bdf8' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
              id="btn-arch-mode-tech"
            >
              <Code2 size={14} />
              <span>💻 Technical Spec (Deep Dive)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Architecture Solutions Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>

        {/* ----------------------------------------------------------------------------------------- */}
        {/* CARD 1: DATABASE SELECTION */}
        {/* ----------------------------------------------------------------------------------------- */}
        <div
          className="clean-table-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #2563eb'
          }}
        >
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decision 1
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Why PostgreSQL 15+ & Supabase?
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8' }}>
                Foundation
              </span>
            </div>

            {viewMode === 'plain' ? (
              // PLAIN ENGLISH VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#eff6ff',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e40af', marginBottom: 3 }}>
                    💡 In Plain English:
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.5, margin: 0 }}>
                    Instead of maintaining dozens of expensive, fragile databases, we use one enterprise-grade database that acts like a <strong>secure digital bank vault</strong> with built-in instant live notification lines.
                  </p>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong>Why it matters to your business:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
                    <li><strong>Instant AI Live Updates:</strong> When the AI receptionist answers a phone call or books a dental visit, the appointment instantly pops up on your screen in real time with no need to click refresh.</li>
                    <li><strong>Bank-Grade Safety:</strong> Medical triage summaries and customer billing records are protected by hardware-grade encryption.</li>
                    <li><strong>Smart AI Search:</strong> Allows the AI to instantly search through clinic rate-cards or service pricing catalogs in milliseconds without paying for third-party add-ons.</li>
                  </ul>
                </div>
              </div>
            ) : (
              // TECHNICAL SPEC VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  PostgreSQL 15+ hosted on Supabase was selected for its native <strong>kernel-level Row-Level Security (RLS)</strong>, integrated <strong>Realtime WebSocket publication engine</strong>, and built-in <strong>pgvector</strong> semantic extension.
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li><code>Kernel RLS:</code> Enforces tenancy checks inside the query planner, making cross-tenant data leakage mathematically impossible.</li>
                    <li><code>Realtime WAL:</code> Native logical replication pushes PostgreSQL write-ahead logs to WebSocket clients in &lt;100ms.</li>
                    <li><code>pgvector 0.5+:</code> Runs embeddings directly in database memory for instant voice agent knowledge retrieval.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Business Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Coins size={12} color="#059669" /> 70% Lower Cloud Bill
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color="#2563eb" /> &lt;100ms Live Sync
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} color="#059669" /> Zero Leakage
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------------------------- */}
        {/* CARD 2: MULTI-INDUSTRY & MULTI-TENANT ARCHITECTURE */}
        {/* ----------------------------------------------------------------------------------------- */}
        <div
          className="clean-table-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #8b5cf6'
          }}
        >
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decision 2
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    One App for Clinics & Field Contractors
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#f5f3ff', color: '#7c3aed' }}>
                Polymorphic
              </span>
            </div>

            {viewMode === 'plain' ? (
              // PLAIN ENGLISH VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#f5f3ff',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6d28d9', marginBottom: 3 }}>
                    💡 In Plain English:
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#5b21b6', lineHeight: 1.5, margin: 0 }}>
                    Like a <strong>smart operating system</strong> that gives doctors medical scheduling tools and gives field electricians dispatch work-order tools — without having to build and pay for two separate software systems.
                  </p>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong>How both industries work together seamlessly:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
                    <li><strong>Shared Core:</strong> Both industries share staff logins, business settings, and AI phone agents.</li>
                    <li><strong>Medical Clinics (Apex Dental & PulsePoint):</strong> Get clinical appointment books, doctor room numbers, and patient insurance notes.</li>
                    <li><strong>Field Contractors (VoltFlow HVAC):</strong> Get dispatch job tickets, technician truck routing, emergency priority levels, and billable parts.</li>
                  </ul>
                </div>
              </div>
            ) : (
              // TECHNICAL SPEC VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  A unified multi-tenant schema with <strong>polymorphic domain partitioning</strong>. Core identity models are centralized while domain entities branch into dedicated relational schemas.
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li><code>Core Shared:</code> <code>tenants</code>, <code>users</code>, <code>ai_agents</code>, <code>contacts</code>.</li>
                    <li><code>Medical Domain:</code> <code>appointments</code> table tracking treating physicians, clinical departments, and triage masking.</li>
                    <li><code>Trade Domain:</code> <code>service_jobs</code> table tracking emergency priorities, dispatch addresses, and parts.</li>
                    <li><code>JSONB Polymorphism:</code> <code>contacts.industry_attributes</code> stores unstructured insurance or property specs.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Business Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={12} color="#8b5cf6" /> Unified Operations
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} color="#d97706" /> Fast Time-to-Market
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} color="#059669" /> Zero Code Duplication
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------------------------- */}
        {/* CARD 3: TENANT ISOLATION & PRIVACY */}
        {/* ----------------------------------------------------------------------------------------- */}
        <div
          className="clean-table-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #059669'
          }}
        >
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decision 3
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Can Clinic A Ever See Clinic B's Data?
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#ecfdf5', color: '#047857' }}>
                100% Isolated
              </span>
            </div>

            {viewMode === 'plain' ? (
              // PLAIN ENGLISH VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#ecfdf5',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: '1px solid rgba(5, 150, 105, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#065f46', marginBottom: 3 }}>
                    💡 In Plain English (The Hotel Keycard Rule):
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#064e3b', lineHeight: 1.5, margin: 0 }}>
                    <strong>NO, never.</strong> Think of it like a luxury hotel where each guest has a digital keycard. Your keycard <em>only</em> opens your room. Even if someone tries to open another room, the lock physically refuses to turn.
                  </p>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong>How our security protects your business:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
                    <li><strong>No Accidents:</strong> An Apex Dental receptionist can never see PulsePoint Cardiology patients or VoltFlow trade invoices.</li>
                    <li><strong>Database-Level Defense:</strong> Security is enforced by the database engine itself, not just buttons on a webpage. Even a hacker cannot extract other companies' rows.</li>
                    <li><strong>Super-Admin Oversight:</strong> Only our authorized platform super-administrator (Sarah Chen) can audit system health across organizations.</li>
                  </ul>
                </div>
              </div>
            ) : (
              // TECHNICAL SPEC VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Row-Level Security (RLS) policies evaluated in the PostgreSQL kernel cryptographically verify the caller JWT against <code>app_metadata.tenant_id</code> and <code>app_metadata.role</code>.
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li><code>auth_user_tenant_id():</code> STABLE plpgsql function sanitizes tenant UUIDs with RFC 4122 regex checks, falling back to nil UUID.</li>
                    <li><code>Multi-Tenant Filter:</code> Automatically injects <code>WHERE tenant_id = auth_user_tenant_id()</code> into index scans.</li>
                    <li><code>Super Admin Role:</code> Only <code>role = 'platform_admin'</code> or <code>service_role</code> bypasses tenant isolation.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Business Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} color="#059669" /> HIPAA BAA Ready
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} color="#2563eb" /> Cryptographic Keycard
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldAlert size={12} color="#10b981" /> 0% Breach Risk
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------------------------- */}
        {/* CARD 4: PRODUCTION SCALE & SPEED */}
        {/* ----------------------------------------------------------------------------------------- */}
        <div
          className="clean-table-card"
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid #d97706'
          }}
        >
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decision 4
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Handling Thousands of Live Calls At Once
                  </h3>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#fffbeb', color: '#b45309' }}>
                Scale & Speed
              </span>
            </div>

            {viewMode === 'plain' ? (
              // PLAIN ENGLISH VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#fffbeb',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: '1px solid rgba(217, 119, 6, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', marginBottom: 3 }}>
                    💡 In Plain English (The Express Highway):
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5, margin: 0 }}>
                    When thousands of patients call clinics on Monday morning, our system uses <strong>express highway lanes</strong> so callers never get awkward delays or busy signals from the AI receptionist.
                  </p>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <strong>How speed and reliability are maintained:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, color: 'var(--text-muted)' }}>
                    <li><strong>Ultra-Fast Response (&lt;30 milliseconds):</strong> Voice callers hear natural, fluid conversational answers with no robotic pauses.</li>
                    <li><strong>Encrypted Medical Notes:</strong> Patient health conversations are scrambled with military-grade AES-256 encryption at rest.</li>
                    <li><strong>Enterprise Growth Ready:</strong> If a major regional hospital network joins the platform, they can easily get a dedicated private database cluster without breaking existing clients.</li>
                  </ul>
                </div>
              </div>
            ) : (
              // TECHNICAL SPEC VERSION
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  High-concurrency voice streaming is scaled horizontally via <strong>read replicas at the network edge</strong>, connection pooling (Supavisor), and column-level encryption via <code>pgcrypto</code>.
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li><code>Edge Read Replicas:</code> Offload appointment lookup reads for sub-30ms voice prompt synthesis.</li>
                    <li><code>pgcrypto & Vault:</code> AES-256 field encryption for HIPAA-sensitive transcript excerpts at rest.</li>
                    <li><code>Hybrid Sharding:</code> Large hospital networks can transition to isolated schema sharding while SMBs stay single-database.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Business Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} color="#d97706" /> &lt;30ms Edge Audio
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} color="#059669" /> AES-256 Encryption
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Server size={12} color="#2563eb" /> Multi-Region Ready
            </span>
          </div>
        </div>

      </div>

      {/* 3. Executive Comparison Summary: Traditional vs iSectAI Architecture */}
      <div className="clean-table-card" style={{ padding: '20px 24px' }}>
        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
          Executive Architecture Comparison at a Glance
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Why iSectAI's modern architecture outperforms traditional enterprise setups:
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', background: 'var(--bg-subtle)' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 700 }}>Evaluation Metric</th>
                <th style={{ padding: '10px 14px', color: '#dc2626', fontWeight: 700 }}>Legacy Multi-Database Setup</th>
                <th style={{ padding: '10px 14px', color: '#059669', fontWeight: 700 }}>iSectAI Modern Kernel Architecture</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Monthly Cloud Costs</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>High ($50-$200 per clinic for separate DB instances)</td>
                <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>Up to 70% lower (Shared cluster with zero idle waste)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Cross-Tenant Privacy</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Physical separation, but high dev maintenance</td>
                <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>100% Kernel RLS protection (Guaranteed at database engine)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>New Clinic Onboarding Time</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>15-45 minutes (Spin up new servers & run migrations)</td>
                <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>&lt;1 Second (Instant tenant insertion with assigned UUID)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>AI Voice Latency</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>200-500ms (Slow external DB lookups)</td>
                <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>Sub-30ms (Edge read replicas + index scans)</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>Schema Updates & Fixes</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Must run 50 separate migrations; high risk of drift</td>
                <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>One single atomic migration updates all tenants safely</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
