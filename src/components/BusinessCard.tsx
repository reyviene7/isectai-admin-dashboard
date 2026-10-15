import React from 'react';
import {
  MapPin,
  ArrowRight,
  Wrench,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import type { Tenant, AIAgent } from '../lib/types';

interface BusinessCardProps {
  tenant: Tenant;
  agent?: AIAgent;
  appointmentsCount: number;
  serviceJobsCount: number;
  onSelect: (tenant: Tenant) => void;
  onSimulateCall: (tenant: Tenant, e: React.MouseEvent) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  tenant,
  agent,
  appointmentsCount,
  serviceJobsCount,
  onSelect,
  onSimulateCall
}) => {
  const isMedical = tenant.industry === 'medical_clinic';
  const recordsCount = isMedical ? appointmentsCount : serviceJobsCount;
  const recordsLabel = isMedical ? 'Appointments' : 'Work Orders';

  return (
    <div
      className="clean-biz-card"
      onClick={() => onSelect(tenant)}
      id={`business-card-${tenant.slug}`}
    >
      <div>
        {/* Card Header */}
        <div className="biz-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="biz-avatar"
              style={{
                background: isMedical ? '#f0f9ff' : '#fffbeb',
                color: isMedical ? '#0284c7' : '#d97706'
              }}
            >
              {isMedical ? <Stethoscope size={24} /> : <Wrench size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {tenant.name}
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 2
                }}
              >
                <MapPin size={12} />
                <span>
                  {tenant.city}, {tenant.state}
                </span>
              </div>
            </div>
          </div>

          <span className={`badge-clean ${isMedical ? 'badge-medical' : 'badge-service'}`}>
            {isMedical ? 'Medical' : 'Trades'}
          </span>
        </div>

        {/* Short Tagline */}
        <p className="biz-tagline">
          {tenant.branding?.tagline || `${tenant.city} • Active Multi-Tenant Partner`}
        </p>

        {/* 3 Compact Numbers */}
        <div className="biz-stats-box">
          <div className="biz-stat-item">
            <strong>{agent?.total_calls_handled ? agent.total_calls_handled.toLocaleString() : '1,200+'}</strong>
            <span>AI Calls</span>
          </div>
          <div className="biz-stat-item">
            <strong>{recordsCount}</strong>
            <span>{recordsLabel}</span>
          </div>
          <div className="biz-stat-item">
            <strong style={{ color: '#059669' }}>98%</strong>
            <span>AI Health</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="biz-card-actions">
        <button
          className="btn-simulate-call"
          onClick={(e) => onSimulateCall(tenant, e)}
          title="Simulate an inbound emergency voice call"
          id={`simulate-btn-${tenant.slug}`}
        >
          <Sparkles size={12} />
          <span>Simulate AI Call</span>
        </button>

        <span className="view-link">
          <span>View Records</span>
          <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};
