import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Wrench,
  Bot,
  ShieldCheck,
  Sun,
  Moon
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
  totalJobs
}) => {
  return (
    <aside className="sidebar" id="app-sidebar">
      <div>
        {/* Clean Logo Section */}
        <div className="brand-section">
          <div className="brand-icon">iS</div>
          <div className="brand-text">
            <h2>iSectAI</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav-menu">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => onTabChange('overview')}
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
            onClick={() => onTabChange('appointments')}
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
            onClick={() => onTabChange('dispatches')}
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
            onClick={() => onTabChange('telemetry')}
            id="nav-tab-telemetry"
          >
            <div className="nav-link-content">
              <Bot size={18} />
              <span>AI Telemetry</span>
            </div>
          </button>

          <button
            className={`nav-link ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => onTabChange('architecture')}
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
          onClick={onOpenConfig}
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
  );
};
