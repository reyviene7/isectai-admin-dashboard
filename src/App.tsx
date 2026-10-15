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
import { LoginView } from './components/LoginView';
import { StaffManagementView } from './components/StaffManagementView';
import { AddStaffModal } from './components/AddStaffModal';
import { api } from './lib/api';
import { testSupabaseConnection } from './lib/supabase';
import type {
  Tenant,
  AIAgent,
  Appointment,
  ServiceJob,
  AIActivityLog,
  DashboardMetrics,
  UserAccount
} from './lib/types';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('isectai_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [aiLogs, setAiLogs] = useState<AIActivityLog[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
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
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
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

    const [tenantsRes, agentsRes, apptsRes, jobsRes, logsRes, usersRes, metricsRes] = await Promise.all([
      api.getTenants(),
      api.getAIAgents(),
      api.getAppointments(),
      api.getServiceJobs(),
      api.getAILogs(),
      api.getUsers(),
      api.getDashboardMetrics()
    ]);

    setTenants(tenantsRes.data);
    setAgents(agentsRes.data);
    setAppointments(apptsRes.data);
    setServiceJobs(jobsRes.data);
    setAiLogs(logsRes.data);
    setUsers(usersRes.data);
    setMetrics(metricsRes);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('isectai_current_user', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }

    if (user.role === 'business_staff') {
      const userTenant = tenants.find((t) => t.id === user.tenant_id);
      if (userTenant?.industry === 'medical_clinic') {
        setActiveTab('appointments');
      } else {
        setActiveTab('dispatches');
      }
      showToast(`Signed in as ${user.full_name} (${userTenant?.name || 'Staff Access'})`);
    } else {
      setActiveTab('overview');
      showToast(`Welcome back, ${user.full_name} (Platform Admin)`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('isectai_current_user');
    } catch (e) {
      console.warn(e);
    }
    showToast('Signed out successfully.');
  };

  const handleSimulateCall = async (tenant: Tenant, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.simulateAICall(tenant);
    await loadData();

    const isMedical = tenant.industry === 'medical_clinic';
    const detail = isMedical ? 'New Clinical Appointment' : 'Emergency Field Dispatch';
    showToast(`⚡ AI Auto-Booked: ${detail} for ${tenant.name}`);
  };

  const handleAddTenant = async (newTenantData: Omit<Tenant, 'id' | 'created_at'>) => {
    const created = await api.createTenant(newTenantData);
    await loadData();
    showToast(`🎉 "${created.name}" onboarded successfully!`);
  };

  const handleAddStaff = async (newUserData: Omit<UserAccount, 'id' | 'created_at'>) => {
    const created = await api.createStaffUser(newUserData);
    const updatedUsers = await api.getUsers();
    setUsers(updatedUsers.data);
    showToast(`🎉 Staff account created for ${created.full_name}!`);
  };

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'architecture') {
      setShowArchitectureModal(true);
    } else {
      setActiveTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginView onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
        {toastMessage && (
          <div className="clean-toast" id="interactive-toast">
            <CheckCircle2 size={16} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  const isStaff = currentUser.role === 'business_staff';
  const assignedTenant = tenants.find((t) => t.id === currentUser.tenant_id);

  // Scoped data for staff accounts
  const visibleAppointments = isStaff && currentUser.tenant_id
    ? appointments.filter((a) => a.tenant_id === currentUser.tenant_id)
    : appointments;

  const visibleServiceJobs = isStaff && currentUser.tenant_id
    ? serviceJobs.filter((j) => j.tenant_id === currentUser.tenant_id)
    : serviceJobs;

  const visibleTenants = isStaff && currentUser.tenant_id
    ? tenants.filter((t) => t.id === currentUser.tenant_id)
    : tenants;

  const visibleAiLogs = isStaff && currentUser.tenant_id
    ? aiLogs.filter((l) => l.tenant_id === currentUser.tenant_id)
    : aiLogs;

  return (
    <div className="app-shell" id="app-root-shell">
      {/* Left Sidebar (Desktop permanent, Mobile slide-in drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLiveSupabase={isLiveSupabase}
        latencyMs={latencyMs}
        onOpenConfig={() => {
          if (currentUser.role === 'platform_admin') {
            setShowConfigModal(true);
          } else {
            showToast('🔒 Access restricted: Only Platform Admin can edit database configuration.');
          }
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalAppts={visibleAppointments.length}
        totalJobs={visibleServiceJobs.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        tenants={tenants}
      />

      {/* Main Content Canvas */}
      <main className="main-canvas" id="app-main-canvas">
        {/* Top Header Bar with Mobile Menu Toggle & Search */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddBusiness={() => {
            if (currentUser.role === 'platform_admin') {
              setShowAddBusinessModal(true);
            } else {
              showToast('🔒 Only Platform Admin has permission to onboard new businesses.');
            }
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          currentUser={currentUser}
          assignedTenant={assignedTenant}
        />

        {/* Canvas Body */}
        <div className="canvas-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <MetricCards metrics={metrics} />
              <BusinessList
                tenants={visibleTenants}
                agents={agents}
                appointments={visibleAppointments}
                serviceJobs={visibleServiceJobs}
                searchQuery={searchQuery}
                onSelectTenant={(t) => setSelectedTenant(t)}
                onSimulateCall={handleSimulateCall}
              />
            </>
          )}

          {/* TAB 2: APPOINTMENTS WITH INTERACTIVE CALENDAR SCHEDULE */}
          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={visibleAppointments}
              tenants={visibleTenants}
              onSelectTenant={(t) => setSelectedTenant(t)}
              onSimulateCall={(t) => handleSimulateCall(t)}
            />
          )}

          {/* TAB 3: FIELD DISPATCHES */}
          {activeTab === 'dispatches' && (
            <DispatchesView
              serviceJobs={visibleServiceJobs}
              tenants={visibleTenants}
              onSelectTenant={(t) => setSelectedTenant(t)}
            />
          )}

          {/* TAB 4: AI TELEMETRY */}
          {activeTab === 'telemetry' && (
            <AITelemetryView logs={visibleAiLogs} tenants={visibleTenants} />
          )}

          {/* TAB 5: STAFF & TEAM MANAGEMENT (Admin Only) */}
          {activeTab === 'staff' && currentUser.role === 'platform_admin' && (
            <StaffManagementView
              users={users}
              tenants={tenants}
              onOpenAddStaff={() => setShowAddStaffModal(true)}
              currentUser={currentUser}
            />
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

      {/* Supabase Connection Modal (Admin only) */}
      {showConfigModal && (
        <SupabaseConfigModal
          onClose={() => setShowConfigModal(false)}
          onConfigSaved={() => {
            loadData();
            showToast('✅ Supabase connected & verified.');
          }}
        />
      )}

      {/* Add Business Modal (Admin only) */}
      {showAddBusinessModal && (
        <AddBusinessModal
          onClose={() => setShowAddBusinessModal(false)}
          onAdd={handleAddTenant}
        />
      )}

      {/* Add Staff Modal (Admin only) */}
      {showAddStaffModal && (
        <AddStaffModal
          tenants={tenants}
          onClose={() => setShowAddStaffModal(false)}
          onAddStaff={handleAddStaff}
        />
      )}

      {/* Floating Toast Notification */}
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
