import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { BusinessList } from './components/BusinessList';
import { AppointmentsView } from './components/AppointmentsView';
import { DispatchesView } from './components/DispatchesView';
import { AITelemetryView } from './components/AITelemetryView';
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
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async () => {
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

  // Sync theme attribute to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSimulateCall = async (tenant: Tenant, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.simulateAICall(tenant);
    await loadData();

    const isMedical = tenant.industry === 'medical_clinic';
    const detail = isMedical ? 'New Appointment' : 'Emergency Dispatch';
    showToast(`⚡ AI Auto-Booked: ${detail} for ${tenant.name}`);
  };

  const handleAddTenant = async (newTenantData: Omit<Tenant, 'id' | 'created_at'>) => {
    const created = await api.createTenant(newTenantData);
    await loadData();
    showToast(`🎉 "${created.name}" onboarded successfully!`);
  };

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'architecture') {
      setShowArchitectureModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="app-shell" id="app-root-shell">
      {/* Left Sidebar matching sample10.jpg & sample1.jpg */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLiveSupabase={isLiveSupabase}
        latencyMs={latencyMs}
        onOpenConfig={() => setShowConfigModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalAppts={appointments.length}
        totalJobs={serviceJobs.length}
      />

      {/* Main Content Canvas */}
      <main className="main-canvas" id="app-main-canvas">
        {/* Top Header Bar with Search & Single Action Button */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddBusiness={() => setShowAddBusinessModal(true)}
        />

        {/* Canvas Body */}
        <div className="canvas-body">
          {/* Streamlined KPI Cards */}
          <MetricCards metrics={metrics} />

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <BusinessList
              tenants={tenants}
              agents={agents}
              appointments={appointments}
              serviceJobs={serviceJobs}
              searchQuery={searchQuery}
              onSelectTenant={(t) => setSelectedTenant(t)}
              onSimulateCall={handleSimulateCall}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              tenants={tenants}
              onSelectTenant={(t) => setSelectedTenant(t)}
            />
          )}

          {activeTab === 'dispatches' && (
            <DispatchesView
              serviceJobs={serviceJobs}
              tenants={tenants}
              onSelectTenant={(t) => setSelectedTenant(t)}
            />
          )}

          {activeTab === 'telemetry' && (
            <AITelemetryView logs={aiLogs} tenants={tenants} />
          )}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      {selectedTenant && (
        <BusinessDetailDrawer
          tenant={selectedTenant}
          agent={agents.find((a) => a.tenant_id === selectedTenant.id)}
          appointments={appointments}
          serviceJobs={serviceJobs}
          aiLogs={aiLogs}
          onClose={() => setSelectedTenant(null)}
          onSimulateCall={(t) => handleSimulateCall(t)}
        />
      )}

      {/* Architecture & RLS Modal */}
      {showArchitectureModal && (
        <ArchitectureModal onClose={() => setShowArchitectureModal(false)} />
      )}

      {/* Supabase Connection Modal */}
      {showConfigModal && (
        <SupabaseConfigModal
          onClose={() => setShowConfigModal(false)}
          onConfigSaved={() => {
            loadData();
            showToast('✅ Supabase connected & verified.');
          }}
        />
      )}

      {/* Add Business Modal */}
      {showAddBusinessModal && (
        <AddBusinessModal
          onClose={() => setShowAddBusinessModal(false)}
          onAdd={handleAddTenant}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="clean-toast" id="interactive-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
