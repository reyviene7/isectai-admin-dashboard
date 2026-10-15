import React from 'react';
import { MapPin } from 'lucide-react';
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="clean-table-card">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Service / Work Order</th>
              <th>Assigned Technician</th>
              <th>Dispatch Location</th>
              <th>Estimate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {serviceJobs.map((job) => {
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
    </div>
  );
};
