import React, { useState } from 'react';
import { Wrench, MapPin, AlertTriangle, CheckCircle, DollarSign, LayoutList, LayoutGrid } from 'lucide-react';
import type { ServiceJob, Tenant } from '../lib/types';

interface DispatchesViewProps {
  serviceJobs: ServiceJob[];
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
}

export const DispatchesView: React.FC<DispatchesViewProps> = ({
  serviceJobs,
  tenants,
  onSelectTenant
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredJobs = serviceJobs.filter((job) => {
    if (filterPriority !== 'all' && job.priority !== filterPriority) return false;
    return true;
  });

  const totalRevenue = serviceJobs.reduce((acc, j) => acc + (j.estimated_cost || 0), 0);
  const emergencyCount = serviceJobs.filter((j) => j.priority === 'emergency').length;
  const completedCount = serviceJobs.filter((j) => j.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Contextual Field Service KPIs */}
      <div className="kpi-row" id="dispatch-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Wrench size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{serviceJobs.length}</span>
            <span className="kpi-title">Total Work Orders</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{emergencyCount}</span>
            <span className="kpi-title">Emergency Code 1</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{completedCount}</span>
            <span className="kpi-title">Completed & Invoiced</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <DollarSign size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">${totalRevenue.toLocaleString()}</span>
            <span className="kpi-title">Gross Volume</span>
          </div>
        </div>
      </div>

      {/* Filter and View mode Toolbar */}
      <div className="content-toolbar">
        <div className="filter-group">
          <button
            className={`filter-btn ${filterPriority === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPriority('all')}
          >
            <span>All Dispatches</span>
            <span className="filter-pill-count">{serviceJobs.length}</span>
          </button>

          <button
            className={`filter-btn ${filterPriority === 'emergency' ? 'active' : ''}`}
            onClick={() => setFilterPriority('emergency')}
          >
            <AlertTriangle size={13} color="#e11d48" />
            <span>Emergency Only</span>
            <span className="filter-pill-count">{emergencyCount}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className={`btn-clean-secondary ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'table' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <LayoutList size={15} />
            <span>Table</span>
          </button>

          <button
            className={`btn-clean-secondary ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'cards' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Render View */}
      {viewMode === 'table' ? (
        <div className="clean-table-card">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Work Order Description</th>
                <th>Technician</th>
                <th>Location</th>
                <th>Estimate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const tenant = tenants.find((t) => t.id === job.tenant_id);

                return (
                  <tr
                    key={job.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => tenant && onSelectTenant(tenant)}
                  >
                    <td>
                      <span
                        className={`badge-clean ${
                          job.priority === 'emergency' ? 'badge-danger' : 'badge-service'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {job.service_type}
                      </div>
                      {job.ai_intake_notes && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            maxWidth: 320,
                            lineHeight: 1.3
                          }}
                        >
                          {job.ai_intake_notes}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {job.technician_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {tenant?.name.split(',')[0]}
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <MapPin size={13} color="var(--text-muted)" />
                        <span>{job.dispatch_address.split(',')[0]}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>
                        ${job.estimated_cost?.toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge-clean ${
                          job.status === 'completed'
                            ? 'badge-success'
                            : job.status === 'in_progress'
                            ? 'badge-danger'
                            : 'badge-clean'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="business-grid">
          {filteredJobs.map((job) => {
            const tenant = tenants.find((t) => t.id === job.tenant_id);

            return (
              <div
                key={job.id}
                className="clean-biz-card"
                onClick={() => tenant && onSelectTenant(tenant)}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8
                    }}
                  >
                    <span
                      className={`badge-clean ${
                        job.priority === 'emergency' ? 'badge-danger' : 'badge-service'
                      }`}
                    >
                      {job.priority} Priority
                    </span>
                    <strong style={{ color: '#059669', fontSize: '1rem' }}>
                      ${job.estimated_cost?.toFixed(2)}
                    </strong>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {job.service_type}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Assigned: {job.technician_name}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: 6
                    }}
                  >
                    <MapPin size={12} />
                    <span>{job.dispatch_address}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span className="badge-clean badge-medical">
                    {tenant?.name.split(',')[0]}
                  </span>
                  <span className="view-link">
                    <span>Manage Dispatch</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
