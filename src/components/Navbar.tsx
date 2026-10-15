import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenArchitecture: () => void;
  onOpenConfig: () => void;
  onOpenAddBusiness: () => void;
  isLiveSupabase: boolean;
  latencyMs?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenArchitecture,
  onOpenConfig,
  onOpenAddBusiness,
  isLiveSupabase,
  latencyMs
}) => {

  return (
    <nav className="navbar" id="main-navigation">
      <div className="nav-brand">
        <div className="brand-badge">iS</div>
        <div>
          <div className="brand-title">
            iSectAI
            <span className="brand-pill">Internal Admin</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Database Status Button */}
        <button
          className={`db-status-badge ${isLiveSupabase ? 'live' : 'demo'}`}
          onClick={onOpenConfig}
          title="Click to view database connection details or enter Supabase credentials"
          id="db-status-button"
        >
          <span className={`status-dot ${isLiveSupabase ? 'green' : 'yellow'}`} />
          {isLiveSupabase ? (
            <span>Supabase Cloud ({latencyMs ? `${latencyMs}ms` : 'Connected'})</span>
          ) : (
            <span>Local DB Demo (Click to Link Supabase)</span>
          )}
        </button>

        {/* Architecture & Evaluation Review Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenArchitecture}
          id="open-architecture-button"
        >
          <ShieldCheck size={16} color="#6366f1" />
          <span>Architecture & RLS</span>
        </button>

        {/* Add Business Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenAddBusiness}
          id="add-business-button"
        >
          <Plus size={16} />
          <span>Add Business</span>
        </button>
      </div>
    </nav>
  );
};
