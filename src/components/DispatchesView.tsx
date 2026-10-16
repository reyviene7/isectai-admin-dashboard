import React, { useState, useEffect } from 'react';
import {
  Wrench,
  MapPin,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  LayoutList,
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Clock,
  User,
  FileText
} from 'lucide-react';
import type { ServiceJob, Tenant } from '../lib/types';
import { Pagination } from './Pagination';
import { StatusPicker, SERVICE_JOB_STATUS_OPTIONS } from './StatusPicker';

interface DispatchesViewProps {
  serviceJobs: ServiceJob[];
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onAddServiceJob?: (job: Omit<ServiceJob, 'id' | 'created_at'>) => Promise<void>;
  onUpdateServiceJob?: (id: string, updates: Partial<ServiceJob>) => Promise<void>;
  onDeleteServiceJob?: (id: string) => Promise<void>;
  searchQuery?: string;
}

export const DispatchesView: React.FC<DispatchesViewProps> = ({
  serviceJobs,
  tenants,
  onSelectTenant,
  onAddServiceJob,
  onUpdateServiceJob,
  onDeleteServiceJob,
  searchQuery = ''
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<ServiceJob | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterPriority, searchQuery]);

  const filteredJobs = serviceJobs.filter((job) => {
    if (filterPriority !== 'all' && job.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tenant = tenants.find((t) => t.id === job.tenant_id);
      const matchTech = job.technician_name.toLowerCase().includes(q);
      const matchService = job.service_type.toLowerCase().includes(q);
      const matchAddress = job.dispatch_address.toLowerCase().includes(q);
      const matchStatus = job.status.toLowerCase().includes(q);
      const matchPriority = job.priority.toLowerCase().includes(q);
      const matchNotes = job.ai_intake_notes?.toLowerCase().includes(q) ?? false;
      const matchTenant = tenant?.name.toLowerCase().includes(q) ?? false;
      return (
        matchTech ||
        matchService ||
        matchAddress ||
        matchStatus ||
        matchPriority ||
        matchNotes ||
        matchTenant
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            type="button"
            className={`filter-btn ${filterPriority === 'all' ? 'active' : ''}`}
            onClick={() => setFilterPriority('all')}
          >
            <span>All Dispatches</span>
            <span className="filter-pill-count">{serviceJobs.length}</span>
          </button>

          <button
            type="button"
            className={`filter-btn ${filterPriority === 'emergency' ? 'active' : ''}`}
            onClick={() => setFilterPriority('emergency')}
          >
            <AlertTriangle size={13} color="#e11d48" />
            <span>Emergency Only</span>
            <span className="filter-pill-count">{emergencyCount}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onAddServiceJob && (
            <button
              type="button"
              className="btn-clean-primary"
              onClick={() => setIsAddModalOpen(true)}
              id="btn-add-work-order"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>Add Work Order</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
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
              type="button"
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
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.map((job, idx) => {
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

                    <td onClick={(e) => e.stopPropagation()}>
                      <StatusPicker
                        value={job.status}
                        options={SERVICE_JOB_STATUS_OPTIONS}
                        onChange={(newStatus) => {
                          if (onUpdateServiceJob) {
                            onUpdateServiceJob(job.id, {
                              status: newStatus,
                              final_cost: newStatus === 'completed' ? (job.final_cost ?? job.estimated_cost) : job.final_cost
                            });
                          }
                        }}
                        isNearBottom={idx >= paginatedJobs.length - 2}
                      />
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="appt-action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingJob(job);
                          }}
                          title="Edit work order details"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="appt-action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingJob(job);
                          }}
                          title="Delete work order"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="work orders"
          />
        </div>
      ) : (
        <>
          <div className="business-grid">
            {paginatedJobs.map((job) => {
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
                      borderTop: '1px solid var(--border-subtle)',
                      gap: 8,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <span className="badge-clean badge-service">
                        {tenant?.name.split(',')[0]}
                      </span>
                      <StatusPicker
                        value={job.status}
                        options={SERVICE_JOB_STATUS_OPTIONS}
                        onChange={(newStatus) => {
                          if (onUpdateServiceJob) {
                            onUpdateServiceJob(job.id, {
                              status: newStatus,
                              final_cost: newStatus === 'completed' ? (job.final_cost ?? job.estimated_cost) : job.final_cost
                            });
                          }
                        }}
                      />
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="appt-action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingJob(job);
                        }}
                        title="Edit work order"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="appt-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingJob(job);
                        }}
                        title="Delete work order"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="work orders"
            isStandalone={true}
          />
        </>
      )}

      {/* Modals */}
      {isAddModalOpen && onAddServiceJob && (
        <AddWorkOrderModal
          tenants={tenants}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={onAddServiceJob}
        />
      )}

      {editingJob && onUpdateServiceJob && (
        <EditWorkOrderModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSubmit={onUpdateServiceJob}
        />
      )}

      {deletingJob && onDeleteServiceJob && (
        <DeleteWorkOrderModal
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={onDeleteServiceJob}
        />
      )}
    </div>
  );
};

// ==============================================================================================
// 1. ADD WORK ORDER MODAL
// ==============================================================================================
interface AddWorkOrderModalProps {
  tenants: Tenant[];
  onClose: () => void;
  onSubmit: (job: Omit<ServiceJob, 'id' | 'created_at'>) => Promise<void>;
}

const AddWorkOrderModal: React.FC<AddWorkOrderModalProps> = ({
  tenants,
  onClose,
  onSubmit
}) => {
  const serviceTenants = tenants.filter((t) => t.industry === 'service_business');
  const availableTenants = serviceTenants.length > 0 ? serviceTenants : tenants;

  const [tenantId, setTenantId] = useState<string>(availableTenants[0]?.id || '');
  const [serviceType, setServiceType] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('Tyler Vance (Master HVAC Tech)');
  const [priority, setPriority] = useState<ServiceJob['priority']>('high');
  const [status, setStatus] = useState<ServiceJob['status']>('pending_dispatch');
  const [dispatchAddress, setDispatchAddress] = useState<string>('742 Evergreen Terrace, Brooklyn, NY');
  const [estimatedCost, setEstimatedCost] = useState<number>(350);
  const [scheduledFor, setScheduledFor] = useState<string>(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [aiIntakeNotes, setAiIntakeNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const presets = [
    'Emergency Rooftop Condenser Diagnostic',
    'Main Line Drain Jetting & Clearing',
    '200A Electrical Panel Tripping Repair',
    'Commercial Walk-in Cooler Refrigeration',
    'Tankless Boiler Overpressure Inspection'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim() || !technicianName.trim() || !dispatchAddress.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        tenant_id: tenantId,
        service_type: serviceType.trim(),
        technician_name: technicianName.trim(),
        priority,
        status,
        dispatch_address: dispatchAddress.trim(),
        estimated_cost: Number(estimatedCost) || 0,
        final_cost: status === 'completed' ? Number(estimatedCost) : undefined,
        scheduled_for: scheduledFor,
        ai_intake_notes: aiIntakeNotes.trim() || 'Manual dispatch order entered via Console.',
        booked_via_ai: false
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="clean-modal-overlay" role="dialog" aria-modal="true">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--service-soft)',
                color: 'var(--service-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Wrench size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Create Field Work Order
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Dispatch technician and synchronize with PostgreSQL
              </p>
            </div>
          </div>
          <button type="button" className="clean-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            {/* Target Business */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Building2 size={13} color="var(--primary)" />
                <span>Assigned Business / Franchise</span>
              </label>
              <select
                className="modal-select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                {availableTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.city || 'Trade Enterprise'})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Wrench size={13} color="var(--service-color)" />
                <span>Work Order Description / Service Type</span>
              </label>
              <input
                className="modal-input"
                type="text"
                placeholder="e.g. Commercial HVAC Rooftop Diagnostic"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              />
              {/* Presets */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setServiceType(p)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Technician & Priority Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <User size={13} color="var(--primary)" />
                  <span>Assigned Field Tech</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Technician full name"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <AlertTriangle size={13} color="#e11d48" />
                  <span>Dispatch Priority</span>
                </label>
                <select
                  className="modal-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ServiceJob['priority'])}
                >
                  <option value="emergency">🚨 Emergency Code 1</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Standard / Low</option>
                </select>
              </div>
            </div>

            {/* Status & Estimated Cost Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <CheckCircle size={13} color="var(--success-color)" />
                  <span>Initial Status</span>
                </label>
                <select
                  className="modal-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ServiceJob['status'])}
                >
                  <option value="pending_dispatch">Pending Dispatch</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="on_site">On Site</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="invoiced">Invoiced</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <DollarSign size={13} color="#059669" />
                  <span>Estimated Cost ($ USD)</span>
                </label>
                <input
                  className="modal-input"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="350"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Scheduled Date/Time & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <Clock size={13} color="var(--primary)" />
                  <span>Scheduled Time</span>
                </label>
                <input
                  className="modal-input"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <MapPin size={13} color="var(--text-muted)" />
                  <span>Dispatch Address</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={dispatchAddress}
                  onChange={(e) => setDispatchAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="modal-form-group" style={{ marginBottom: 0 }}>
              <label className="modal-label">
                <FileText size={13} color="var(--text-muted)" />
                <span>AI Intake / Work Description Notes</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 72, padding: '10px 14px', resize: 'vertical' }}
                placeholder="Caller notes, equipment model, access codes..."
                value={aiIntakeNotes}
                onChange={(e) => setAiIntakeNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" disabled={submitting}>
              <Plus size={15} />
              <span>{submitting ? 'Creating...' : 'Create Work Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==============================================================================================
// 2. EDIT WORK ORDER MODAL
// ==============================================================================================
interface EditWorkOrderModalProps {
  job: ServiceJob;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<ServiceJob>) => Promise<void>;
}

const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  job,
  onClose,
  onSubmit
}) => {
  const [status, setStatus] = useState<ServiceJob['status']>(job.status);
  const [priority, setPriority] = useState<ServiceJob['priority']>(job.priority);
  const [serviceType, setServiceType] = useState<string>(job.service_type);
  const [technicianName, setTechnicianName] = useState<string>(job.technician_name);
  const [estimatedCost, setEstimatedCost] = useState<number>(job.estimated_cost);
  const [finalCost, setFinalCost] = useState<number | ''>(job.final_cost ?? '');
  const [dispatchAddress, setDispatchAddress] = useState<string>(job.dispatch_address);
  const [aiIntakeNotes, setAiIntakeNotes] = useState<string>(job.ai_intake_notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim() || !technicianName.trim() || !dispatchAddress.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(job.id, {
        status,
        priority,
        service_type: serviceType.trim(),
        technician_name: technicianName.trim(),
        estimated_cost: Number(estimatedCost) || 0,
        final_cost: finalCost !== '' ? Number(finalCost) : undefined,
        dispatch_address: dispatchAddress.trim(),
        ai_intake_notes: aiIntakeNotes.trim()
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = () => {
    setStatus('completed');
    if (finalCost === '' || !finalCost) {
      setFinalCost(estimatedCost);
    }
  };

  return (
    <div className="clean-modal-overlay" role="dialog" aria-modal="true">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
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
                Edit Field Work Order
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Update status, assigned tech, costs, and dispatch telemetry
              </p>
            </div>
          </div>
          <button type="button" className="clean-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            {/* Status with Quick Mark-Completed Button */}
            <div className="modal-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <label className="modal-label" style={{ margin: 0 }}>
                  <CheckCircle size={13} color="var(--success-color)" />
                  <span>Work Order Status</span>
                </label>
                {status !== 'completed' && (
                  <button
                    type="button"
                    onClick={handleMarkCompleted}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Change to Completed</span>
                  </button>
                )}
              </div>
              <select
                className="modal-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceJob['status'])}
              >
                <option value="pending_dispatch">Pending Dispatch</option>
                <option value="dispatched">Dispatched</option>
                <option value="on_site">On Site</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">✓ Completed</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>

            {/* Service Type Description */}
            <div className="modal-form-group">
              <label className="modal-label">
                <Wrench size={13} color="var(--service-color)" />
                <span>Work Order Description / Service Type</span>
              </label>
              <input
                className="modal-input"
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              />
            </div>

            {/* Technician & Priority Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <User size={13} color="var(--primary)" />
                  <span>Assigned Field Tech</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <AlertTriangle size={13} color="#e11d48" />
                  <span>Priority</span>
                </label>
                <select
                  className="modal-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ServiceJob['priority'])}
                >
                  <option value="emergency">🚨 Emergency Code 1</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Standard / Low</option>
                </select>
              </div>
            </div>

            {/* Estimated & Final Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="modal-form-group">
                <label className="modal-label">
                  <DollarSign size={13} color="#059669" />
                  <span>Estimated Cost ($ USD)</span>
                </label>
                <input
                  className="modal-input"
                  type="number"
                  min="0"
                  step="10"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <DollarSign size={13} color="#10b981" />
                  <span>Final Billed Cost ($ USD)</span>
                </label>
                <input
                  className="modal-input"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Optional until invoiced"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            {/* Dispatch Address */}
            <div className="modal-form-group">
              <label className="modal-label">
                <MapPin size={13} color="var(--text-muted)" />
                <span>Dispatch Location</span>
              </label>
              <input
                className="modal-input"
                type="text"
                value={dispatchAddress}
                onChange={(e) => setDispatchAddress(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="modal-form-group" style={{ marginBottom: 0 }}>
              <label className="modal-label">
                <FileText size={13} color="var(--text-muted)" />
                <span>AI Intake / Diagnostic Notes</span>
              </label>
              <textarea
                className="modal-input"
                style={{ height: 72, padding: '10px 14px', resize: 'vertical' }}
                value={aiIntakeNotes}
                onChange={(e) => setAiIntakeNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-clean-primary" disabled={submitting}>
              <CheckCircle2 size={15} />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==============================================================================================
// 3. DELETE WORK ORDER CONFIRMATION MODAL
// ==============================================================================================
interface DeleteWorkOrderModalProps {
  job: ServiceJob;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

const DeleteWorkOrderModal: React.FC<DeleteWorkOrderModalProps> = ({
  job,
  onClose,
  onConfirm
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(job.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="clean-modal-overlay" role="dialog" aria-modal="true">
      <div className="clean-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="clean-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--danger-soft)',
                color: 'var(--danger-color)',
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
                Delete Field Work Order
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Permanently revoke dispatch and release database record
              </p>
            </div>
          </div>
          <button type="button" className="clean-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="clean-modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete this work order? This will remove the job from PostgreSQL and terminate technician dispatch telemetry.
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
              gap: 4,
              fontSize: '0.8rem'
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Service:</strong> {job.service_type}
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Technician:</strong> {job.technician_name}
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Address:</strong> {job.dispatch_address}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="clean-modal-footer">
          <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              background: 'var(--danger-color)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={14} />
            <span>{deleting ? 'Deleting...' : 'Delete Work Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
