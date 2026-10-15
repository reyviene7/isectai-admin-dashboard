import React, { useState } from 'react';
import {
  X,
  Wrench,
  Calendar,
  Bot,
  PhoneCall,
  Sparkles,
  MapPin
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

  const [activeTab, setActiveTab] = useState<'records' | 'agent' | 'logs'>('records');
  const isMedical = tenant.industry === 'medical_clinic';

  const tenantAppointments = appointments.filter((a) => a.tenant_id === tenant.id);
  const tenantJobs = serviceJobs.filter((j) => j.tenant_id === tenant.id);
  const tenantLogs = aiLogs.filter((l) => l.tenant_id === tenant.id);

  return (
    <div className="clean-drawer-backdrop" onClick={onClose} id="detail-drawer-backdrop">
      <div className="clean-drawer" onClick={(e) => e.stopPropagation()} id="detail-drawer-panel">
        {/* Top Header Banner */}
        <div className="drawer-top-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={`badge-clean ${isMedical ? 'badge-medical' : 'badge-service'}`}>
                {isMedical ? 'Medical Clinic' : 'Field Service'}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)'
                }}
              >
                {tenant.subscription_tier} tier
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {tenant.name}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginTop: 4
              }}
            >
              <span>{tenant.phone}</span>
              <span>•</span>
              <span>
                {tenant.city}, {tenant.state}
              </span>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 34, height: 34, padding: 0, justifyContent: 'center' }}
            id="close-drawer-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Clean Tabs */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-nav-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            {isMedical ? <Calendar size={15} /> : <Wrench size={15} />}
            <span>
              {isMedical
                ? `Appointments (${tenantAppointments.length})`
                : `Work Orders (${tenantJobs.length})`}
            </span>
          </button>

          <button
            className={`drawer-nav-btn ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <Bot size={15} />
            <span>AI Voice Agent</span>
          </button>

          <button
            className={`drawer-nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <PhoneCall size={15} />
            <span>Call Telemetry ({tenantLogs.length})</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="drawer-content-body">
          {/* TAB 1: DOMAIN RECORDS */}
          {activeTab === 'records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isMedical ? 'Patient Appointment Schedule' : 'Field Work Orders & Dispatches'}
                </h4>
                <button
                  className="btn-simulate-call"
                  onClick={() => onSimulateCall(tenant)}
                  id="drawer-simulate-call-btn"
                >
                  <Sparkles size={12} />
                  <span>Simulate AI Booking</span>
                </button>
              </div>

              {/* Medical Appointments List */}
              {isMedical &&
                tenantAppointments.map((appt) => (
                  <div key={appt.id} className="schedule-item-card">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6
                      }}
                    >
                      <span className="badge-clean badge-medical">{appt.status}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(appt.scheduled_start).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {appt.appointment_type}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Doctor: {appt.provider_name} ({appt.department})
                    </p>

                    {appt.chief_complaint && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '6px 10px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <strong>Chief Complaint:</strong> {appt.chief_complaint}
                      </div>
                    )}

                    {appt.ai_triage_summary && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: '6px 10px',
                          background: 'var(--primary-soft)',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          color: 'var(--primary)'
                        }}
                      >
                        <strong>AI Triage:</strong> {appt.ai_triage_summary}
                      </div>
                    )}
                  </div>
                ))}

              {/* Service Jobs List */}
              {!isMedical &&
                tenantJobs.map((job) => (
                  <div key={job.id} className="schedule-item-card">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 6
                      }}
                    >
                      <span
                        className={`badge-clean ${
                          job.priority === 'emergency' ? 'badge-danger' : 'badge-service'
                        }`}
                      >
                        {job.priority} Priority
                      </span>
                      <strong style={{ fontSize: '0.92rem', color: '#059669' }}>
                        Est: ${job.estimated_cost?.toFixed(2)}
                      </strong>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {job.service_type}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Technician: {job.technician_name}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: 4
                      }}
                    >
                      <MapPin size={12} />
                      <span>{job.dispatch_address}</span>
                    </div>

                    {job.ai_intake_notes && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '6px 10px',
                          background: 'var(--service-soft)',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          color: 'var(--service-color)'
                        }}
                      >
                        <strong>Diagnosis:</strong> {job.ai_intake_notes}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* TAB 2: AI VOICE AGENT SPECS */}
          {activeTab === 'agent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="schedule-item-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {agent?.name || 'Dedicated Voice Agent'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      ● Active & Handling Inbound Calls
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 10,
                    fontSize: '0.82rem',
                    padding: '10px 0',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: 12
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Model</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {agent?.llm_model || 'gpt-4o'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Voice DID Phone</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {agent?.phone_number || tenant.phone}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Voice Profile</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {agent?.voice_profile || 'en-US-Neural2-F'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Total Calls Handled</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {agent?.total_calls_handled.toLocaleString() || '1,200+'}
                    </p>
                  </div>
                </div>

                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  System Prompt:
                </span>
                <div
                  style={{
                    marginTop: 4,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4
                  }}
                >
                  {agent?.system_prompt}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALL LOGS */}
          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tenantLogs.map((log) => (
                <div key={log.id} className="schedule-item-card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6
                    }}
                  >
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {log.caller_name} ({log.caller_phone})
                    </strong>
                    <span
                      className={`badge-clean ${
                        log.sentiment === 'urgent' ? 'badge-danger' : 'badge-success'
                      }`}
                    >
                      {log.sentiment}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {log.summary}
                  </p>

                  <div
                    style={{
                      fontSize: '0.78rem',
                      background: 'var(--bg-subtle)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <strong>Transcript:</strong> {log.transcript_snippet}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
