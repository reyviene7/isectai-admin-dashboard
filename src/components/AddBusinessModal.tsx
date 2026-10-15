import React, { useState } from 'react';
import { X, Building2, Plus } from 'lucide-react';
import type { Tenant, BusinessIndustry, SubscriptionTier } from '../lib/types';

interface AddBusinessModalProps {
  onClose: () => void;
  onAdd: (tenant: Omit<Tenant, 'id' | 'created_at'>) => void;
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<BusinessIndustry>('medical_clinic');
  const [tier, setTier] = useState<SubscriptionTier>('growth');
  const [phone, setPhone] = useState('+1 (212) 555-0199');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [tagline, setTagline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    onAdd({
      name,
      slug,
      industry,
      subscription_tier: tier,
      status: 'active',
      phone,
      email: `contact@${slug}.com`,
      address: '750 Broadway',
      city,
      state,
      postal_code: '10003',
      branding: {
        primary_color: industry === 'medical_clinic' ? '#0ea5e9' : '#f59e0b',
        tagline:
          tagline ||
          (industry === 'medical_clinic'
            ? 'Specialty Clinical Care & Surgical Practice'
            : '24/7 Priority Field Service & Emergency Repairs')
      },
      business_settings: {
        operating_hours: '08:00 - 18:00',
        timezone: 'America/New_York',
        ai_auto_booking: true
      }
    });

    onClose();
  };

  return (
    <div className="clean-modal-overlay" onClick={onClose} id="add-business-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        {/* Header */}
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
                justifyContent: 'center'
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Add New Business
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Onboard a new clinic or trade service to iSectAI
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center' }}
            id="close-add-modal-btn"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="clean-modal-body">
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4
              }}
            >
              Business Name
            </label>
            <input
              type="text"
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
              placeholder="e.g. Tribeca Orthopedic Surgery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              id="new-tenant-name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 4
                }}
              >
                Domain Industry
              </label>
              <select
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
                value={industry}
                onChange={(e) => setIndustry(e.target.value as BusinessIndustry)}
                id="new-tenant-industry"
              >
                <option value="medical_clinic">Medical Clinic</option>
                <option value="service_business">Field Trade Service</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 4
                }}
              >
                Tier
              </label>
              <select
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
                value={tier}
                onChange={(e) => setTier(e.target.value as SubscriptionTier)}
                id="new-tenant-tier"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 4
                }}
              >
                Phone Number
              </label>
              <input
                type="text"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 4
                }}
              >
                Location
              </label>
              <input
                type="text"
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
                value={`${city}, ${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCity(parts[0]?.trim() || 'New York');
                  setState(parts[1]?.trim() || 'NY');
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 4
              }}
            >
              Tagline (Optional)
            </label>
            <input
              type="text"
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
              placeholder="e.g. Advanced Sports Medicine & Physical Therapy"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="clean-modal-footer" style={{ padding: '16px 0 0 0', marginTop: 14 }}>
            <button type="button" className="btn-clean-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" id="confirm-add-tenant-btn">
              <Plus size={15} />
              <span>Create Business</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
