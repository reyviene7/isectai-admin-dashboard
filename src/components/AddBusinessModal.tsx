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

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'business';
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${uniqueSuffix}`;
    onAdd({
      name: name.trim(),
      slug,
      industry,
      subscription_tier: tier,
      status: 'active',
      phone: phone.trim(),
      email: `contact@${baseSlug}.com`,
      address: '750 Broadway',
      city: city.trim(),
      state: state.trim(),
      postal_code: '10003',
      branding: {
        primary_color: industry === 'medical_clinic' ? '#0ea5e9' : '#f59e0b',
        tagline:
          tagline.trim() ||
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
    <div className="clean-modal-overlay" id="add-business-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
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
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Add New Business
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Onboard a new clinic or trade service to iSectAI
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }}
            id="close-add-modal-btn"
            title="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body with standard modal structure */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body">
            {/* Business Name */}
            <div className="modal-form-group">
              <label className="modal-label">Business Name</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Tribeca Orthopedic Surgery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                id="new-tenant-name"
              />
            </div>

            {/* Domain Industry & Tier (2-Col Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Domain Industry</label>
                <select
                  className="modal-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as BusinessIndustry)}
                  id="new-tenant-industry"
                >
                  <option value="medical_clinic">Medical Clinic</option>
                  <option value="service_business">Field Trade Service</option>
                </select>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Subscription Tier</label>
                <select
                  className="modal-select"
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

            {/* Phone Number & Location (2-Col Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Phone Number</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="+1 (212) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  id="new-tenant-phone"
                />
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Location (City, State)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="New York, NY"
                  value={`${city}, ${state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0]?.trim() || 'New York');
                    setState(parts[1]?.trim() || 'NY');
                  }}
                  id="new-tenant-location"
                />
              </div>
            </div>

            {/* Tagline */}
            <div className="modal-form-group" style={{ marginBottom: 8 }}>
              <label className="modal-label">Tagline (Optional)</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Advanced Sports Medicine & Physical Therapy"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                id="new-tenant-tagline"
              />
              <span className="modal-helper-text">
                Used by the autonomous voice agent when warmly greeting callers.
              </span>
            </div>
          </div>

          {/* Clean Modal Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} id="cancel-add-tenant-btn">
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
