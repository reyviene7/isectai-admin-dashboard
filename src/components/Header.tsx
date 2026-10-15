import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddBusiness: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenAddBusiness
}) => {
  const getTabTitles = () => {
    switch (activeTab) {
      case 'appointments':
        return {
          title: 'Patient Appointments',
          subtitle: 'Healthcare schedules, doctor assignments & AI clinical triage'
        };
      case 'dispatches':
        return {
          title: 'Field Work Orders',
          subtitle: 'Emergency trade dispatches, technician routes & parts'
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
          title: 'Businesses & Tenants',
          subtitle: 'Centralized monitor for medical clinics and field trade services'
        };
    }
  };

  const { title, subtitle } = getTabTitles();

  return (
    <header className="topbar" id="app-topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        {/* Clean Pill Search Bar */}
        <div className="search-bar">
          <Search size={15} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search businesses, records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="global-search-input"
          />
        </div>

        {/* Single Primary Action Button (No duplicates!) */}
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
