import React from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddBusiness: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenAddBusiness,
  onToggleMobileMenu
}) => {
  const getTabTitles = () => {
    switch (activeTab) {
      case 'appointments':
        return {
          title: 'Patient Appointments',
          subtitle: 'Daily clinic schedule, doctor itinerary & clinical triage'
        };
      case 'dispatches':
        return {
          title: 'Field Work Orders',
          subtitle: 'Emergency trade dispatches, technician routes & quotes'
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
      default:
        return {
          title: 'Platform Overview',
          subtitle: 'Monitoring medical clinics and commercial trade services'
        };
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
        {/* Search Input */}
        <div className="search-bar">
          <Search size={15} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search records, clinics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="global-search-input"
          />
        </div>

        {/* Single Primary Action Button */}
        <button
          className="btn-clean-primary"
          onClick={onOpenAddBusiness}
          id="btn-add-business"
        >
          <Plus size={16} />
          <span>New Business</span>
        </button>
      </div>
    </header>
  );
};
