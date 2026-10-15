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
  const recordsLabel = isMedical ? 'Appointments' : 'Dispatched Jobs';

  return (
    <div
      className={`business-card ${isMedical ? 'medical' : 'service'}`}
      onClick={() => onSelect(tenant)}
      id={`business-card-${tenant.slug}`}
    >
      <div>
        {/* Top Badges */}
        <div className="card-top">
          <div className="card-badge-row">
            <span className={`industry-pill ${isMedical ? 'medical' : 'service'}`}>
              {isMedical ? (
                <>
                  <Stethoscope size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Medical Clinic
                </>
              ) : (
                <>
                  <Wrench size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Field Service
                </>
              )}
            </span>
            <span className="tier-pill">{tenant.subscription_tier}</span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => onSimulateCall(tenant, e)}
            title="Simulate an inbound emergency/booking call handled by this business's AI agent"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            id={`simulate-btn-${tenant.slug}`}
          >
            <Sparkles size={13} color="#f59e0b" />
            <span>Simulate Call</span>
          </button>
        </div>

        {/* Business Title & Tagline */}
        <h3 className="card-title">{tenant.name}</h3>
        <p className="card-tagline">
          {tenant.branding?.tagline || `${tenant.city}, ${tenant.state} • Multi-Tenant Partner`}
        </p>

        {/* Quick Numbers Bar */}
        <div className="card-metrics-row">
          <div className="sub-metric">
            <span className="sub-metric-val">
              {agent?.total_calls_handled ? agent.total_calls_handled.toLocaleString() : '1,200+'}
            </span>
            <span className="sub-metric-lbl">AI Voice Calls</span>
          </div>
          <div className="sub-metric">
            <span className="sub-metric-val">{recordsCount}</span>
            <span className="sub-metric-lbl">{recordsLabel}</span>
          </div>
          <div className="sub-metric">
            <span className="sub-metric-val">
              {tenant.business_settings?.ai_auto_booking ? 'Active' : 'Off'}
            </span>
            <span className="sub-metric-lbl">AI Auto-Dispatch</span>
          </div>
        </div>

        {/* Live AI Agent Waveform Indicator */}
        <div className="ai-status-indicator">
          <div className="ai-status-left">
            <div className="waveform-mini">
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
            </div>
            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.78rem' }}>
              {agent ? agent.name.split('&')[0] : 'Voice Assistant'}
            </span>
          </div>
          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
            {agent?.llm_model || 'gpt-4o'}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="card-location">
          <MapPin size={14} color="#64748b" />
          <span>
            {tenant.city}, {tenant.state}
          </span>
        </div>
        <div className="card-arrow-action">
          <span>Inspect Records</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};
