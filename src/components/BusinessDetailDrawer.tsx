import React, { useState } from 'react';
import {
  X,
  Wrench,
  Calendar,
  Bot,
  PhoneCall,
  Sparkles,
  MapPin,
  Pencil,
  Trash2
} from 'lucide-react';
import type { Tenant, AIAgent, Appointment, ServiceJob, AIActivityLog, SubscriptionTier, TenantStatus } from '../lib/types';

interface BusinessDetailDrawerProps {
  tenant: Tenant | null;
  agent?: AIAgent;
  appointments: Appointment[];
  serviceJobs: ServiceJob[];
  aiLogs: AIActivityLog[];
  onClose: () => void;
  onSimulateCall: (tenant: Tenant) => void;
  onUpdateTenant?: (id: string, updates: Partial<Tenant>) => Promise<void>;
  onDeleteTenant?: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

export const BusinessDetailDrawer: React.FC<BusinessDetailDrawerProps> = ({
  tenant,
  agent,
  appointments,
  serviceJobs,
  aiLogs,
  onClose,
  onSimulateCall,
  onUpdateTenant,
  onDeleteTenant,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'agent' | 'logs'>('records');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!tenant) return null;

  const isMedical = tenant.industry === 'medical_clinic';

  const tenantAppointments = appointments.filter((a) => a.tenant_id === tenant.id);
  const tenantJobs = serviceJobs.filter((j) => j.tenant_id === tenant.id);
  const tenantLogs = aiLogs.filter((l) => l.tenant_id === tenant.id);

  return (
    <div className="clean-drawer-backdrop" id="detail-drawer-backdrop">
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isAdmin && onUpdateTenant && (
              <button
                className="appt-action-btn edit-btn"
                onClick={() => setIsEditing(true)}
                title="Edit business details"
                style={{ padding: '6px 12px' }}
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}
            {isAdmin && onDeleteTenant && (
              <button
                className="appt-action-btn delete-btn"
                onClick={() => setIsDeleting(true)}
                title="Delete business"
                style={{ padding: '6px 12px' }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}
            <button
              className="btn-clean-secondary"
              onClick={onClose}
              style={{ width: 34, height: 34, padding: 0, justifyContent: 'center' }}
              id="close-drawer-btn"
            >
              <X size={16} />
            </button>
          </div>
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

      {/* Edit Business Modal */}
      {isEditing && (
        <EditBusinessModal
          tenant={tenant}
          onClose={() => setIsEditing(false)}
          onSave={async (updates) => {
            if (onUpdateTenant) {
              await onUpdateTenant(tenant.id, updates);
            }
            setIsEditing(false);
          }}
        />
      )}

      {/* Delete Business Confirmation Modal */}
      {isDeleting && (
        <DeleteBusinessModal
          tenant={tenant}
          onClose={() => setIsDeleting(false)}
          onConfirm={async () => {
            if (onDeleteTenant) {
              await onDeleteTenant(tenant.id);
            }
            setIsDeleting(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};

/* ==============================================================================================
   SUB-COMPONENT: EDIT BUSINESS MODAL
   ============================================================================================== */
interface EditBusinessModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (updates: Partial<Tenant>) => Promise<void>;
}

const EditBusinessModal: React.FC<EditBusinessModalProps> = ({ tenant, onClose, onSave }) => {
  const [name, setName] = useState(tenant.name);
  const [phone, setPhone] = useState(tenant.phone || '');
  const [email, setEmail] = useState(tenant.email || '');
  const [address, setAddress] = useState(tenant.address || '');
  const [city, setCity] = useState(tenant.city || '');
  const [state, setState] = useState(tenant.state || '');
  const [postalCode, setPostalCode] = useState(tenant.postal_code || '');
  const [tier, setTier] = useState<SubscriptionTier>(tenant.subscription_tier);
  const [status, setStatus] = useState<TenantStatus>(tenant.status);
  const [tagline, setTagline] = useState(tenant.branding?.tagline || '');
  const [operatingHours, setOperatingHours] = useState(tenant.business_settings?.operating_hours || '08:00 - 18:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        subscription_tier: tier,
        status,
        branding: {
          ...tenant.branding,
          tagline: tagline.trim()
        },
        business_settings: {
          ...tenant.business_settings,
          operating_hours: operatingHours.trim()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-overlay" id="edit-business-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Pencil size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Edit Business Profile
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Update practice parameters, subscription tier, and contact information
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            {/* Business Name */}
            <div className="modal-form-group">
              <label className="modal-label">Business / Clinic Name</label>
              <input
                type="text"
                className="modal-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone & Email (2-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Phone</label>
                <input
                  type="text"
                  className="modal-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Email</label>
                <input
                  type="email"
                  className="modal-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="modal-form-group">
              <label className="modal-label">Street Address</label>
              <input
                type="text"
                className="modal-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* City, State, Postal Code (3-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">City</label>
                <input
                  type="text"
                  className="modal-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">State</label>
                <input
                  type="text"
                  className="modal-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Postal Code</label>
                <input
                  type="text"
                  className="modal-input"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            {/* Subscription Tier & Status (2-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Subscription Tier</label>
                <select
                  className="modal-input"
                  value={tier}
                  onChange={(e) => setTier(e.target.value as SubscriptionTier)}
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Operating Status</label>
                <select
                  className="modal-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TenantStatus)}
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="paused">Paused</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Tagline */}
            <div className="modal-form-group">
              <label className="modal-label">Branding Tagline</label>
              <input
                type="text"
                className="modal-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Specialty Clinical Care & Surgical Practice"
              />
            </div>

            {/* Operating Hours */}
            <div className="modal-form-group" style={{ marginBottom: 0 }}>
              <label className="modal-label">Operating Hours</label>
              <input
                type="text"
                className="modal-input"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 08:00 - 18:00"
              />
            </div>
          </div>

          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==============================================================================================
   SUB-COMPONENT: DELETE BUSINESS MODAL
   ============================================================================================== */
interface DeleteBusinessModalProps {
  tenant: Tenant;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteBusinessModal: React.FC<DeleteBusinessModalProps> = ({ tenant, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-overlay" id="delete-business-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Trash2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Delete Business
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Permanently decommission this organization
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className="clean-modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete <strong>{tenant.name}</strong>? This action will cascade delete all linked appointments, work orders, AI agents, and staff accounts directly from PostgreSQL.
          </p>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
              {tenant.name}
            </strong>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Industry: {tenant.industry === 'medical_clinic' ? 'Medical Clinic' : 'Field Service'} • {tenant.subscription_tier} tier
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Phone: {tenant.phone} • {tenant.city}, {tenant.state}
            </span>
          </div>
        </div>

        <div className="clean-modal-footer">
          <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-clean-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Business'}
          </button>
        </div>
      </div>
    </div>
  );
};
