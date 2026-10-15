import React from 'react';
import { Building2, PhoneCall, CalendarCheck, Zap } from 'lucide-react';
import type { DashboardMetrics } from '../lib/types';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="kpi-row" id="kpi-summary-cards">
      {/* 1. Managed Businesses */}
      <div className="kpi-card">
        <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <Building2 size={22} />
        </div>
        <div className="kpi-details">
          <span className="kpi-number">{metrics.totalBusinesses}</span>
          <span className="kpi-title">Active Businesses</span>
        </div>
      </div>

      {/* 2. Total AI Calls Handled */}
      <div className="kpi-card">
        <div className="kpi-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
          <PhoneCall size={22} />
        </div>
        <div className="kpi-details">
          <span className="kpi-number">{metrics.totalAiCalls.toLocaleString()}</span>
          <span className="kpi-title">AI Voice Calls</span>
        </div>
      </div>

      {/* 3. Operational Records */}
      <div className="kpi-card">
        <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
          <CalendarCheck size={22} />
        </div>
        <div className="kpi-details">
          <span className="kpi-number">{metrics.totalAppointments + metrics.totalServiceJobs}</span>
          <span className="kpi-title">Active Records</span>
        </div>
      </div>

      {/* 4. AI Autonomous Booking Rate */}
      <div className="kpi-card">
        <div className="kpi-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
          <Zap size={22} />
        </div>
        <div className="kpi-details">
          <span className="kpi-number">{metrics.aiAutomationRate}%</span>
          <span className="kpi-title">AI Auto-Dispatched</span>
        </div>
      </div>
    </div>
  );
};
