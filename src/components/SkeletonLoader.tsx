import React from 'react';
import type { NavTab } from './Sidebar';

export interface SkeletonBarProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonBar: React.FC<SkeletonBarProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton-shimmer skeleton-bar ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const SkeletonMetricCards: React.FC = () => {
  return (
    <div className="skeleton-kpi-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`sk-metric-${i}`} className="skeleton-kpi-card">
          <div className="skeleton-kpi-header">
            <SkeletonBar width="36px" height="36px" borderRadius="10px" />
            <SkeletonBar width="50px" height="20px" borderRadius="12px" />
          </div>
          <SkeletonBar width="45%" height="28px" borderRadius="6px" style={{ marginTop: '12px' }} />
          <SkeletonBar width="70%" height="14px" borderRadius="4px" style={{ marginTop: '8px' }} />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="clean-table-card skeleton-table-container">
      <div className="skeleton-table-header">
        <SkeletonBar width="180px" height="22px" />
        <SkeletonBar width="100px" height="32px" borderRadius="8px" />
      </div>
      <div className="skeleton-table-body">
        {/* Table column heads */}
        <div className="skeleton-table-head-row">
          {Array.from({ length: columns }).map((_, c) => (
            <SkeletonBar key={`sk-th-${c}`} width={`${Math.max(40, 100 / columns)}%`} height="14px" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`sk-tr-${r}`} className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={`sk-td-${r}-${c}`} className="skeleton-table-cell">
                {c === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SkeletonBar width="32px" height="32px" borderRadius="50%" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '120px' }}>
                      <SkeletonBar width="100%" height="14px" />
                      <SkeletonBar width="60%" height="10px" />
                    </div>
                  </div>
                ) : c === columns - 1 ? (
                  <SkeletonBar width="60px" height="24px" borderRadius="6px" />
                ) : (
                  <SkeletonBar width="80%" height="13px" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="skeleton-table-footer">
        <SkeletonBar width="160px" height="14px" />
        <SkeletonBar width="220px" height="32px" borderRadius="8px" />
      </div>
    </div>
  );
};

export const SkeletonOverview: React.FC = () => {
  return (
    <div className="skeleton-view-wrapper">
      <SkeletonMetricCards />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
        <SkeletonBar width="220px" height="24px" />
        <div style={{ display: 'flex', gap: 8 }}>
          <SkeletonBar width="90px" height="34px" borderRadius="8px" />
          <SkeletonBar width="90px" height="34px" borderRadius="8px" />
        </div>
      </div>
      <div className="skeleton-grid-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-card-${i}`} className="skeleton-tenant-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <SkeletonBar width="40px" height="40px" borderRadius="10px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SkeletonBar width="140px" height="16px" />
                  <SkeletonBar width="80px" height="12px" />
                </div>
              </div>
              <SkeletonBar width="60px" height="22px" borderRadius="12px" />
            </div>
            <SkeletonBar width="100%" height="40px" borderRadius="8px" style={{ marginTop: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <SkeletonBar width="90px" height="14px" />
              <SkeletonBar width="70px" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonAppointments: React.FC = () => {
  return (
    <div className="skeleton-view-wrapper">
      <div className="calendar-layout-grid">
        {/* Left Mini Calendar Skeleton */}
        <div className="mini-calendar-card" style={{ gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBar width="130px" height="20px" />
            <div style={{ display: 'flex', gap: 6 }}>
              <SkeletonBar width="28px" height="28px" borderRadius="6px" />
              <SkeletonBar width="28px" height="28px" borderRadius="6px" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {Array.from({ length: 35 }).map((_, i) => (
              <SkeletonBar key={`sk-cal-day-${i}`} width="100%" height="32px" borderRadius="6px" />
            ))}
          </div>
        </div>

        {/* Right Slots & Timeline Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-shell)', padding: '14px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <SkeletonBar width="180px" height="22px" />
            <SkeletonBar width="120px" height="34px" borderRadius="8px" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-slot-${i}`} style={{ background: 'var(--bg-shell)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SkeletonBar width="70px" height="24px" borderRadius="6px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SkeletonBar width="160px" height="16px" />
                  <SkeletonBar width="110px" height="12px" />
                </div>
              </div>
              <SkeletonBar width="80px" height="26px" borderRadius="6px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonDispatches: React.FC = () => {
  return (
    <div className="skeleton-view-wrapper">
      <SkeletonMetricCards />
      <SkeletonTable rows={6} columns={6} />
    </div>
  );
};

export const SkeletonTelemetry: React.FC = () => {
  return (
    <div className="skeleton-view-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`sk-telemetry-${i}`}
          style={{
            background: 'var(--bg-shell)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <SkeletonBar width="32px" height="32px" borderRadius="50%" />
              <SkeletonBar width="140px" height="16px" />
              <SkeletonBar width="80px" height="20px" borderRadius="10px" />
            </div>
            <SkeletonBar width="90px" height="14px" />
          </div>
          <SkeletonBar width="90%" height="14px" />
          <SkeletonBar width="70%" height="14px" />
          <SkeletonBar width="100%" height="38px" borderRadius="6px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonStaff: React.FC = () => {
  return (
    <div className="skeleton-view-wrapper">
      <SkeletonMetricCards />
      <SkeletonTable rows={6} columns={7} />
    </div>
  );
};

export const SkeletonView: React.FC<{ activeTab: NavTab }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'appointments':
      return <SkeletonAppointments />;
    case 'dispatches':
      return <SkeletonDispatches />;
    case 'telemetry':
      return <SkeletonTelemetry />;
    case 'staff':
      return <SkeletonStaff />;
    case 'overview':
    default:
      return <SkeletonOverview />;
  }
};
