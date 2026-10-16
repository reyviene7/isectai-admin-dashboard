import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

interface LegalModalProps {
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  initialTab = 'terms',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  return (
    <div
      className="clean-modal-overlay"
      id="legal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="clean-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-shell)'
        }}
      >
        {/* Header */}
        <div className="clean-modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeTab === 'terms' ? (
                <FileText size={20} color="var(--primary)" />
              ) : (
                <ShieldCheck size={20} color="#10b981" />
              )}
              <h2 id="legal-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {activeTab === 'terms' ? 'iSectAI Terms of Service' : 'iSectAI Privacy Policy'}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Last updated: October 16, 2026 • Effective for all multi-tenant clinic and trade enterprise accounts
            </p>
          </div>

          <button
            type="button"
            className="clean-modal-close"
            onClick={onClose}
            aria-label="Close Modal"
            title="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 24px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-subtle)'
          }}
        >
          <button
            type="button"
            className={`filter-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            className={`filter-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <ShieldCheck size={14} />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Body Content */}
        <div
          className="clean-modal-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            fontSize: '0.84rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            background: 'var(--bg-shell)'
          }}
        >
          {activeTab === 'terms' ? (
            <>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  1. Acceptance of Terms
                </h3>
                <p style={{ margin: 0 }}>
                  By accessing or utilizing the iSectAI Platform, including our autonomous AI reception agents, multi-tenant clinical scheduling infrastructure, and emergency trade dispatch consoles, you acknowledge and agree to be bound by these Terms of Service.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  2. Autonomous AI Voice & Triage Disclaimer
                </h3>
                <p style={{ margin: 0 }}>
                  iSectAI provides natural-language voice orchestration and clinical appointment scheduling. While configured for healthcare triage workflows, <strong>iSectAI does not provide emergency medical diagnosis or replace 911/emergency first-responder services</strong>. In life-threatening emergencies, patients are immediately instructed by the system to hang up and dial emergency services.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  3. Multi-Tenant Data Isolation & Security
                </h3>
                <p style={{ margin: 0 }}>
                  Each subscriber operates within a cryptographically isolated tenant partition protected by PostgreSQL Row-Level Security (RLS). You are responsible for safeguarding your administrative and staff login credentials. Cross-tenant data inspection or unauthorized API access is strictly prohibited and subject to immediate revocation.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  4. Acceptable Platform Use
                </h3>
                <p style={{ margin: 0 }}>
                  Users agree to utilize iSectAI exclusively for lawful operational purposes, such as patient intake, appointment scheduling, field technician routing, and communication telemetry. Unsolicited outbound robocalling or deceptive telemarketing is expressly prohibited.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  5. Service Availability & SLA
                </h3>
                <p style={{ margin: 0 }}>
                  iSectAI maintains a 99.9% target uptime SLA for real-time voice channels and database nodes. Scheduled maintenance is communicated in advance to designated Platform Administrators.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  6. Contact & Legal Notices
                </h3>
                <p style={{ margin: 0 }}>
                  For enterprise licensing, compliance questions, or legal notices, contact our compliance team at <strong>legal@isectai.internal</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  1. Information We Collect
                </h3>
                <p style={{ margin: 0 }}>
                  iSectAI processes information required to coordinate appointments and field services, including caller phone numbers, contact names, scheduled time slots, and voice intake transcripts recorded during autonomous phone interactions.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  2. Protected Health Information (PHI) & HIPAA Compliance
                </h3>
                <p style={{ margin: 0 }}>
                  When serving medical clinics, iSectAI operates under strict HIPAA compliance safeguards. Clinical triage notes and appointment records are encrypted in transit via TLS 1.3 and at rest with AES-256. Masked identifiers are utilized across public logs.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  3. Zero Model Training on Private Clinical Data
                </h3>
                <p style={{ margin: 0 }}>
                  <strong>We do not use your proprietary patient communications, medical triage notes, or trade job transcripts to train public large language models.</strong> Voice synthesis and transcript extraction occur in private, isolated enterprise environments.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  4. Data Retention & Cryptographic Isolation
                </h3>
                <p style={{ margin: 0 }}>
                  Call logs, audio telemetry, and appointment records are stored within tenant-specific schemas enforced by PostgreSQL Row-Level Security (RLS). Retention windows are fully configurable by your Platform Administrator.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  5. Security Standards & Audit Logging
                </h3>
                <p style={{ margin: 0 }}>
                  Every administrative action, staff login, and autonomous booking is audited with immutable timestamps, IP records, and cryptographic signatures adhering to SOC2 Type II standards.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 6 }}>
                  6. Privacy Inquiries & Data Rights
                </h3>
                <p style={{ margin: 0 }}>
                  To request data export, audit reports, or credential de-provisioning, please reach out to <strong>privacy@isectai.internal</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="clean-modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>HIPAA Verified • AES-256 Encrypted</span>
          </div>
          <button
            type="button"
            className="btn-clean-primary"
            onClick={onClose}
            id="btn-close-legal-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
