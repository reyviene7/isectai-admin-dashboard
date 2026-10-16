import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  LayoutList,
  CalendarDays,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Stethoscope,
  Building2,
  Search,
  User,
  RotateCcw
} from 'lucide-react';
import type { Appointment, Tenant } from '../lib/types';
import { Pagination } from './Pagination';
import { StatusPicker, APPOINTMENT_STATUS_OPTIONS } from './StatusPicker';

interface AppointmentsViewProps {
  appointments: Appointment[];
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onSimulateCall?: (tenant: Tenant) => void;
  onAddAppointment?: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  onUpdateAppointment?: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDeleteAppointment?: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  searchQuery?: string;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  tenants,
  onSelectTenant,
  onSimulateCall,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onRefresh,
  searchQuery = ''
}) => {
  // 1. Navigation & Filter States
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  
  // Dynamic Month & Year Navigation state (defaults to October 2026 to match seed context)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    return new Date(2026, 9, 1); // October 2026
  });

  // Selected Day state (defaults to October 16, 2026)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return new Date(2026, 9, 16);
  });

  // Scope: 'selected_day' filters timeline to clicked day; 'all' shows all dates
  const [dateFilterScope, setDateFilterScope] = useState<'selected_day' | 'all'>('selected_day');
  const [historyTab, setHistoryTab] = useState<'all' | 'past' | 'upcoming'>('all');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'history' | 'table'>('calendar');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string>('2026-10-16');
  const [addModalTime, setAddModalTime] = useState<string>('09:00');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  // Pagination states for all three views
  const [allApptsPage, setAllApptsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [directoryPage, setDirectoryPage] = useState(1);
  const allApptsPageSize = 6;
  const historyPageSize = 6;
  const directoryPageSize = 8;

  useEffect(() => {
    setAllApptsPage(1);
    setHistoryPage(1);
    setDirectoryPage(1);
  }, [selectedClinic, historyTab, historySearch, searchQuery]);

  const medicalTenants = tenants.filter((t) => t.industry === 'medical_clinic');

  // Helpers for robust date calculations
  const parseApptDate = (dateStr: string): Date => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const isSameCalendarDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const toDateInputString = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDisplayTime = (dateStr: string): string => {
    try {
      const d = parseApptDate(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '10:00 AM';
    }
  };

  const formatDisplayDate = (dateStr: string): string => {
    try {
      const d = parseApptDate(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Oct 16, 2026';
    }
  };

  // Base clinic and search filter
  const filteredAppointments = appointments.filter((appt) => {
    if (selectedClinic !== 'all' && appt.tenant_id !== selectedClinic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tenant = tenants.find((t) => t.id === appt.tenant_id);
      const matchType = appt.appointment_type.toLowerCase().includes(q);
      const matchDoctor = appt.provider_name.toLowerCase().includes(q);
      const matchDept = appt.department.toLowerCase().includes(q);
      const matchStatus = appt.status.toLowerCase().includes(q);
      const matchComplaint = appt.chief_complaint?.toLowerCase().includes(q) ?? false;
      const matchAiTriage = appt.ai_triage_summary?.toLowerCase().includes(q) ?? false;
      const matchRoom = appt.room_number?.toLowerCase().includes(q) ?? false;
      const matchTenant = tenant?.name.toLowerCase().includes(q) ?? false;
      return (
        matchType ||
        matchDoctor ||
        matchDept ||
        matchStatus ||
        matchComplaint ||
        matchAiTriage ||
        matchRoom ||
        matchTenant
      );
    }
    return true;
  });

  // KPI Metrics
  const totalCount = filteredAppointments.length;
  const confirmedCount = filteredAppointments.filter((a) => a.status === 'confirmed').length;
  const aiBookedCount = filteredAppointments.filter((a) => a.booked_via_ai).length;
  const urgentCount = filteredAppointments.filter(
    (a) =>
      a.chief_complaint?.toLowerCase().includes('severe') ||
      a.chief_complaint?.toLowerCase().includes('emergency')
  ).length;

  // Timeline slots definition (8:00 AM to 5:00 PM)
  const timelineHours = [
    { label: '08:00 AM', hour24: 8, timeStr: '08:00' },
    { label: '09:00 AM', hour24: 9, timeStr: '09:00' },
    { label: '10:00 AM', hour24: 10, timeStr: '10:00' },
    { label: '11:00 AM', hour24: 11, timeStr: '11:00' },
    { label: '12:00 PM', hour24: 12, timeStr: '12:00' },
    { label: '01:00 PM', hour24: 13, timeStr: '13:00' },
    { label: '02:00 PM', hour24: 14, timeStr: '14:00' },
    { label: '03:00 PM', hour24: 15, timeStr: '15:00' },
    { label: '04:00 PM', hour24: 16, timeStr: '16:00' },
    { label: '05:00 PM', hour24: 17, timeStr: '17:00' }
  ];

  // Calendar dynamic calculation for currentMonthDate
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sunday
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date(2026, 9, 16);
    setCurrentMonthDate(new Date(2026, 9, 1));
    setSelectedDate(today);
    setDateFilterScope('selected_day');
  };

  // Day selection handler
  const handleDayClick = (dayNumber: number) => {
    const newSelected = new Date(currentYear, currentMonth, dayNumber);
    setSelectedDate(newSelected);
    setDateFilterScope('selected_day');
  };

  // Check if a calendar day has appointments scheduled
  const hasAppointmentsOnDay = (dayNumber: number): boolean => {
    const dayDate = new Date(currentYear, currentMonth, dayNumber);
    return filteredAppointments.some((a) => isSameCalendarDay(parseApptDate(a.scheduled_start), dayDate));
  };

  // Count appointments on a given day
  const getDayAppointmentsCount = (dayNumber: number): number => {
    const dayDate = new Date(currentYear, currentMonth, dayNumber);
    return filteredAppointments.filter((a) => isSameCalendarDay(parseApptDate(a.scheduled_start), dayDate)).length;
  };

  // Filtered by selected day
  const selectedDayAppointments = filteredAppointments.filter((appt) =>
    isSameCalendarDay(parseApptDate(appt.scheduled_start), selectedDate)
  );

  // Categorize past and upcoming appointments relative to reference date (Oct 16, 2026 12:00)
  const nowRefTime = new Date('2026-10-16T12:00:00Z').getTime();

  const pastAppointments = filteredAppointments.filter((a) => {
    return parseApptDate(a.scheduled_start).getTime() < nowRefTime || a.status === 'completed';
  });

  const upcomingAppointments = filteredAppointments.filter((a) => {
    return parseApptDate(a.scheduled_start).getTime() >= nowRefTime && a.status !== 'completed';
  });

  // History list items based on active tab and search
  const historyAppointments = filteredAppointments.filter((a) => {
    if (historyTab === 'past') {
      const isPast = parseApptDate(a.scheduled_start).getTime() < nowRefTime || a.status === 'completed';
      if (!isPast) return false;
    } else if (historyTab === 'upcoming') {
      const isUpcoming = parseApptDate(a.scheduled_start).getTime() >= nowRefTime && a.status !== 'completed';
      if (!isUpcoming) return false;
    }

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      const matchType = a.appointment_type.toLowerCase().includes(q);
      const matchDoctor = a.provider_name.toLowerCase().includes(q);
      const matchDept = a.department.toLowerCase().includes(q);
      const matchComplaint = a.chief_complaint?.toLowerCase().includes(q) ?? false;
      return matchType || matchDoctor || matchDept || matchComplaint;
    }
    return true;
  });

  // Paginated slices for responsive performance
  const totalAllApptsPages = Math.max(1, Math.ceil(filteredAppointments.length / allApptsPageSize));
  const paginatedAllAppointments = filteredAppointments.slice(
    (allApptsPage - 1) * allApptsPageSize,
    allApptsPage * allApptsPageSize
  );

  const totalHistoryPages = Math.max(1, Math.ceil(historyAppointments.length / historyPageSize));
  const paginatedHistoryAppointments = historyAppointments.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize
  );

  const totalDirectoryPages = Math.max(1, Math.ceil(filteredAppointments.length / directoryPageSize));
  const paginatedDirectoryAppointments = filteredAppointments.slice(
    (directoryPage - 1) * directoryPageSize,
    directoryPage * directoryPageSize
  );

  // Open Add Modal for specific slot
  const handleOpenAddForSlot = (hourStr?: string) => {
    setAddModalDate(toDateInputString(selectedDate));
    setAddModalTime(hourStr || '09:00');
    setIsAddModalOpen(true);
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
            <span className="kpi-title">Total Bookings</span>
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
            <span className="kpi-title">Confirmed Visits</span>
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

        {/* Right-aligned Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
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
              className={`btn-clean-secondary ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'history' ? 'var(--primary-soft)' : 'var(--bg-shell)',
                color: viewMode === 'history' ? 'var(--primary)' : 'var(--text-secondary)'
              }}
              id="view-history-btn"
            >
              <Clock size={14} />
              <span>Schedule History & Past</span>
              <span className="filter-pill-count" style={{ marginLeft: 4 }}>
                {pastAppointments.length}
              </span>
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

          {/* Separator Divider */}
          <div
            style={{
              width: 1,
              height: 22,
              background: 'var(--border-light)',
              margin: '0 2px'
            }}
          />

          {/* Action Buttons: Sync & Book Appointment (Separated at the right side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onRefresh && (
              <button
                className="btn-clean-secondary"
                onClick={() => onRefresh()}
                title="Refresh live schedule from Supabase"
                id="refresh-appointments-btn"
                style={{ padding: '6px 12px' }}
              >
                <RotateCcw size={13} />
                <span>Sync</span>
              </button>
            )}

            <button
              className="btn-clean-primary"
              onClick={() => handleOpenAddForSlot()}
              id="book-new-appointment-btn"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>+ Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CALENDAR & ITINERARY VIEW */}
      {viewMode === 'calendar' && (
        <div className="calendar-layout-grid">
          {/* Left Mini Calendar Widget */}
          <div className="mini-calendar-card">
            {/* Header with Functional Next/Previous and Today */}
            <div className="calendar-month-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3>{monthName}</h3>
                <button
                  className="calendar-today-btn"
                  onClick={handleJumpToToday}
                  title="Jump to Today"
                >
                  Today
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="calendar-arrow-btn"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  id="calendar-prev-month-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="calendar-arrow-btn"
                  onClick={handleNextMonth}
                  title="Next Month"
                  id="calendar-next-month-btn"
                >
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

            {/* Dynamic Date Grid */}
            <div className="calendar-dates-grid">
              {/* Blank offset cells for accurate day-of-week alignment */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`blank-${idx}`} style={{ aspectRatio: 1 }} />
              ))}

              {/* Day cells with accurate event indicators */}
              {daysArray.map((day) => {
                const thisDate = new Date(currentYear, currentMonth, day);
                const isSelected = dateFilterScope === 'selected_day' && isSameCalendarDay(thisDate, selectedDate);
                const hasEvent = hasAppointmentsOnDay(day);
                const apptCount = getDayAppointmentsCount(day);

                return (
                  <button
                    key={day}
                    className={`calendar-date-cell ${isSelected ? 'active' : ''} ${
                      hasEvent ? 'has-events' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                    title={`${apptCount} appointment(s) on ${thisDate.toLocaleDateString()}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Calendar Quick Status Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span>
                Selected: <strong>{selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong>
              </span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {selectedDayAppointments.length} slot(s)
              </span>
            </div>

            {/* Practitioners Roster */}
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
                    ER
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <strong style={{ fontSize: '0.78rem', display: 'block', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      Dr. Elena Reed, DMD
                    </strong>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Orthodontics</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--warning-soft)',
                      color: 'var(--warning-color)',
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

          {/* Right Daily Timeline Itinerary & Schedule History Explorer */}
          <div className="timeline-schedule-card">
            {/* Timeline Header */}
            <div className="timeline-header">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h3>
                    {dateFilterScope === 'selected_day'
                      ? `${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} Schedule`
                      : 'All Scheduled Appointments'}
                  </h3>
                  {dateFilterScope === 'selected_day' && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}
                    >
                      {selectedDayAppointments.length} today
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Clinical schedule, automated AI intake, and past appointments
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {medicalTenants[0] && onSimulateCall && (
                  <button
                    className="btn-simulate-call"
                    onClick={() => onSimulateCall(medicalTenants[0])}
                    id="calendar-simulate-booking-btn"
                  >
                    <Sparkles size={12} />
                    <span>Simulate Inbound Call</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scope Filter Bar (Allows viewing Selected Day vs All Dates vs Past) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Scope:
                </span>

                <button
                  className={`appt-scope-pill ${dateFilterScope === 'selected_day' ? 'active' : ''}`}
                  onClick={() => setDateFilterScope('selected_day')}
                >
                  <CalendarDays size={13} />
                  <span>
                    Selected Day ({selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}):{' '}
                    <strong>{selectedDayAppointments.length}</strong>
                  </span>
                </button>

                <button
                  className={`appt-scope-pill ${dateFilterScope === 'all' ? 'active' : ''}`}
                  onClick={() => setDateFilterScope('all')}
                >
                  <LayoutList size={13} />
                  <span>
                    All Dates: <strong>{filteredAppointments.length}</strong>
                  </span>
                </button>

                <button
                  className="appt-scope-pill"
                  onClick={() => {
                    setDateFilterScope('all');
                    setHistoryTab('past');
                  }}
                >
                  <Clock size={13} />
                  <span>
                    Past Made Appointments: <strong>{pastAppointments.length}</strong>
                  </span>
                </button>
              </div>

              {dateFilterScope === 'selected_day' && (
                <button
                  className="appt-action-btn"
                  onClick={() => setDateFilterScope('all')}
                  style={{ fontSize: '0.72rem' }}
                >
                  <span>Show All Dates ({filteredAppointments.length})</span>
                </button>
              )}
            </div>

            {/* Daily Timeline Slots */}
            {dateFilterScope === 'selected_day' ? (
              <div className="timeline-slots-container">
                {timelineHours.map((slot) => {
                  // Find all appointments on selectedDate starting at this slot's hour
                  const matchingAppts = selectedDayAppointments.filter((a) => {
                    const start = parseApptDate(a.scheduled_start);
                    return start.getHours() === slot.hour24;
                  });

                  return (
                    <div key={slot.label} className="schedule-hour-row">
                      <span className="schedule-time-label">{slot.label}</span>

                      {matchingAppts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minWidth: 0 }}>
                          {matchingAppts.map((matchingAppt) => {
                            const tenant = tenants.find((t) => t.id === matchingAppt.tenant_id);

                            return (
                              <div
                                key={matchingAppt.id}
                                className="schedule-slot-card"
                                style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}
                                onClick={() => setEditingAppointment(matchingAppt)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <StatusPicker
                                      value={matchingAppt.status}
                                      options={APPOINTMENT_STATUS_OPTIONS}
                                      onChange={(newStatus) => {
                                        if (onUpdateAppointment) {
                                          onUpdateAppointment(matchingAppt.id, { status: newStatus });
                                        }
                                      }}
                                    />
                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                      {matchingAppt.department} • Room {matchingAppt.room_number || '1'}
                                    </span>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                      {formatDisplayTime(matchingAppt.scheduled_start)} - {formatDisplayTime(matchingAppt.scheduled_end)}
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

                                  {/* CRUD Action Buttons */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <button
                                      className="appt-action-btn edit-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAppointment(matchingAppt);
                                      }}
                                      title="Edit Appointment"
                                    >
                                      <Pencil size={12} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      className="appt-action-btn delete-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingAppointment(matchingAppt);
                                      }}
                                      title="Delete Appointment"
                                    >
                                      <Trash2 size={12} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                                <h4
                                  style={{
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    color: 'var(--text-main)',
                                    wordBreak: 'break-word',
                                    lineHeight: 1.3
                                  }}
                                >
                                  {matchingAppt.appointment_type}
                                </h4>

                                {matchingAppt.chief_complaint && (
                                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    {matchingAppt.chief_complaint}
                                  </p>
                                )}

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
                                    Provider: <strong>{matchingAppt.provider_name}</strong>
                                  </span>
                                  <span
                                    className="badge-clean badge-medical"
                                    style={{ cursor: tenant ? 'pointer' : 'default' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      tenant && onSelectTenant(tenant);
                                    }}
                                    title="View clinic details"
                                  >
                                    {tenant?.name.split('&')[0] || 'Clinic'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="schedule-slot-card empty-slot"
                          onClick={() => handleOpenAddForSlot(slot.timeStr)}
                        >
                          <span>+ Open Slot (Tap to book at {slot.label})</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Notice if selected day has 0 appointments */}
                {selectedDayAppointments.length === 0 && (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-subtle)',
                      border: '1px dashed var(--border-light)',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <CalendarIcon size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      No appointments scheduled yet for {selectedDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}.
                    </span>
                    <button
                      className="btn-clean-primary"
                      onClick={() => handleOpenAddForSlot('09:00')}
                      style={{ padding: '6px 14px', fontSize: '0.8rem', marginTop: 4 }}
                    >
                      <Plus size={14} />
                      <span>Book Slot on This Day</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* All Scheduled Appointments List View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredAppointments.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No appointments recorded.
                  </div>
                ) : (
                  <>
                    {paginatedAllAppointments.map((appt) => {
                      const tenant = tenants.find((t) => t.id === appt.tenant_id);
                      return (
                        <div
                          key={appt.id}
                          className="schedule-slot-card"
                          style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }}
                          onClick={() => setEditingAppointment(appt)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className="badge-clean badge-medical">
                                {formatDisplayDate(appt.scheduled_start)} • {formatDisplayTime(appt.scheduled_start)}
                              </span>
                              <StatusPicker
                                value={appt.status}
                                options={APPOINTMENT_STATUS_OPTIONS}
                                onChange={(newStatus) => {
                                  if (onUpdateAppointment) {
                                    onUpdateAppointment(appt.id, { status: newStatus });
                                  }
                                }}
                              />
                              {appt.booked_via_ai && (
                                <span style={{ fontSize: '0.7rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                                  <Sparkles size={11} /> AI Booked
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                className="appt-action-btn edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAppointment(appt);
                                }}
                                title="Edit Appointment"
                              >
                                <Pencil size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                className="appt-action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingAppointment(appt);
                                }}
                                title="Delete Appointment"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                            {appt.appointment_type}
                          </h4>

                          {appt.chief_complaint && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                              {appt.chief_complaint}
                            </p>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              Provider: <strong>{appt.provider_name}</strong> ({appt.department})
                            </span>
                            <span
                              className="badge-clean badge-medical"
                              style={{ cursor: tenant ? 'pointer' : 'default' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                tenant && onSelectTenant(tenant);
                              }}
                              title="View clinic details"
                            >
                              {tenant?.name.split('&')[0] || 'Clinic'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <Pagination
                      currentPage={allApptsPage}
                      totalPages={totalAllApptsPages}
                      totalItems={filteredAppointments.length}
                      pageSize={allApptsPageSize}
                      onPageChange={setAllApptsPage}
                      itemLabel="appointments"
                      isStandalone={true}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SEPARATED SCHEDULE HISTORY & PAST MADE APPOINTMENTS VIEW */}
      {viewMode === 'history' && (
        <div className="clean-table-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Schedule History & Past Made Appointments
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Dedicated overview of completed visits, past encounters, and future bookings
              </p>
            </div>

            {/* Sub-Tabs: All vs Past Only vs Upcoming */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <button
                className={`appt-scope-pill ${historyTab === 'all' ? 'active' : ''}`}
                onClick={() => setHistoryTab('all')}
              >
                <span>All ({filteredAppointments.length})</span>
              </button>
              <button
                className={`appt-scope-pill ${historyTab === 'past' ? 'active' : ''}`}
                onClick={() => setHistoryTab('past')}
              >
                <span>Past Made ({pastAppointments.length})</span>
              </button>
              <button
                className={`appt-scope-pill ${historyTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setHistoryTab('upcoming')}
              >
                <span>Upcoming ({upcomingAppointments.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter past & upcoming appointments by provider, type, or notes..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-shell)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* History Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {historyAppointments.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No appointments match the selected filter.
              </div>
            ) : (
              <>
                {paginatedHistoryAppointments.map((appt) => {
                  const tenant = tenants.find((t) => t.id === appt.tenant_id);
                  const isPast = parseApptDate(appt.scheduled_start).getTime() < nowRefTime || appt.status === 'completed';

                  return (
                    <div
                      key={`history-${appt.id}`}
                      className="schedule-slot-card"
                      style={{
                        borderLeft: isPast ? '4px solid var(--text-muted)' : '4px solid var(--primary)',
                        cursor: 'pointer',
                        background: isPast ? 'var(--bg-subtle)' : 'var(--bg-card)'
                      }}
                      onClick={() => setEditingAppointment(appt)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge-clean badge-medical" style={{ fontWeight: 600 }}>
                            {formatDisplayDate(appt.scheduled_start)} • {formatDisplayTime(appt.scheduled_start)} - {formatDisplayTime(appt.scheduled_end)}
                          </span>
                          <StatusPicker
                            value={appt.status}
                            options={APPOINTMENT_STATUS_OPTIONS}
                            onChange={(newStatus) => {
                              if (onUpdateAppointment) {
                                onUpdateAppointment(appt.id, { status: newStatus });
                              }
                            }}
                          />
                          {isPast && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 4, background: 'var(--bg-hover)', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Past Made
                            </span>
                          )}
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {appt.department} • Room {appt.room_number || '1'}
                          </span>
                          {appt.booked_via_ai && (
                            <span style={{ fontSize: '0.7rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                              <Sparkles size={11} /> AI Booked
                            </span>
                          )}
                        </div>

                        {/* CRUD Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="appt-action-btn edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAppointment(appt);
                            }}
                            title="Edit this appointment"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="appt-action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingAppointment(appt);
                            }}
                            title="Delete this appointment"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <h4
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          wordBreak: 'break-word',
                          lineHeight: 1.3,
                          margin: 0
                        }}
                      >
                        {appt.appointment_type}
                      </h4>

                      {appt.chief_complaint && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {appt.chief_complaint}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Provider: <strong>{appt.provider_name}</strong>
                        </span>
                        <span
                          className="badge-clean badge-medical"
                          style={{ cursor: tenant ? 'pointer' : 'default' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            tenant && onSelectTenant(tenant);
                          }}
                          title="View clinic details"
                        >
                          {tenant?.name.split('&')[0] || 'Clinic'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={historyPage}
                  totalPages={totalHistoryPages}
                  totalItems={historyAppointments.length}
                  pageSize={historyPageSize}
                  onPageChange={setHistoryPage}
                  itemLabel="appointments"
                  isStandalone={true}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. TABLE VIEW DIRECTORY */}
      {viewMode === 'table' && (
        <div className="clean-table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Clinical Appointments Directory
              </h4>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Full table records synchronized with Supabase PostgreSQL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn-clean-primary"
                onClick={() => handleOpenAddForSlot()}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Plus size={14} />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>

          <table className="clean-table">
            <thead>
              <tr>
                <th>Time & Date</th>
                <th>Appointment Type & Complaint</th>
                <th>Physician & Department</th>
                <th>Clinic</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                paginatedDirectoryAppointments.map((appt, idx) => {
                  const tenant = tenants.find((t) => t.id === appt.tenant_id);

                  return (
                    <tr
                      key={appt.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setEditingAppointment(appt)}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} color="var(--primary)" />
                          <span>{formatDisplayTime(appt.scheduled_start)}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDisplayDate(appt.scheduled_start)}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {appt.appointment_type}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {appt.chief_complaint || 'Standard clinical consult'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {appt.provider_name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {appt.department} • Room {appt.room_number || '1'}
                        </div>
                      </td>

                      <td>
                        <span
                          className="badge-clean badge-medical"
                          style={{ cursor: tenant ? 'pointer' : 'default' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            tenant && onSelectTenant(tenant);
                          }}
                          title="View clinic details"
                        >
                          {tenant?.name.split('&')[0] || 'Clinic'}
                        </span>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <StatusPicker
                            value={appt.status}
                            options={APPOINTMENT_STATUS_OPTIONS}
                            onChange={(newStatus) => {
                              if (onUpdateAppointment) {
                                onUpdateAppointment(appt.id, { status: newStatus });
                              }
                            }}
                            isNearBottom={idx >= paginatedDirectoryAppointments.length - 2}
                          />
                          {appt.booked_via_ai && (
                            <span style={{ fontSize: '0.68rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                              <Sparkles size={10} /> AI Booked
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="appt-action-btn edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAppointment(appt);
                            }}
                            title="Edit"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="appt-action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingAppointment(appt);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={directoryPage}
            totalPages={totalDirectoryPages}
            totalItems={filteredAppointments.length}
            pageSize={directoryPageSize}
            onPageChange={setDirectoryPage}
            itemLabel="appointments"
          />
        </div>
      )}

      {/* ==============================================================================================
          5. ADD APPOINTMENT MODAL
          ============================================================================================== */}
      {isAddModalOpen && (
        <AddAppointmentModal
          tenants={medicalTenants.length > 0 ? medicalTenants : tenants}
          defaultTenantId={selectedClinic !== 'all' ? selectedClinic : (medicalTenants[0]?.id || tenants[0]?.id || '')}
          defaultDate={addModalDate}
          defaultTime={addModalTime}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={async (newAppt) => {
            if (onAddAppointment) {
              await onAddAppointment(newAppt);
            }
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* ==============================================================================================
          6. EDIT APPOINTMENT MODAL
          ============================================================================================== */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          tenants={medicalTenants.length > 0 ? medicalTenants : tenants}
          onClose={() => setEditingAppointment(null)}
          onUpdate={async (updates) => {
            if (onUpdateAppointment) {
              await onUpdateAppointment(editingAppointment.id, updates);
            }
            setEditingAppointment(null);
          }}
        />
      )}

      {/* ==============================================================================================
          7. DELETE APPOINTMENT CONFIRMATION MODAL
          ============================================================================================== */}
      {deletingAppointment && (
        <DeleteAppointmentModal
          appointment={deletingAppointment}
          tenantName={tenants.find((t) => t.id === deletingAppointment.tenant_id)?.name || 'Clinic'}
          onClose={() => setDeletingAppointment(null)}
          onDelete={async () => {
            if (onDeleteAppointment) {
              await onDeleteAppointment(deletingAppointment.id);
            }
            setDeletingAppointment(null);
          }}
        />
      )}
    </div>
  );
};

/* ==============================================================================================
   SUB-COMPONENT: ADD APPOINTMENT MODAL
   ============================================================================================== */
interface AddAppointmentModalProps {
  tenants: Tenant[];
  defaultTenantId: string;
  defaultDate: string;
  defaultTime: string;
  onClose: () => void;
  onAdd: (data: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  tenants,
  defaultTenantId,
  defaultDate,
  defaultTime,
  onClose,
  onAdd
}) => {
  const [tenantId, setTenantId] = useState(defaultTenantId || tenants[0]?.id || '');
  const [providerName, setProviderName] = useState('Dr. Julian Vance, DDS');
  const [department, setDepartment] = useState('Oral Surgery');
  const [appointmentType, setAppointmentType] = useState('Emergency Toothache & Extraction Consult');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [endTime, setEndTime] = useState(() => {
    // Default +1 hour from start time
    const [h, m] = defaultTime.split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    return `${endH}:${String(m || 0).padStart(2, '0')}`;
  });
  const [roomNumber, setRoomNumber] = useState('Surgical Suite 2');
  const [status, setStatus] = useState<Appointment['status']>('confirmed');
  const [chiefComplaint, setChiefComplaint] = useState('Severe sharp pain molar #19 for 48 hours.');
  const [aiTriageSummary, setAiTriageSummary] = useState('AI triage flagged urgent priority (8/10). Assigned expedited clinical slot.');
  const [bookedViaAi, setBookedViaAi] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !providerName || !appointmentType || !date || !startTime) return;

    setLoading(true);
    try {
      const scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
      const scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();

      await onAdd({
        tenant_id: tenantId,
        provider_name: providerName.trim(),
        department: department.trim(),
        appointment_type: appointmentType.trim(),
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        status,
        chief_complaint: chiefComplaint.trim() || undefined,
        ai_triage_summary: aiTriageSummary.trim() || undefined,
        room_number: roomNumber.trim() || undefined,
        booked_via_ai: bookedViaAi
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-overlay" id="add-appointment-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Book Clinical Appointment
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Schedule a patient encounter with real-time Supabase sync
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            {/* Clinic */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Building2 size={13} color="var(--primary)" />
                <span>Target Medical Clinic</span>
              </label>
              <select
                className="modal-select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.city || 'Clinical Unit'})
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Stethoscope size={13} color="var(--primary)" />
                <span>Appointment Type / Procedure</span>
              </label>
              <input
                className="modal-input"
                type="text"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                placeholder="e.g. Emergency Toothache & Extraction Consult"
                required
              />
              <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                {['Emergency Extraction', 'Invisalign Progress', 'Transthoracic Echocardiogram', 'Comprehensive Exam'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAppointmentType(preset)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Name & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <User size={13} color="var(--primary)" />
                  <span>Treating Doctor</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Dr. Julian Vance, DDS"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Department</span>
                </label>
                <select
                  className="modal-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Oral Surgery">Oral Surgery</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Cardiology Diagnostics">Cardiology Diagnostics</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Dental Hygiene">Dental Hygiene</option>
                </select>
              </div>
            </div>

            {/* Date, Start Time & End Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <CalendarDays size={13} color="var(--primary)" />
                  <span>Date</span>
                </label>
                <input
                  className="modal-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Clock size={13} color="var(--primary)" />
                  <span>Start</span>
                </label>
                <input
                  className="modal-input"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>End</span>
                </label>
                <input
                  className="modal-input"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Room & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Room / Operatory</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Surgical Suite 2"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Status</span>
                </label>
                <select
                  className="modal-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_consultation">In Consultation</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="modal-form-group">
              <label className="modal-label">
                <span>Patient Chief Complaint / Symptoms</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 60, padding: 8, resize: 'vertical' }}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Reason for visit..."
              />
            </div>

            {/* AI Triage Notes */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Sparkles size={13} color="#059669" />
                <span>AI Automated Triage Summary</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 50, padding: 8, resize: 'vertical' }}
                value={aiTriageSummary}
                onChange={(e) => setAiTriageSummary(e.target.value)}
                placeholder="Autonomous voice agent assessment..."
              />
            </div>

            {/* Booked via AI Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="add-booked-ai"
                checked={bookedViaAi}
                onChange={(e) => setBookedViaAi(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="add-booked-ai" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                Booked via Autonomous Voice Agent (AI Intake)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" disabled={loading}>
              {loading ? 'Saving Slot...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==============================================================================================
   SUB-COMPONENT: EDIT APPOINTMENT MODAL
   ============================================================================================== */
interface EditAppointmentModalProps {
  appointment: Appointment;
  tenants: Tenant[];
  onClose: () => void;
  onUpdate: (updates: Partial<Appointment>) => Promise<void>;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  tenants,
  onClose,
  onUpdate
}) => {
  const [tenantId, setTenantId] = useState(appointment.tenant_id);
  const [providerName, setProviderName] = useState(appointment.provider_name);
  const [department, setDepartment] = useState(appointment.department);
  const [appointmentType, setAppointmentType] = useState(appointment.appointment_type);

  const startD = new Date(appointment.scheduled_start);
  const endD = new Date(appointment.scheduled_end);

  const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const initialDate = isNaN(startD.getTime()) ? '2026-10-16' : formatLocalDate(startD);
  const initialStartTime = isNaN(startD.getTime()) ? '10:00' : `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`;
  const initialEndTime = isNaN(endD.getTime()) ? '11:00' : `${String(endD.getHours()).padStart(2, '0')}:${String(endD.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [roomNumber, setRoomNumber] = useState(appointment.room_number || '');
  const [status, setStatus] = useState<Appointment['status']>(appointment.status);
  const [chiefComplaint, setChiefComplaint] = useState(appointment.chief_complaint || '');
  const [aiTriageSummary, setAiTriageSummary] = useState(appointment.ai_triage_summary || '');
  const [bookedViaAi, setBookedViaAi] = useState(appointment.booked_via_ai);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
      const scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();

      await onUpdate({
        tenant_id: tenantId,
        provider_name: providerName.trim(),
        department: department.trim(),
        appointment_type: appointmentType.trim(),
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        status,
        chief_complaint: chiefComplaint.trim() || undefined,
        ai_triage_summary: aiTriageSummary.trim() || undefined,
        room_number: roomNumber.trim() || undefined,
        booked_via_ai: bookedViaAi
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-overlay" id="edit-appointment-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Pencil size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Edit Clinical Appointment
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Update physician, slot time, status, or notes
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            {/* Target Clinic */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Building2 size={13} color="var(--primary)" />
                <span>Clinic</span>
              </label>
              <select
                className="modal-select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Appointment Type */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Stethoscope size={13} color="var(--primary)" />
                <span>Appointment Type</span>
              </label>
              <input
                className="modal-input"
                type="text"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                required
              />
            </div>

            {/* Provider & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <User size={13} color="var(--primary)" />
                  <span>Treating Doctor</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Department</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <CalendarDays size={13} color="var(--primary)" />
                  <span>Date</span>
                </label>
                <input
                  className="modal-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Clock size={13} color="var(--primary)" />
                  <span>Start</span>
                </label>
                <input
                  className="modal-input"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>End</span>
                </label>
                <input
                  className="modal-input"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Room & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Room / Operatory</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <span>Status</span>
                </label>
                <select
                  className="modal-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_consultation">In Consultation</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="modal-form-group">
              <label className="modal-label">
                <span>Patient Chief Complaint</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 60, padding: 8, resize: 'vertical' }}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
              />
            </div>

            {/* AI Triage Notes */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Sparkles size={13} color="#059669" />
                <span>AI Automated Triage Summary</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 50, padding: 8, resize: 'vertical' }}
                value={aiTriageSummary}
                onChange={(e) => setAiTriageSummary(e.target.value)}
              />
            </div>

            {/* Booked via AI Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="edit-booked-ai"
                checked={bookedViaAi}
                onChange={(e) => setBookedViaAi(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="edit-booked-ai" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                Booked via Autonomous Voice Agent (AI Intake)
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==============================================================================================
   SUB-COMPONENT: DELETE APPOINTMENT CONFIRMATION MODAL
   ============================================================================================== */
interface DeleteAppointmentModalProps {
  appointment: Appointment;
  tenantName: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({
  appointment,
  tenantName,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
    }
  };

  const startD = new Date(appointment.scheduled_start);
  const formattedDate = isNaN(startD.getTime())
    ? 'Oct 16, 2026'
    : startD.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = isNaN(startD.getTime())
    ? '10:00 AM'
    : startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="clean-modal-overlay" id="delete-appointment-modal-overlay">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Trash2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Delete Appointment
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Permanently remove this clinical booking
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="clean-modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete this appointment? This action will remove the record directly from Supabase PostgreSQL.
          </p>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
              {appointment.appointment_type}
            </strong>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Doctor: {appointment.provider_name} • {appointment.department}
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Time: {formattedDate} at {formattedTime}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
              Clinic: {tenantName}
            </span>
          </div>
        </div>

        <div className="clean-modal-footer">
          <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-clean-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};
