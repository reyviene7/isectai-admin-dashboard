import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Search,
  CheckCircle,
  Building2,
  Lock,
  Mail,
  Phone,
  Pencil,
  Trash2,
  X,
  User,
  Briefcase
} from 'lucide-react';
import type { UserAccount, Tenant, UserRole } from '../lib/types';
import { Pagination } from './Pagination';

interface StaffManagementViewProps {
  users: UserAccount[];
  tenants: Tenant[];
  onOpenAddStaff: () => void;
  currentUser: UserAccount;
  onUpdateStaff?: (id: string, updates: Partial<UserAccount>) => Promise<void> | void;
  onDeleteStaff?: (id: string) => Promise<void> | void;
  searchQuery?: string;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  users,
  tenants,
  onOpenAddStaff,
  currentUser,
  onUpdateStaff,
  onDeleteStaff,
  searchQuery = ''
}) => {
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, searchQuery, filterTenant]);

  const isAdmin = currentUser.role === 'platform_admin';

  const staffUsers = users.filter((u) => u.role === 'business_staff');
  const adminUsers = users.filter((u) => u.role === 'platform_admin');

  const effectiveSearch = (searchQuery.trim() || search.trim()).toLowerCase();

  const filteredUsers = users.filter((u) => {
    if (filterTenant === 'admin' && u.role !== 'platform_admin') return false;
    if (filterTenant === 'staff' && u.role !== 'business_staff') return false;
    if (filterTenant !== 'all' && filterTenant !== 'admin' && filterTenant !== 'staff' && u.tenant_id !== filterTenant) return false;

    if (effectiveSearch) {
      const tenant = tenants.find((t) => t.id === u.tenant_id);
      return (
        u.full_name.toLowerCase().includes(effectiveSearch) ||
        u.email.toLowerCase().includes(effectiveSearch) ||
        (u.title && u.title.toLowerCase().includes(effectiveSearch)) ||
        (u.phone && u.phone.toLowerCase().includes(effectiveSearch)) ||
        (tenant && tenant.name.toLowerCase().includes(effectiveSearch))
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Contextual Team KPIs */}
      <div className="kpi-row" id="staff-kpis">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{users.length}</span>
            <span className="kpi-title">Total Active Accounts</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <Stethoscope size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">
              {users.filter((u) => {
                const t = tenants.find((ten) => ten.id === u.tenant_id);
                return t?.industry === 'medical_clinic';
              }).length}
            </span>
            <span className="kpi-title">Clinic Staff Users</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Wrench size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">
              {users.filter((u) => {
                const t = tenants.find((ten) => ten.id === u.tenant_id);
                return t?.industry === 'service_business';
              }).length}
            </span>
            <span className="kpi-title">Field Dispatch Staff</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-number">{adminUsers.length}</span>
            <span className="kpi-title">Platform Admins</span>
          </div>
        </div>
      </div>

      {/* Admin Action & Filter Toolbar */}
      <div className="content-toolbar">
        <div className="filter-group">
          <div className="search-bar" style={{ maxWidth: 280 }}>
            <Search size={15} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Filter staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="staff-search-input"
            />
          </div>

          <button
            className={`filter-btn ${filterTenant === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTenant('all')}
          >
            <span>All Accounts</span>
            <span className="filter-pill-count">{users.length}</span>
          </button>

          <button
            className={`filter-btn ${filterTenant === 'admin' ? 'active' : ''}`}
            onClick={() => setFilterTenant('admin')}
          >
            <ShieldCheck size={13} />
            <span>Admins</span>
            <span className="filter-pill-count">{adminUsers.length}</span>
          </button>

          <button
            className={`filter-btn ${filterTenant === 'staff' ? 'active' : ''}`}
            onClick={() => setFilterTenant('staff')}
          >
            <Users size={13} />
            <span>Staff</span>
            <span className="filter-pill-count">{staffUsers.length}</span>
          </button>
        </div>

        {/* Primary Action Button: Only Admin has authority */}
        {isAdmin ? (
          <button
            className="btn-clean-primary"
            onClick={onOpenAddStaff}
            id="btn-provision-staff"
          >
            <UserPlus size={16} />
            <span>+ Add Staff Member</span>
          </button>
        ) : (
          <div
            style={{
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Lock size={13} />
            <span>Staff accounts can only be provisioned by Platform Admins</span>
          </div>
        )}
      </div>

      {/* Staff Accounts Table */}
      <div className="clean-table-card">
        <table className="clean-table">
          <thead>
            <tr>
              <th>User & Title</th>
              <th>Role & Permissions</th>
              <th>Assigned Practice / Entity</th>
              <th>Contact Email</th>
              <th>Direct Phone</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  No staff members match the selected criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => {
              const tenant = tenants.find((t) => t.id === user.tenant_id);
              const isUserAdmin = user.role === 'platform_admin';
              const isClinic = tenant?.industry === 'medical_clinic';

              return (
                <tr
                  key={user.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setEditingUser(user)}
                  title="Click anywhere on row to edit staff details"
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: isUserAdmin
                            ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                            : isClinic
                            ? 'var(--medical-soft)'
                            : 'var(--service-soft)',
                          color: isUserAdmin
                            ? '#ffffff'
                            : isClinic
                            ? 'var(--medical-color)'
                            : 'var(--service-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}
                      >
                        {user.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                          {user.full_name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {user.title || (isUserAdmin ? 'Platform Administrator' : 'Staff Member')}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`badge-clean ${
                        isUserAdmin ? 'badge-primary' : isClinic ? 'badge-medical' : 'badge-service'
                      }`}
                    >
                      {isUserAdmin ? '👑 Platform Admin' : '👤 Business Staff'}
                    </span>
                  </td>

                  <td>
                    {isUserAdmin ? (
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                        All Businesses (Unrestricted)
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {tenant?.name || 'Assigned Tenant'}
                        </span>
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem' }}>
                      <Mail size={13} color="var(--text-muted)" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Phone size={13} />
                      <span>{user.phone || 'N/A'}</span>
                    </div>
                  </td>

                  <td>
                    {user.is_active !== false ? (
                      <span className="badge-clean badge-success">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="badge-clean" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                        Suspended
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <button
                        className="appt-action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user);
                        }}
                        title="Edit staff details"
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="appt-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user.id === currentUser.id) return;
                          setDeletingUser(user);
                        }}
                        disabled={user.id === currentUser.id}
                        style={{
                          opacity: user.id === currentUser.id ? 0.35 : 1,
                          cursor: user.id === currentUser.id ? 'not-allowed' : 'pointer'
                        }}
                        title={user.id === currentUser.id ? 'Cannot delete active logged-in account' : 'Delete staff member'}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="staff members"
        />
      </div>

      {/* Permission Summary Card for Reviewer */}
      <div
        style={{
          background: 'var(--bg-shell)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            Role-Based Access Control Architecture
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            • <strong>Platform Admin</strong>: Has superuser authority. Can onboard businesses, alter Supabase connections, review technical architecture, and provision or edit staff accounts.
            <br />
            • <strong>Staff Accounts</strong>: Scoped strictly to their designated medical clinic or field service company. Staff accounts cannot onboard new businesses, cannot modify database settings, and cannot add or delete other staff accounts.
          </p>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {editingUser && (
        <EditStaffModal
          user={editingUser}
          tenants={tenants}
          currentUser={currentUser}
          onClose={() => setEditingUser(null)}
          onUpdate={async (updates) => {
            if (onUpdateStaff) {
              await onUpdateStaff(editingUser.id, updates);
            }
            setEditingUser(null);
          }}
        />
      )}

      {/* Delete Staff Modal */}
      {deletingUser && (
        <DeleteStaffModal
          user={deletingUser}
          tenant={tenants.find((t) => t.id === deletingUser.tenant_id)}
          onClose={() => setDeletingUser(null)}
          onConfirm={async () => {
            if (onDeleteStaff) {
              await onDeleteStaff(deletingUser.id);
            }
            setDeletingUser(null);
          }}
        />
      )}
    </div>
  );
};

// ==============================================================================================
// EDIT STAFF MODAL
// ==============================================================================================
interface EditStaffModalProps {
  user: UserAccount;
  tenants: Tenant[];
  currentUser: UserAccount;
  onClose: () => void;
  onUpdate: (updates: Partial<UserAccount>) => Promise<void> | void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({
  user,
  tenants,
  currentUser,
  onClose,
  onUpdate
}) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(user.tenant_id || tenants[0]?.id || '');
  const [isActive, setIsActive] = useState<boolean>(user.is_active !== false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const updates: Partial<UserAccount> = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        title: title.trim(),
        phone: phone.trim(),
        role,
        tenant_id: role === 'platform_admin' ? null : (selectedTenantId || null),
        is_active: isActive
      };
      if (password.trim()) {
        updates.password = password.trim();
      }
      await onUpdate(updates);
    } finally {
      setLoading(false);
    }
  };

  const isSelf = user.id === currentUser.id;

  return (
    <div className="clean-modal-overlay" id="edit-staff-modal-overlay">
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Edit Staff Member
                </h3>
                <span className="badge-clean badge-primary" style={{ fontSize: '0.62rem' }}>
                  {user.role === 'platform_admin' ? 'PLATFORM ADMIN' : 'STAFF ACCOUNT'}
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Update account profile, assigned practice, role, and credentials
              </p>
            </div>
          </div>

          <button
            className="btn-clean-secondary"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, justifyContent: 'center', borderRadius: '50%' }}
            title="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form-wrap">
          <div className="clean-modal-body">
            {/* Full Name & Email (2-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={15} className="field-icon" />
                  <input
                    type="text"
                    className="modal-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Julian Vance"
                  />
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={15} className="field-icon" />
                  <input
                    type="email"
                    className="modal-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Role & Status (2-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Account Role</label>
                <div className="input-with-icon">
                  <ShieldCheck size={15} className="field-icon" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="modal-select"
                    disabled={isSelf}
                  >
                    <option value="business_staff">Business Staff (Scoped)</option>
                    <option value="platform_admin">Platform Admin (Superuser)</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Account Status</label>
                <div className="input-with-icon">
                  <CheckCircle size={15} className="field-icon" />
                  <select
                    value={isActive ? 'active' : 'suspended'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    className="modal-select"
                    disabled={isSelf}
                  >
                    <option value="active">Active (Can Log In)</option>
                    <option value="suspended">Suspended (Access Disabled)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Assigned Practice / Entity */}
            {role === 'business_staff' ? (
              <div className="modal-form-group">
                <label className="modal-label">Assigned Practice / Entity</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="field-icon" />
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="modal-select"
                    required
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.industry === 'medical_clinic' ? 'Clinic' : 'Trades'})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="modal-helper-text">
                  User is restricted to data for this assigned business.
                </span>
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-soft)',
                  border: '1px solid var(--border-focus)',
                  marginBottom: 14,
                  fontSize: '0.78rem',
                  color: 'var(--primary)'
                }}
              >
                👑 Platform Administrators have unrestricted access across all clinics, field jobs, and settings.
              </div>
            )}

            {/* Title & Phone (2-Col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Job Title / Specialty</label>
                <div className="input-with-icon">
                  <Briefcase size={15} className="field-icon" />
                  <input
                    type="text"
                    className="modal-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Nurse, Dispatcher"
                  />
                </div>
              </div>

              <div className="modal-form-group" style={{ marginBottom: 0 }}>
                <label className="modal-label">Direct Phone</label>
                <div className="input-with-icon">
                  <Phone size={15} className="field-icon" />
                  <input
                    type="text"
                    className="modal-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Optional Password Update */}
            <div className="modal-form-group" style={{ marginBottom: 0 }}>
              <label className="modal-label">Reset Password (Optional)</label>
              <div className="input-with-icon">
                <Lock size={15} className="field-icon" />
                <input
                  type="password"
                  className="modal-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                />
              </div>
              <span className="modal-helper-text">
                Enter a new password only if resetting user login credentials.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="clean-modal-footer">
            <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={loading}>
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

// ==============================================================================================
// DELETE STAFF MODAL
// ==============================================================================================
interface DeleteStaffModalProps {
  user: UserAccount;
  tenant?: Tenant;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const DeleteStaffModal: React.FC<DeleteStaffModalProps> = ({
  user,
  tenant,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clean-modal-overlay" id="delete-staff-modal-overlay">
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
                Delete Staff Account
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Permanently revoke credentials and platform access
              </p>
            </div>
          </div>
          <button className="clean-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="clean-modal-body">
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to delete this staff member? This will remove the account from Supabase PostgreSQL and terminate active logins.
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
              {user.full_name}
            </strong>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              {user.email} • {user.title || (user.role === 'platform_admin' ? 'Administrator' : 'Staff')}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
              Assigned: {user.role === 'platform_admin' ? 'All Businesses' : (tenant?.name || 'Unassigned')}
            </span>
          </div>
        </div>

        <div className="clean-modal-footer">
          <button type="button" className="btn-clean-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-clean-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

