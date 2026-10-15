import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Building2, Mail, Lock, Phone } from 'lucide-react';
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
    <div className="clean-modal-overlay" onClick={onClose} id="add-staff-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Modal Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Provision Staff Account
                </h3>
                <span className="badge-clean badge-primary" style={{ fontSize: '0.62rem' }}>
                  Admin Authority
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Create a scoped staff account for clinic reception or field dispatch
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
            id="close-add-staff-modal-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="clean-modal-body">
          {/* Assigned Business */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6
              }}
            >
              Assigned Business / Practice
            </label>
            <div className="input-with-icon">
              <Building2 size={16} className="field-icon" />
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-shell)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
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
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
              Staff member will only be able to view and manage appointments/jobs for this entity.
            </span>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6
              }}
            >
              Staff Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Nurse Chloe Martinez or Tyler Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-shell)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                outline: 'none'
              }}
              required
              id="staff-fullname-input"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6
              }}
            >
              Login Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="field-icon" />
              <input
                type="email"
                placeholder="chloe@apexdentalnyc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-shell)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
                required
                id="staff-email-input"
              />
            </div>
          </div>

          {/* Title & Phone Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6
                }}
              >
                Role Title
              </label>
              <input
                type="text"
                placeholder="Patient Coordinator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-shell)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
                id="staff-title-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6
                }}
              >
                Direct Phone
              </label>
              <div className="input-with-icon">
                <Phone size={15} className="field-icon" />
                <input
                  type="text"
                  placeholder="+1 (212) 555-0188"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-shell)',
                    color: 'var(--text-main)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                  id="staff-phone-input"
                />
              </div>
            </div>
          </div>

          {/* Temporary Password */}
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6
              }}
            >
              Initial Access Password
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type="text"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-shell)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
                id="staff-password-input"
                required
              />
            </div>
          </div>

          {/* Security Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.74rem',
              color: 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={16} color="var(--primary)" />
            <span>
              Staff members inherit scoped RLS credentials and cannot alter database architecture or provision other accounts.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="clean-modal-footer" style={{ marginTop: 20, padding: 0, border: 'none', background: 'transparent' }}>
            <button type="button" className="btn-clean-secondary" onClick={onClose}>
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
