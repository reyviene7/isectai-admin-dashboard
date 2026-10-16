import React from 'react';
import { Search, Plus, Menu, Stethoscope, Wrench } from 'lucide-react';
import type { NavTab } from './Sidebar';
import type { UserAccount, Tenant } from '../lib/types';

interface HeaderProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddBusiness: () => void;
  onToggleMobileMenu: () => void;
  currentUser: UserAccount;
  assignedTenant?: Tenant;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenAddBusiness,
  onToggleMobileMenu,
  currentUser,
  assignedTenant
}) => {
  const isAdmin = currentUser.role === 'platform_admin';

  const getTabTitles = () => {
    switch (activeTab) {
      case 'appointments':
        return {
          title: 'Patient Appointments',
          subtitle: isAdmin
            ? 'Daily clinic schedule, doctor itinerary & clinical triage'
            : `${assignedTenant?.name || 'Clinic'} • Daily Patient Appointments & Consultations`
        };
      case 'dispatches':
        return {
          title: 'Field Work Orders',
          subtitle: isAdmin
            ? 'Emergency trade dispatches, technician routes & quotes'
            : `${assignedTenant?.name || 'Service'} • Field Work Orders & Tech Dispatches`
        };
      case 'telemetry':
        return {
          title: 'AI Telemetry & Logs',
          subtitle: 'Autonomous voice calls, token utilization & transcripts'
        };
      case 'architecture':
        return {
          title: 'Architecture & Database',
          subtitle: 'Technical design, PostgreSQL schema, RLS policies & roadmap'
        };
      case 'staff':
        return {
          title: 'Staff & Team Management',
          subtitle: 'Provision staff accounts, assign clinic practices & manage permissions'
        };
      default:
        return {
          title: isAdmin ? 'Platform Overview' : `${assignedTenant?.name || 'Business'} Portal`,
          subtitle: isAdmin
            ? 'Monitoring medical clinics and commercial trade services'
            : 'Operational dashboard & autonomous AI call telemetry'
        };
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'appointments':
        return 'Search doctor, type, department, notes...';
      case 'dispatches':
        return 'Search technician, service, address, priority...';
      case 'telemetry':
        return 'Search caller, phone, intent, transcript...';
      case 'staff':
        return 'Search staff name, email, title, practice...';
      case 'overview':
      default:
        return isAdmin ? 'Search clinics, businesses, phone...' : 'Search businesses...';
    }
  };

  const { title, subtitle } = getTabTitles();

  return (
    <header className="topbar" id="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger Menu Button on Mobile/Tablet */}
        <button
          className="topbar-mobile-trigger"
          onClick={onToggleMobileMenu}
          title="Open menu"
          id="mobile-menu-trigger-btn"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-left">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Contextual Search Input: Shown for tabs with records, hidden for Architecture */}
        {activeTab !== 'architecture' && (
          <div className="search-bar">
            <Search size={15} className="search-icon-pos" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              id="global-search-input"
              aria-label={getSearchPlaceholder()}
            />
          </div>
        )}

        {/* Primary Action Button: Only Admin has authority to onboard businesses */}
        {isAdmin ? (
          <button
            className="btn-clean-primary"
            onClick={onOpenAddBusiness}
            id="btn-add-business"
          >
            <Plus size={16} />
            <span>New Business</span>
          </button>
        ) : (
          <div
            className={`badge-clean ${
              assignedTenant?.industry === 'medical_clinic' ? 'badge-medical' : 'badge-service'
            }`}
            style={{ padding: '7px 12px', fontSize: '0.78rem', gap: 6 }}
          >
            {assignedTenant?.industry === 'medical_clinic' ? <Stethoscope size={14} /> : <Wrench size={14} />}
            <span>{assignedTenant?.name.split(',')[0] || 'Scoped Staff Access'}</span>
          </div>
        )}
      </div>
    </header>
  );
};
