import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Bot,
  ShieldCheck,
  Sun,
  Moon,
  X
} from 'lucide-react';

export type NavTab = 'overview' | 'appointments' | 'dispatches' | 'telemetry' | 'architecture';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isLiveSupabase: boolean;
  latencyMs?: number;
  onOpenConfig: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  totalAppts: number;
  totalJobs: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isLiveSupabase,
  latencyMs,
  onOpenConfig,
  theme,
  onToggleTheme,
  totalAppts,
  totalJobs,
  isMobileOpen,
  onCloseMobile
}) => {
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
              <div className="brand-icon">iS</div>
              <div className="brand-text">
                <h2>iSectAI</h2>
                <span>Admin Portal</span>
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
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          {/* Single Database Connection Status Pill */}
          <button
            className="db-pill"
            onClick={() => {
              onOpenConfig();
              onCloseMobile();
            }}
            title="Click to view or connect live Supabase PostgreSQL"
            id="sidebar-db-pill"
          >
            <span className={`pulse-dot ${isLiveSupabase ? 'green' : 'amber'}`} />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700 }}>
                {isLiveSupabase ? 'Supabase Live' : 'Local Demo DB'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {isLiveSupabase ? `${latencyMs ?? 42}ms latency` : 'Click to link cloud'}
              </span>
            </div>
          </button>

          {/* User Profile & Theme Switcher */}
          <div className="theme-user-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}
              >
                SC
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <strong style={{ fontSize: '0.82rem', display: 'block', color: 'var(--text-main)' }}>
                  Sarah Chen
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Platform Admin</span>
              </div>
            </div>

            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
