import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { BusinessList } from './components/BusinessList';
import { BusinessDetailDrawer } from './components/BusinessDetailDrawer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { api } from './lib/api';
import { testSupabaseConnection } from './lib/supabase';
import type {
  Tenant,
  AIAgent,
  Appointment,
  ServiceJob,
  AIActivityLog,
  DashboardMetrics
} from './lib/types';
import { MapPin, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [aiLogs, setAiLogs] = useState<AIActivityLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBusinesses: 0,
    activeMedicalClinics: 0,
    activeServiceBusinesses: 0,
    totalAppointments: 0,
    totalServiceJobs: 0,
    totalAiCalls: 0,
    totalTokensConsumed: 0,
    aiAutomationRate: 94
  });

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    // Check connection first
    const testResult = await testSupabaseConnection();
    setIsLiveSupabase(testResult.success);
    setLatencyMs(testResult.latencyMs);

    const [tenantsRes, agentsRes, apptsRes, jobsRes, logsRes, metricsRes] = await Promise.all([
      api.getTenants(),
      api.getAIAgents(),
      api.getAppointments(),
      api.getServiceJobs(),
      api.getAILogs(),
      api.getDashboardMetrics()
    ]);

    setTenants(tenantsRes.data);
    setAgents(agentsRes.data);
    setAppointments(apptsRes.data);
    setServiceJobs(jobsRes.data);
    setAiLogs(logsRes.data);
    setMetrics(metricsRes);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSimulateCall = async (tenant: Tenant, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.simulateAICall(tenant);
    await loadData();

    const isMedical = tenant.industry === 'medical_clinic';
    const detail = isMedical ? 'New Clinical Appointment' : 'Priority Emergency Dispatch';
    showToast(`⚡ AI Autonomous Action: ${detail} booked for ${tenant.name}!`);
  };

  const handleAddTenant = async (newTenantData: Omit<Tenant, 'id' | 'created_at'>) => {
    const created = await api.createTenant(newTenantData);
    await loadData();
    showToast(`🎉 Tenant "${created.name}" successfully onboarded!`);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        onOpenArchitecture={() => setShowArchitecture(true)}
        onOpenConfig={() => setShowConfig(true)}
        onOpenAddBusiness={() => setShowAddBusiness(true)}
        isLiveSupabase={isLiveSupabase}
        latencyMs={latencyMs}
      />

      {/* Dashboard Header */}
      <header className="dashboard-header" id="dashboard-header">
        <div className="header-top">
          <div className="header-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="client-location-tag">
                <MapPin size={12} color="#06b6d4" />
                <span>New York Headquarters</span>
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                  fontWeight: 600
                }}
              >
                Multi-Tenant Architecture Prototype
              </span>
            </div>

            <h1>Enterprise Central Administration</h1>
            <p>
              Centralized platform orchestrating AI-powered voice reception, triage pre-screening, and
              autonomous dispatch operations across medical clinics and commercial service businesses.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowArchitecture(true)}
              id="view-whitepaper-btn"
            >
              <span>Architecture Whitepaper</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddBusiness(true)}
              id="header-onboard-btn"
            >
              <span>+ Onboard Business</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bento Metric KPI Cards */}
      <MetricCards metrics={metrics} />

      {/* Pinterest-Inspired Bento Grid & Table of Businesses */}
      <BusinessList
        tenants={tenants}
        agents={agents}
        appointments={appointments}
        serviceJobs={serviceJobs}
        onSelectTenant={(tenant) => setSelectedTenant(tenant)}
        onSimulateCall={handleSimulateCall}
      />

      {/* Slide-over Detail Drawer */}
      {selectedTenant && (
        <BusinessDetailDrawer
          tenant={selectedTenant}
          agent={agents.find((a) => a.tenant_id === selectedTenant.id)}
          appointments={appointments}
          serviceJobs={serviceJobs}
          aiLogs={aiLogs}
          onClose={() => setSelectedTenant(null)}
          onSimulateCall={(tenant) => handleSimulateCall(tenant)}
        />
      )}

      {/* Architecture & Evaluation Modal */}
      {showArchitecture && <ArchitectureModal onClose={() => setShowArchitecture(false)} />}

      {/* Supabase Connection Config Modal */}
      {showConfig && (
        <SupabaseConfigModal
          onClose={() => setShowConfig(false)}
          onConfigSaved={() => {
            loadData();
            showToast('✅ Supabase configuration saved and updated.');
          }}
        />
      )}

      {/* Add Business Modal */}
      {showAddBusiness && (
        <AddBusinessModal
          onClose={() => setShowAddBusiness(false)}
          onAdd={handleAddTenant}
        />
      )}

      {/* Floating Interactive Toast */}
      {toastMessage && (
        <div className="toast" id="interactive-toast">
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
