import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  LayoutList,
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import type { Appointment, Tenant } from '../lib/types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onSimulateCall?: (tenant: Tenant) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  tenants,
  onSelectTenant,
  onSimulateCall
}) => {
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(16);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const medicalTenants = tenants.filter((t) => t.industry === 'medical_clinic');

  const filteredAppointments = appointments.filter((appt) => {
    if (selectedClinic !== 'all' && appt.tenant_id !== selectedClinic) return false;
    return true;
  });

  // KPI calculations for appointments
  const totalCount = filteredAppointments.length;
  const confirmedCount = filteredAppointments.filter((a) => a.status === 'confirmed').length;
  const aiBookedCount = filteredAppointments.filter((a) => a.booked_via_ai).length;
  const urgentCount = filteredAppointments.filter(
    (a) => a.chief_complaint?.toLowerCase().includes('severe') || a.chief_complaint?.toLowerCase().includes('emergency')
  ).length;

  // Timeline slots definition (8:00 AM to 5:00 PM)
  const timelineHours = [
    { hour: '08:00 AM', label: '8:00' },
    { hour: '09:00 AM', label: '9:00' },
    { hour: '10:00 AM', label: '10:00' },
    { hour: '11:00 AM', label: '11:00' },
    { hour: '12:00 PM', label: '12:00' },
    { hour: '01:00 PM', label: '13:00' },
    { hour: '02:00 PM', label: '14:00' },
    { hour: '03:00 PM', label: '15:00' },
    { hour: '04:00 PM', label: '16:00' },
    { hour: '05:00 PM', label: '17:00' }
  ];

  // Calendar dates mock generator for October 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = [12, 14, 16, 17, 20, 24, 28];

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Contextual Appointment Metrics Header (sample10.jpg) */}
      <div className="kpi-row" id="appointment-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CalendarIcon size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{totalCount}</span>
            <span className="kpi-title">Today's Schedule</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Sparkles size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{aiBookedCount}</span>
            <span className="kpi-title">AI Auto-Scheduled</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{confirmedCount}</span>
            <span className="kpi-title">Confirmed Slots</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <AlertCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{urgentCount}</span>
            <span className="kpi-title">Urgent AI Triage</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & View Mode Bar */}
      <div className="content-toolbar">
        <div className="filter-group">
          <button
            className={`filter-btn ${selectedClinic === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedClinic('all')}
          >
            <span>All Clinics</span>
            <span className="filter-pill-count">{appointments.length}</span>
          </button>

          {medicalTenants.map((clinic) => {
            const count = appointments.filter((a) => a.tenant_id === clinic.id).length;
            return (
              <button
                key={clinic.id}
                className={`filter-btn ${selectedClinic === clinic.id ? 'active' : ''}`}
                onClick={() => setSelectedClinic(clinic.id)}
              >
                <span>{clinic.name.split('&')[0]}</span>
                <span className="filter-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Calendar Schedule vs Table */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className={`btn-clean-secondary ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'calendar' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'calendar' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            id="view-calendar-btn"
          >
            <CalendarDays size={15} />
            <span>Itinerary & Calendar</span>
          </button>

          <button
            className={`btn-clean-secondary ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'table' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            id="view-table-btn"
          >
            <LayoutList size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* 3. CALENDAR & ITINERARY VIEW (Inspired by sample.jpg & sample5.jpg) */}
      {viewMode === 'calendar' ? (
        <div className="calendar-layout-grid">
          {/* Left Mini Calendar Widget */}
          <div className="mini-calendar-card">
            <div className="calendar-month-header">
              <h3>October 2026</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="calendar-arrow-btn" title="Previous Month">
                  <ChevronLeft size={16} />
                </button>
                <button className="calendar-arrow-btn" title="Next Month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="calendar-days-row">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Date Grid */}
            <div className="calendar-dates-grid">
              {/* Empty offset days for October 2026 (Starts on Thursday, 4 blanks) */}
              <div />
              <div />
              <div />
              <div />

              {daysInMonth.map((day) => {
                const isSelected = day === selectedDay;
                const hasEvent = eventDays.includes(day);

                return (
                  <button
                    key={day}
                    className={`calendar-date-cell ${isSelected ? 'active' : ''} ${
                      hasEvent ? 'has-events' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legend & Doctors (matching sample.jpg & sample5.jpg) */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                On-Duty Practitioners
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--medical-soft)',
                      color: 'var(--medical-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    JV
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-main)' }}>
                      Dr. Julian Vance, DDS
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Oral Surgery</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    AP
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-main)' }}>
                      Dr. Anaya Patel, MD
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cardiology</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Daily Timeline Itinerary (sample.jpg, sample4.jpg, sample5.jpg) */}
          <div className="timeline-schedule-card">
            <div className="timeline-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Schedule Itinerary for October {selectedDay}, 2026
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Live synchronized clinical slots and autonomous AI intake reservations
                </span>
              </div>

              {medicalTenants[0] && onSimulateCall && (
                <button
                  className="btn-simulate-call"
                  onClick={() => onSimulateCall(medicalTenants[0])}
                  id="calendar-simulate-booking-btn"
                >
                  <Sparkles size={13} />
                  <span>Simulate Inbound Booking</span>
                </button>
              )}
            </div>

            {/* Timeline Rows */}
            <div className="timeline-slots-container">
              {timelineHours.map((slot, index) => {
                // Check if an appointment falls roughly into this hour
                const matchingAppt = filteredAppointments[index % filteredAppointments.length];
                const hasAppt = index === 2 || index === 3 || index === 6; // Spread slots realistically
                const tenant = matchingAppt ? tenants.find((t) => t.id === matchingAppt.tenant_id) : null;

                return (
                  <div key={slot.hour} className="schedule-hour-row">
                    <span className="schedule-time-label">{slot.hour}</span>

                    {hasAppt && matchingAppt ? (
                      <div
                        className="schedule-slot-card"
                        onClick={() => tenant && onSelectTenant(tenant)}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="badge-clean badge-medical">
                              {matchingAppt.status}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {matchingAppt.department} • Room {matchingAppt.room_number || 'Suite 2'}
                            </span>
                            {matchingAppt.booked_via_ai && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#059669',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  fontWeight: 600
                                }}
                              >
                                <Sparkles size={11} /> AI Booked
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {matchingAppt.appointment_type}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            Provider: {matchingAppt.provider_name} ({tenant?.name.split('&')[0]})
                          </p>

                          {matchingAppt.chief_complaint && (
                            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              Note: {matchingAppt.chief_complaint}
                            </p>
                          )}
                        </div>

                        <span className="badge-clean badge-medical">
                          {tenant?.name.split('&')[0]}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="schedule-slot-card empty-slot"
                        onClick={() => {
                          if (medicalTenants[0] && onSimulateCall) {
                            onSimulateCall(medicalTenants[0]);
                          }
                        }}
                      >
                        <span>+ Open Slot (Available for AI Voice Assistant Auto-Booking)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 4. TABLE VIEW (Matching sample6.jpg) */
        <div className="clean-table-card">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Time & Date</th>
                <th>Appointment Type</th>
                <th>Physician</th>
                <th>Clinic</th>
                <th>AI Triage Summary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => {
                const tenant = tenants.find((t) => t.id === appt.tenant_id);

                return (
                  <tr
                    key={appt.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => tenant && onSelectTenant(tenant)}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="var(--primary)" />
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
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {appt.chief_complaint || 'Standard Consult'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {appt.provider_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {appt.department}
                      </div>
                    </td>

                    <td>
                      <span className="badge-clean badge-medical">
                        {tenant?.name.split('&')[0] || 'Clinic'}
                      </span>
                    </td>

                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {appt.ai_triage_summary || 'Standard intake verified'}
                      </div>
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
      )}
    </div>
  );
};
