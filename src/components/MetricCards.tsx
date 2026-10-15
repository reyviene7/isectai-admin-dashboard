import React from 'react';
import { Building2, PhoneCall, CalendarCheck, Zap, TrendingUp } from 'lucide-react';
import type { DashboardMetrics } from '../lib/types';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="metrics-grid" id="kpi-metrics-grid">
      {/* 1. Managed Businesses */}
      <div className="glass-panel metric-card" id="metric-businesses">
        <div className="metric-top">
          <span className="metric-label">Managed Tenants</span>
          <div className="metric-icon-wrap" style={{ color: '#6366f1' }}>
            <Building2 size={20} />
          </div>
        </div>
        <div className="metric-val">{metrics.totalBusinesses}</div>
        <div className="metric-footer">
          <span className="metric-trend-up">
            <TrendingUp size={14} /> 100%
          </span>
          <span>
            {metrics.activeMedicalClinics} Medical • {metrics.activeServiceBusinesses} Service
          </span>
        </div>
      </div>

      {/* 2. Total AI Calls Handled */}
      <div className="glass-panel metric-card" id="metric-ai-calls">
        <div className="metric-top">
          <span className="metric-label">AI Voice Inbound Calls</span>
          <div className="metric-icon-wrap" style={{ color: '#06b6d4' }}>
            <PhoneCall size={20} />
          </div>
        </div>
        <div className="metric-val">{metrics.totalAiCalls.toLocaleString()}</div>
        <div className="metric-footer">
          <span className="metric-trend-up">
            <TrendingUp size={14} /> +24%
          </span>
          <span>Across all platform AI agents</span>
        </div>
      </div>

      {/* 3. Operational Records */}
      <div className="glass-panel metric-card" id="metric-records">
        <div className="metric-top">
          <span className="metric-label">Active Records</span>
          <div className="metric-icon-wrap" style={{ color: '#10b981' }}>
            <CalendarCheck size={20} />
          </div>
        </div>
        <div className="metric-val">
          {metrics.totalAppointments + metrics.totalServiceJobs}
        </div>
        <div className="metric-footer">
          <span>
            {metrics.totalAppointments} Clinical Consults • {metrics.totalServiceJobs} Field Dispatches
          </span>
        </div>
      </div>

      {/* 4. AI Automation Rate */}
      <div className="glass-panel metric-card" id="metric-automation">
        <div className="metric-top">
          <span className="metric-label">AI Autonomous Rate</span>
          <div className="metric-icon-wrap" style={{ color: '#f59e0b' }}>
            <Zap size={20} />
          </div>
        </div>
        <div className="metric-val">{metrics.aiAutomationRate}%</div>
        <div className="metric-footer">
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>Auto-Dispatched</span>
          <span>Zero manual intervention</span>
        </div>
      </div>
    </div>
  );
};
