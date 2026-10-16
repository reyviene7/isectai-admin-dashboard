import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Bot,
  ShieldCheck,
  Sun,
  Moon,
  X,
  Users,
  LogOut
} from 'lucide-react';
import type { UserAccount, Tenant } from '../lib/types';

export type NavTab = 'overview' | 'appointments' | 'dispatches' | 'telemetry' | 'architecture' | 'staff';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isLiveSupabase?: boolean;
  latencyMs?: number;
  onOpenConfig?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  totalAppts: number;
  totalJobs: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: UserAccount;
  onLogout: () => void;
  tenants: Tenant[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  totalAppts,
  totalJobs,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  onLogout,
  tenants
}) => {
  const isAdmin = currentUser.role === 'platform_admin';
  const assignedTenant = tenants.find((t) => t.id === currentUser.tenant_id);
  const handleItemClick = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} id="sidebar-backdrop" />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`} id="app-sidebar">
        <div>
          {/* Brand & Mobile Close Button */}
          <div className="brand-section">
            <div className="brand-brand-wrap">
              <div className="isect-brand-text-block brand-text">
                <span className="font-display text-[1.375rem] leading-none font-bold tracking-[-0.02em] text-ink">
                  <span className="text-mark">i</span>Sect
                </span>
                <span className="isect-os-tag">AI</span>
              </div>
            </div>

            <button
              className="mobile-close-btn"
              onClick={onCloseMobile}
              title="Close menu"
              id="sidebar-close-mobile-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleItemClick('overview')}
              id="nav-tab-overview"
            >
              <div className="nav-link-content">
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </div>
              <span className="nav-badge">3</span>
            </button>

            <button
              className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => handleItemClick('appointments')}
              id="nav-tab-appointments"
            >
              <div className="nav-link-content">
                <Stethoscope size={18} />
                <span>Appointments</span>
              </div>
              <span className="nav-badge">{totalAppts}</span>
            </button>

            <button
              className={`nav-link ${activeTab === 'dispatches' ? 'active' : ''}`}
              onClick={() => handleItemClick('dispatches')}
              id="nav-tab-dispatches"
            >
              <div className="nav-link-content">
                <Wrench size={18} />
                <span>Field Jobs</span>
              </div>
              <span className="nav-badge">{totalJobs}</span>
            </button>

            <button
              className={`nav-link ${activeTab === 'telemetry' ? 'active' : ''}`}
              onClick={() => handleItemClick('telemetry')}
              id="nav-tab-telemetry"
            >
              <div className="nav-link-content">
                <Bot size={18} />
                <span>AI Telemetry</span>
              </div>
            </button>

            <button
              className={`nav-link ${activeTab === 'architecture' ? 'active' : ''}`}
              onClick={() => handleItemClick('architecture')}
              id="nav-tab-architecture"
            >
              <div className="nav-link-content">
                <ShieldCheck size={18} />
                <span>Architecture & DB</span>
              </div>
            </button>

            {/* Staff & Team Management (Only visible to Admin) */}
            {isAdmin && (
              <button
                className={`nav-link ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => handleItemClick('staff')}
                id="nav-tab-staff"
              >
                <div className="nav-link-content">
                  <Users size={18} />
                  <span>Staff & Team</span>
                </div>
                <span
                  className="nav-badge"
                  style={{
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.64rem'
                  }}
                >
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          {/* User Profile, Theme Switcher & Logout */}
          <div className="theme-user-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isAdmin
                    ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                    : assignedTenant?.industry === 'medical_clinic'
                    ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)'
                    : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0
                }}
              >
                {currentUser.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div style={{ lineHeight: 1.2, minWidth: 0 }}>
                <strong
                  style={{
                    fontSize: '0.82rem',
                    display: 'block',
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser.full_name}
                </strong>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block'
                  }}
                >
                  {isAdmin ? 'Platform Admin' : `${assignedTenant?.name.split(' ')[0] || 'Clinic'} Staff`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button
                className="theme-toggle-btn"
                onClick={onToggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                id="theme-toggle-btn"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>

              <button
                className="theme-toggle-btn"
                onClick={onLogout}
                title="Sign out / Switch account"
                id="sidebar-logout-btn"
                style={{ color: 'var(--danger-color)' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
