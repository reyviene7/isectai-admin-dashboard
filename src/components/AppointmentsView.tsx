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

  const totalCount = filteredAppointments.length;
  const confirmedCount = filteredAppointments.filter((a) => a.status === 'confirmed').length;
  const aiBookedCount = filteredAppointments.filter((a) => a.booked_via_ai).length;
  const urgentCount = filteredAppointments.filter(
    (a) =>
      a.chief_complaint?.toLowerCase().includes('severe') ||
      a.chief_complaint?.toLowerCase().includes('emergency')
  ).length;

  const timelineHours = [
    { hour: '08:00 AM' },
    { hour: '09:00 AM' },
    { hour: '10:00 AM' },
    { hour: '11:00 AM' },
    { hour: '12:00 PM' },
    { hour: '01:00 PM' },
    { hour: '02:00 PM' },
    { hour: '03:00 PM' },
    { hour: '04:00 PM' },
    { hour: '05:00 PM' }
  ];

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = [12, 14, 16, 17, 20, 24, 28];

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', minWidth: 0 }}>
      {/* 1. Contextual Appointment Metrics Header */}
      <div className="kpi-row" id="appointment-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <CalendarIcon size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{totalCount}</span>
            <span className="kpi-title">Today's Slots</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Sparkles size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{aiBookedCount}</span>
            <span className="kpi-title">AI Scheduled</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{confirmedCount}</span>
            <span className="kpi-title">Confirmed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <AlertCircle size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{urgentCount}</span>
            <span className="kpi-title">Urgent Triage</span>
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

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
            <CalendarDays size={14} />
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
            <LayoutList size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* 3. CALENDAR & ITINERARY VIEW */}
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

            {/* Practitioners */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                On-Duty Doctors
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--medical-soft)',
                      color: 'var(--medical-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    JV
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <strong style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      Dr. Julian Vance, DDS
                    </strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Oral Surgery</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    AP
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <strong style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      Dr. Anaya Patel, MD
                    </strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cardiology</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Daily Timeline Itinerary */}
          <div className="timeline-schedule-card">
            <div className="timeline-header">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3>October {selectedDay}, 2026 Itinerary</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Clinical schedule & AI intake slots
                </span>
              </div>

              {medicalTenants[0] && onSimulateCall && (
                <button
                  className="btn-simulate-call"
                  onClick={() => onSimulateCall(medicalTenants[0])}
                  id="calendar-simulate-booking-btn"
                >
                  <Sparkles size={12} />
                  <span>Simulate Booking</span>
                </button>
              )}
            </div>

            {/* Timeline Rows */}
            <div className="timeline-slots-container">
              {timelineHours.map((slot, index) => {
                const matchingAppt = filteredAppointments[index % filteredAppointments.length];
                const hasAppt = index === 2 || index === 3 || index === 6;
                const tenant = matchingAppt ? tenants.find((t) => t.id === matchingAppt.tenant_id) : null;

                return (
                  <div key={slot.hour} className="schedule-hour-row">
                    <span className="schedule-time-label">{slot.hour}</span>

                    {hasAppt && matchingAppt ? (
                      <div
                        className="schedule-slot-card"
                        onClick={() => tenant && onSelectTenant(tenant)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge-clean badge-medical">
                            {matchingAppt.status}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {matchingAppt.department} • Room {matchingAppt.room_number || '2'}
                          </span>
                          {matchingAppt.booked_via_ai && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                color: '#059669',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 600
                              }}
                            >
                              <Sparkles size={11} /> AI Booked
                            </span>
                          )}
                        </div>

                        <h4
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            wordBreak: 'break-word',
                            lineHeight: 1.3
                          }}
                        >
                          {matchingAppt.appointment_type}
                        </h4>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 6
                          }}
                        >
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Provider: {matchingAppt.provider_name}
                          </span>
                          <span className="badge-clean badge-medical">
                            {tenant?.name.split('&')[0]}
                          </span>
                        </div>
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
                        <span>+ Open Slot (Tap to Auto-Book with AI)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 4. TABLE VIEW */
        <div className="clean-table-card">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Time & Date</th>
                <th>Appointment Type</th>
                <th>Physician</th>
                <th>Clinic</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} color="var(--primary)" />
                        <span>
                          {new Date(appt.scheduled_start).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {appt.chief_complaint || 'Standard Consult'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {appt.provider_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {appt.department}
                      </div>
                    </td>

                    <td>
                      <span className="badge-clean badge-medical">
                        {tenant?.name.split('&')[0] || 'Clinic'}
                      </span>
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
