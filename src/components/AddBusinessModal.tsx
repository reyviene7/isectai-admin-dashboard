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
        tagline: tagline || (industry === 'medical_clinic' ? 'Comprehensive Specialty Care' : '24/7 Priority Field Maintenance')
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
    <div className="modal-overlay" onClick={onClose} id="add-business-modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Onboard New Business Tenant
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Add another clinic or trade service to the multi-tenant platform
              </p>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
            id="close-add-modal-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gotham Orthopedics & Sports Medicine"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              id="new-tenant-name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Industry Domain</label>
              <select
                className="form-input"
                value={industry}
                onChange={(e) => setIndustry(e.target.value as BusinessIndustry)}
                id="new-tenant-industry"
              >
                <option value="medical_clinic">Medical Clinic (Healthcare)</option>
                <option value="service_business">Field Service (Trades/HVAC/Plumbing)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subscription Tier</label>
              <select
                className="form-input"
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Phone DID</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (City, State)</label>
              <input
                type="text"
                className="form-input"
                value={`${city}, ${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCity(parts[0]?.trim() || 'New York');
                  setState(parts[1]?.trim() || 'NY');
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Marketing Tagline</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. State-of-the-Art Robotic Surgery & Physical Therapy"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '20px 0 0 0', marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="confirm-add-tenant-btn">
              <Plus size={16} />
              <span>Create Tenant & Provision AI Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
