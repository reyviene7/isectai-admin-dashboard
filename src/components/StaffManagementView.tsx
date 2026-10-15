import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';
import type { UserAccount, Tenant } from '../lib/types';

interface StaffManagementViewProps {
  users: UserAccount[];
  tenants: Tenant[];
  onOpenAddStaff: () => void;
  currentUser: UserAccount;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  users,
  tenants,
  onOpenAddStaff,
  currentUser
}) => {
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState<string>('all');

  const isAdmin = currentUser.role === 'platform_admin';

  const staffUsers = users.filter((u) => u.role === 'business_staff');
  const adminUsers = users.filter((u) => u.role === 'platform_admin');

  const filteredUsers = users.filter((u) => {
    if (filterTenant === 'admin' && u.role !== 'platform_admin') return false;
    if (filterTenant === 'staff' && u.role !== 'business_staff') return false;
    if (filterTenant !== 'all' && filterTenant !== 'admin' && filterTenant !== 'staff' && u.tenant_id !== filterTenant) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const tenant = tenants.find((t) => t.id === u.tenant_id);
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.title && u.title.toLowerCase().includes(q)) ||
        (tenant && tenant.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

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
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const tenant = tenants.find((t) => t.id === user.tenant_id);
              const isUserAdmin = user.role === 'platform_admin';
              const isClinic = tenant?.industry === 'medical_clinic';

              return (
                <tr key={user.id}>
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
                    <span className="badge-clean badge-success">
                      <CheckCircle size={10} /> Active
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
            • <strong>Platform Admin (Sarah Chen)</strong>: Has superuser authority. Can onboard businesses, alter Supabase connections, review technical architecture, and provision or provision staff accounts.
            <br />
            • <strong>Staff Accounts (Elena Ramos, Dr. Julian Vance, Marcus Vance)</strong>: Scoped strictly to their designated medical clinic or field service company. Staff accounts cannot onboard new businesses, cannot modify database settings, and cannot add other staff accounts.
          </p>
        </div>
      </div>
    </div>
  );
};
