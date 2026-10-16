import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Building2, Mail, Lock, Phone, User, Briefcase } from 'lucide-react';
import type { Tenant, UserAccount } from '../lib/types';

interface AddStaffModalProps {
  tenants: Tenant[];
  onClose: () => void;
  onAddStaff: (newUserData: Omit<UserAccount, 'id' | 'created_at'>) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  tenants,
  onClose,
  onAddStaff
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('+1 (212) 555-0188');
  const [password, setPassword] = useState('password123');

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    onAddStaff({
      tenant_id: selectedTenantId || null,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: 'business_staff',
      title: title.trim() || (selectedTenant?.industry === 'medical_clinic' ? 'Clinic Coordinator' : 'Field Dispatcher'),
      phone: phone.trim(),
      password: password || 'password123',
      is_active: true
    });

    onClose();
  };

  return (
    <div className="clean-modal-overlay" id="add-staff-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
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
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  Provision Staff Account
                </h3>
                <span className="badge-clean badge-primary" style={{ fontSize: '0.62rem' }}>
                  ADMIN AUTHORITY
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Create a scoped staff account for clinic reception or field dispatch
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }}
            id="close-add-staff-modal-btn"
            title="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form with Standard Structure */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body">
            {/* Assigned Business */}
            <div className="modal-form-group">
              <label className="modal-label">Assigned Business / Practice</label>
              <div className="input-with-icon">
                <Building2 size={16} className="field-icon" />
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="modal-select"
                  id="staff-tenant-select"
                  required
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.industry === 'medical_clinic' ? 'Clinic' : 'Trades'})
                    </option>
                  ))}
                </select>
              </div>
              <span className="modal-helper-text">
                Staff member will only be able to view and manage appointments/jobs for this entity.
              </span>
            </div>

            {/* Staff Full Name */}
            <div className="modal-form-group">
              <label className="modal-label">Staff Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Nurse Chloe Martinez or Tyler Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  id="staff-fullname-input"
                />
              </div>
            </div>

            {/* Login Email Address */}
            <div className="modal-form-group">
              <label className="modal-label">Login Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  className="modal-input"
                  placeholder="chloe@apexdentalnyc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="staff-email-input"
                />
              </div>
            </div>

            {/* Role Title & Direct Phone (2-Col Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Role Title</label>
                <div className="input-with-icon">
                  <Briefcase size={15} className="field-icon" />
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Patient Coordinator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    id="staff-title-input"
                  />
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Direct Phone</label>
                <div className="input-with-icon">
                  <Phone size={15} className="field-icon" />
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="+1 (212) 555-0188"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="staff-phone-input"
                  />
                </div>
              </div>
            </div>

            {/* Initial Access Password */}
            <div className="modal-form-group" style={{ marginBottom: 12 }}>
              <label className="modal-label">Initial Access Password</label>
              <div className="input-with-icon">
                <Lock size={15} className="field-icon" />
                <input
                  type="text"
                  className="modal-input"
                  placeholder="password123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="staff-password-input"
                />
              </div>
            </div>

            {/* Security Callout Banner */}
            <div className="modal-security-callout">
              <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                Staff members inherit scoped RLS credentials and cannot alter database architecture or provision other accounts.
              </span>
            </div>
          </div>

          {/* Clean Modal Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} id="cancel-add-staff-btn">
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" id="btn-save-staff">
              <UserPlus size={15} />
              <span>Provision Staff Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
