import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Wrench,
  Calendar,
  MapPin,
  Bot,
  FileText,
  PhoneCall,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import type { Tenant, AIAgent, Appointment, ServiceJob, AIActivityLog } from '../lib/types';

interface BusinessDetailDrawerProps {
  tenant: Tenant | null;
  agent?: AIAgent;
  appointments: Appointment[];
  serviceJobs: ServiceJob[];
  aiLogs: AIActivityLog[];
  onClose: () => void;
  onSimulateCall: (tenant: Tenant) => void;
}

export const BusinessDetailDrawer: React.FC<BusinessDetailDrawerProps> = ({
  tenant,
  agent,
  appointments,
  serviceJobs,
  aiLogs,
  onClose,
  onSimulateCall
}) => {
  if (!tenant) return null;

  const [activeTab, setActiveTab] = useState<'records' | 'ai_agent' | 'ai_logs' | 'settings'>('records');
  const isMedical = tenant.industry === 'medical_clinic';

  const tenantAppointments = appointments.filter((a) => a.tenant_id === tenant.id);
  const tenantJobs = serviceJobs.filter((j) => j.tenant_id === tenant.id);
  const tenantLogs = aiLogs.filter((l) => l.tenant_id === tenant.id);

  return (
    <div className="drawer-backdrop" onClick={onClose} id="detail-drawer-backdrop">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()} id="detail-drawer-panel">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`industry-pill ${isMedical ? 'medical' : 'service'}`}>
                {isMedical ? (
                  <>
                    <Stethoscope size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Medical Clinic
                  </>
                ) : (
                  <>
                    <Wrench size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Field Service Business
                  </>
                )}
              </span>
              <span className="tier-pill">{tenant.subscription_tier}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#6ee7b7',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 999
                }}
              >
                Tenant ID: {tenant.id.slice(0, 8)}...
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{tenant.name}</h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                marginTop: 6
              }}
            >
              <span>{tenant.phone}</span>
              <span>•</span>
              <span>{tenant.email}</span>
              <span>•</span>
              <span>
                {tenant.city}, {tenant.state}
              </span>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 36, height: 36, padding: 0 }}
            id="close-drawer-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="drawer-tabs">
          <button
            className={`drawer-tab ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
            id="drawer-tab-records"
          >
            {isMedical ? <Calendar size={16} /> : <Wrench size={16} />}
            <span>
              {isMedical
                ? `Appointments (${tenantAppointments.length})`
                : `Dispatch Jobs (${tenantJobs.length})`}
            </span>
          </button>

          <button
            className={`drawer-tab ${activeTab === 'ai_agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_agent')}
            id="drawer-tab-agent"
          >
            <Bot size={16} />
            <span>AI Voice Agent</span>
          </button>

          <button
            className={`drawer-tab ${activeTab === 'ai_logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_logs')}
            id="drawer-tab-logs"
          >
            <PhoneCall size={16} />
            <span>AI Call Telemetry ({tenantLogs.length})</span>
          </button>

          <button
            className={`drawer-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            id="drawer-tab-settings"
          >
            <FileText size={16} />
            <span>Tenant Settings</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="drawer-body">
          {/* TAB 1: DOMAIN RECORDS */}
          {activeTab === 'records' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    {isMedical ? 'Patient Appointment Schedule' : 'Field Service Work Orders'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {isMedical
                      ? 'Demonstrating healthcare domain records with AI triage and HIPAA-masked clinical data'
                      : 'Demonstrating field trade work orders, technician dispatches, and quotes'}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSimulateCall(tenant)}
                  id="drawer-simulate-action-btn"
                >
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Simulate AI Booking</span>
                </button>
              </div>

              {/* RENDER MEDICAL APPOINTMENTS */}
              {isMedical && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {tenantAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="glass-panel"
                      style={{ padding: 18, background: 'var(--bg-surface-elevated)' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: 'rgba(14, 165, 233, 0.2)',
                              color: '#38bdf8'
                            }}
                          >
                            {appt.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(appt.scheduled_start).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {appt.booked_via_ai && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Sparkles size={12} /> Booked via iSectAI
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                        {appt.appointment_type}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        <strong>Treating Provider:</strong> {appt.provider_name} ({appt.department})
                        {appt.room_number && ` • Room: ${appt.room_number}`}
                      </p>

                      {appt.chief_complaint && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            color: '#cbd5e1'
                          }}
                        >
                          <strong>Chief Complaint:</strong> {appt.chief_complaint}
                        </div>
                      )}

                      {appt.ai_triage_summary && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '8px 12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            color: '#c7d2fe',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          <strong>AI Triage Summary:</strong> {appt.ai_triage_summary}
                        </div>
                      )}

                      {appt.hipaa_notes_masked && (
                        <div
                          style={{
                            marginTop: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.75rem',
                            color: '#94a3b8'
                          }}
                        >
                          <ShieldAlert size={13} color="#f43f5e" />
                          <span>{appt.hipaa_notes_masked}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* RENDER SERVICE DISPATCH JOBS */}
              {!isMedical && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {tenantJobs.map((job) => (
                    <div
                      key={job.id}
                      className="glass-panel"
                      style={{ padding: 18, background: 'var(--bg-surface-elevated)' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                job.priority === 'emergency'
                                  ? 'rgba(244, 63, 94, 0.2)'
                                  : 'rgba(245, 158, 11, 0.2)',
                              color: job.priority === 'emergency' ? '#fb7185' : '#fbbf24'
                            }}
                          >
                            {job.priority} Priority
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: 'var(--bg-surface)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            Status: {job.status.replace('_', ' ')}
                          </span>
                        </div>

                        {job.estimated_cost && (
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: '#34d399'
                            }}
                          >
                            Est: ${job.estimated_cost.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                        {job.service_type}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        <strong>Assigned Specialist:</strong> {job.technician_name}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginTop: 6
                        }}
                      >
                        <MapPin size={14} />
                        <span>{job.dispatch_address}</span>
                      </div>

                      {job.ai_intake_notes && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '10px 14px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            borderRadius: 8,
                            fontSize: '0.82rem',
                            color: '#fef3c7',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}
                        >
                          <strong>AI Problem Diagnosis:</strong> {job.ai_intake_notes}
                        </div>
                      )}

                      {job.parts_required && job.parts_required.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontWeight: 600
                            }}
                          >
                            Parts Requisitioned:
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 6,
                              marginTop: 4
                            }}
                          >
                            {job.parts_required.map((part, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: 'rgba(255,255,255,0.06)',
                                  color: '#cbd5e1'
                                }}
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI VOICE AGENT PROFILE */}
          {activeTab === 'ai_agent' && (
            <div>
              <div className="glass-panel" style={{ padding: 24, marginBottom: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <Bot size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                        {agent ? agent.name : 'Dedicated Voice Agent'}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        ● Active & Handling Inbound Calls
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'var(--bg-surface)',
                      fontSize: '0.78rem',
                      color: '#a5b4fc',
                      fontWeight: 600
                    }}
                  >
                    LLM: {agent?.llm_model || 'gpt-4o'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 14,
                    padding: '14px 0',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: 18
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Inbound Voice Profile
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {agent?.voice_profile || 'en-US-Neural2-F (Emma)'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Assigned Direct DID
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {agent?.phone_number || tenant.phone}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Calls Handled
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {agent?.total_calls_handled ? agent.total_calls_handled.toLocaleString() : '1,200+'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Call Forwarding Protocol
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399' }}>
                      Enabled (Emergency Transfer Active)
                    </p>
                  </div>
                </div>

                <h5
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Active System Prompt Configuration:
                </h5>
                <div
                  style={{
                    background: '#060912',
                    padding: 16,
                    borderRadius: 12,
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    color: '#93c5fd',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {agent?.system_prompt ||
                    `You are the intelligent receptionist for ${tenant.name}. Warmly greet callers, verify details, and schedule appointments autonomously.`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI CALL TELEMETRY & TRANSCRIPTS */}
          {activeTab === 'ai_logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10
                }}
              >
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  Recent Inbound AI Voice Interactions
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Real-time audio telemetry
                </span>
              </div>

              {tenantLogs.length === 0 ? (
                <div
                  className="glass-panel"
                  style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}
                >
                  <p>No recent call logs for this tenant yet.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onSimulateCall(tenant)}
                    style={{ marginTop: 12 }}
                  >
                    Simulate Sample Call
                  </button>
                </div>
              ) : (
                tenantLogs.map((log) => (
                  <div
                    key={log.id}
                    className="glass-panel"
                    style={{ padding: 18, background: 'var(--bg-surface-elevated)' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                          {log.caller_name}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ({log.caller_phone})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background:
                              log.sentiment === 'urgent'
                                ? 'rgba(244, 63, 94, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            color: log.sentiment === 'urgent' ? '#fb7185' : '#6ee7b7'
                          }}
                        >
                          {log.sentiment}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {log.duration_seconds}s • {log.tokens_used.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                      {log.summary}
                    </p>

                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.8rem',
                        color: '#cbd5e1',
                        borderLeft: '3px solid #6366f1'
                      }}
                    >
                      <strong>Transcript Snippet:</strong> {log.transcript_snippet}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS & METADATA */}
          {activeTab === 'settings' && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>
                Tenant Configuration & Operating Parameters
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label className="form-label">Operating Schedule</label>
                  <div className="code-preview-box">
                    {tenant.business_settings?.operating_hours || '08:00 - 18:00'}
                  </div>
                </div>

                <div>
                  <label className="form-label">Timezone</label>
                  <div className="code-preview-box">
                    {tenant.business_settings?.timezone || 'America/New_York'}
                  </div>
                </div>

                <div>
                  <label className="form-label">Autonomous AI Booking</label>
                  <div className="code-preview-box">
                    {tenant.business_settings?.ai_auto_booking ? 'ENABLED' : 'DISABLED'}
                  </div>
                </div>

                <div>
                  <label className="form-label">Data Privacy Level</label>
                  <div className="code-preview-box">
                    {isMedical ? 'HIPAA Strict Isolation' : 'Commercial Confidential'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
