import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Stethoscope, Wrench, ArrowRight } from 'lucide-react';
import type { Tenant, AIAgent, Appointment, ServiceJob } from '../lib/types';
import { BusinessCard } from './BusinessCard';
import { Pagination } from './Pagination';

interface BusinessListProps {
  tenants: Tenant[];
  agents: AIAgent[];
  appointments: Appointment[];
  serviceJobs: ServiceJob[];
  searchQuery: string;
  onSelectTenant: (tenant: Tenant) => void;
  onSimulateCall: (tenant: Tenant, e: React.MouseEvent) => void;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  tenants,
  agents,
  appointments,
  serviceJobs,
  searchQuery,
  onSelectTenant,
  onSimulateCall
}) => {
  const [filter, setFilter] = useState<'all' | 'medical_clinic' | 'service_business'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const medicalCount = tenants.filter((t) => t.industry === 'medical_clinic').length;
  const serviceCount = tenants.filter((t) => t.industry === 'service_business').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const filteredTenants = tenants.filter((tenant) => {
    if (filter === 'medical_clinic' && tenant.industry !== 'medical_clinic') return false;
    if (filter === 'service_business' && tenant.industry !== 'service_business') return false;

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tenant.name.toLowerCase().includes(q) ||
        tenant.city.toLowerCase().includes(q) ||
        tenant.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Clean Toolbar */}
      <div className="content-toolbar">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            id="filter-pill-all"
          >
            <span>All Businesses</span>
            <span className="filter-pill-count">{tenants.length}</span>
          </button>

          <button
            className={`filter-btn ${filter === 'medical_clinic' ? 'active' : ''}`}
            onClick={() => setFilter('medical_clinic')}
            id="filter-pill-medical"
          >
            <Stethoscope size={14} />
            <span>Medical Clinics</span>
            <span className="filter-pill-count">{medicalCount}</span>
          </button>

          <button
            className={`filter-btn ${filter === 'service_business' ? 'active' : ''}`}
            onClick={() => setFilter('service_business')}
            id="filter-pill-service"
          >
            <Wrench size={14} />
            <span>Field Services</span>
            <span className="filter-pill-count">{serviceCount}</span>
          </button>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className={`btn-clean-secondary ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'grid' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            title="Grid View"
            id="view-mode-grid"
          >
            <LayoutGrid size={15} />
            <span>Grid</span>
          </button>

          <button
            className={`btn-clean-secondary ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              background: viewMode === 'table' ? 'var(--primary-soft)' : 'var(--bg-shell)',
              color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
            title="Table View"
            id="view-mode-table"
          >
            <List size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Render View */}
      {filteredTenants.length === 0 ? (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            background: 'var(--bg-shell)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No businesses match your search.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="business-grid">
            {paginatedTenants.map((tenant) => {
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTenants.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="businesses"
            isStandalone={true}
          />
        </>
      ) : (
        <div className="clean-table-card">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Domain</th>
                <th>Location</th>
                <th>AI Agent Model</th>
                <th>Records</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTenants.map((tenant) => {
                const agent = agents.find((a) => a.tenant_id === tenant.id);
                const isMedical = tenant.industry === 'medical_clinic';
                const count = isMedical
                  ? appointments.filter((a) => a.tenant_id === tenant.id).length
                  : serviceJobs.filter((j) => j.tenant_id === tenant.id).length;

                return (
                  <tr
                    key={tenant.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectTenant(tenant)}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tenant.name}</td>
                    <td>
                      <span className={`badge-clean ${isMedical ? 'badge-medical' : 'badge-service'}`}>
                        {isMedical ? 'Medical' : 'Trades'}
                      </span>
                    </td>
                    <td>
                      {tenant.city}, {tenant.state}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {agent?.llm_model || 'gpt-4o'}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {count} {isMedical ? 'Appts' : 'Jobs'}
                    </td>
                    <td>
                      <span className="badge-clean badge-success">{tenant.status}</span>
                    </td>
                    <td>
                      <span className="view-link">
                        <span>Details</span>
                        <ArrowRight size={14} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTenants.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="businesses"
          />
        </div>
      )}
    </div>
  );
};
