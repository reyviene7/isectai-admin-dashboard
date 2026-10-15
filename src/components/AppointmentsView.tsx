import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import type { Appointment, Tenant } from '../lib/types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  tenants,
  onSelectTenant
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Cards matching sample.jpg */}
      <div className="clean-table-card">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient / Reason</th>
              <th>Treating Physician</th>
              <th>Clinic</th>
              <th>AI Triage Assessment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const tenant = tenants.find((t) => t.id === appt.tenant_id);

              return (
                <tr
                  key={appt.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => tenant && onSelectTenant(tenant)}
                >
                  <td style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="var(--primary)" />
                      <span>
                        {new Date(appt.scheduled_start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(appt.scheduled_start).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {appt.appointment_type}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {appt.chief_complaint || 'General Consultation'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {appt.provider_name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {appt.department}
                    </div>
                  </td>

                  <td>
                    <span className="badge-clean badge-medical">
                      {tenant?.name.split('&')[0] || 'Clinic'}
                    </span>
                  </td>

                  <td style={{ maxWidth: 260 }}>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.3
                      }}
                    >
                      {appt.ai_triage_summary || 'Standard triage flow'}
                    </div>
                    {appt.booked_via_ai && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#059669',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          marginTop: 3
                        }}
                      >
                        <Sparkles size={11} /> AI Auto-Booked
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge-clean ${
                        appt.status === 'confirmed'
                          ? 'badge-success'
                          : appt.status === 'scheduled'
                          ? 'badge-medical'
                          : 'badge-clean'
                      }`}
                    >
                      {appt.status}
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
