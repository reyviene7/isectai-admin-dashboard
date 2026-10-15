import React, { useState } from 'react';
import { LayoutGrid, List, Search, Building, Stethoscope, Wrench, ArrowUpRight } from 'lucide-react';
import type { Tenant, AIAgent, Appointment, ServiceJob } from '../lib/types';
import { BusinessCard } from './BusinessCard';

interface BusinessListProps {
  tenants: Tenant[];
  agents: AIAgent[];
  appointments: Appointment[];
  serviceJobs: ServiceJob[];
  onSelectTenant: (tenant: Tenant) => void;
  onSimulateCall: (tenant: Tenant, e: React.MouseEvent) => void;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  tenants,
  agents,
  appointments,
  serviceJobs,
  onSelectTenant,
  onSimulateCall
}) => {
  const [filter, setFilter] = useState<'all' | 'medical_clinic' | 'service_business' | 'enterprise'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const medicalCount = tenants.filter((t) => t.industry === 'medical_clinic').length;
  const serviceCount = tenants.filter((t) => t.industry === 'service_business').length;
  const enterpriseCount = tenants.filter((t) => t.subscription_tier === 'enterprise').length;

  const filteredTenants = tenants.filter((tenant) => {
    // Filter pill matching
    if (filter === 'medical_clinic' && tenant.industry !== 'medical_clinic') return false;
    if (filter === 'service_business' && tenant.industry !== 'service_business') return false;
    if (filter === 'enterprise' && tenant.subscription_tier !== 'enterprise') return false;

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tenant.name.toLowerCase().includes(q);
      const matchCity = tenant.city.toLowerCase().includes(q);
      const matchState = tenant.state.toLowerCase().includes(q);
      const matchEmail = tenant.email.toLowerCase().includes(q);
      return matchName || matchCity || matchState || matchEmail;
    }

    return true;
  });

  return (
    <div className="businesses-section" id="businesses-section">
      {/* Pinterest-Style Toolbar & Filters */}
      <div className="toolbar-container">
        <div className="filter-pills-group">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            id="filter-all-btn"
          >
            <span>All Businesses</span>
            <span className="filter-count">{tenants.length}</span>
          </button>

          <button
            className={`filter-pill ${filter === 'medical_clinic' ? 'active' : ''}`}
            onClick={() => setFilter('medical_clinic')}
            id="filter-medical-btn"
          >
            <Stethoscope size={14} />
            <span>Medical Clinics</span>
            <span className="filter-count">{medicalCount}</span>
          </button>

          <button
            className={`filter-pill ${filter === 'service_business' ? 'active' : ''}`}
            onClick={() => setFilter('service_business')}
            id="filter-service-btn"
          >
            <Wrench size={14} />
            <span>Field Services</span>
            <span className="filter-count">{serviceCount}</span>
          </button>

          <button
            className={`filter-pill ${filter === 'enterprise' ? 'active' : ''}`}
            onClick={() => setFilter('enterprise')}
            id="filter-enterprise-btn"
          >
            <span>Enterprise Tier</span>
            <span className="filter-count">{enterpriseCount}</span>
          </button>
        </div>

        {/* Search & View Switcher */}
        <div className="toolbar-right">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search clinics & businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="business-search-input"
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Bento Grid View"
              id="view-grid-btn"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              id="view-table-btn"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Render View */}
      {filteredTenants.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}
        >
          <Building size={40} style={{ opacity: 0.4, margin: '0 auto 16px' }} />
          <h3>No businesses match your criteria</h3>
          <p style={{ marginTop: 8, fontSize: '0.9rem' }}>
            Try modifying your search or clearing the active filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="bento-grid">
          {filteredTenants.map((tenant) => {
            const agent = agents.find((a) => a.tenant_id === tenant.id);
            const apptsCount = appointments.filter((a) => a.tenant_id === tenant.id).length;
            const jobsCount = serviceJobs.filter((j) => j.tenant_id === tenant.id).length;

            return (
              <BusinessCard
                key={tenant.id}
                tenant={tenant}
                agent={agent}
                appointmentsCount={apptsCount}
                serviceJobsCount={jobsCount}
                onSelect={onSelectTenant}
                onSimulateCall={onSimulateCall}
              />
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>AI Agent Model</th>
                <th>Status</th>
                <th>Records</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => {
                const agent = agents.find((a) => a.tenant_id === tenant.id);
                const isMedical = tenant.industry === 'medical_clinic';
                const count = isMedical
                  ? appointments.filter((a) => a.tenant_id === tenant.id).length
                  : serviceJobs.filter((j) => j.tenant_id === tenant.id).length;

                return (
                  <tr key={tenant.id} style={{ cursor: 'pointer' }} onClick={() => onSelectTenant(tenant)}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{tenant.name}</td>
                    <td>
                      <span className={`industry-pill ${isMedical ? 'medical' : 'service'}`}>
                        {isMedical ? 'Medical Clinic' : 'Field Service'}
                      </span>
                    </td>
                    <td>
                      {tenant.city}, {tenant.state}
                    </td>
                    <td>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        {agent?.llm_model || 'gpt-4o'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#6ee7b7'
                        }}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td>
                      {count} {isMedical ? 'Appts' : 'Jobs'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTenant(tenant);
                        }}
                      >
                        <span>Details</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
