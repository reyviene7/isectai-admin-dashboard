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
import { ArchitectureView } from './components/ArchitectureView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { LoginView } from './components/LoginView';
import { StaffManagementView } from './components/StaffManagementView';
import { AddStaffModal } from './components/AddStaffModal';
import { SkeletonView } from './components/SkeletonLoader';
import { ActionLoadingOverlay } from './components/ActionLoadingOverlay';
import { api } from './lib/api';
import { testSupabaseConnection, getSupabaseClient } from './lib/supabase';
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
      // 1. Check persistent localStorage (user checked "Remember me")
      const storedLocal = localStorage.getItem('isectai_current_user');
      if (storedLocal) return JSON.parse(storedLocal);

      // 2. Check session-only sessionStorage (user unchecked "Remember me")
      const storedSession = sessionStorage.getItem('isectai_current_user');
      if (storedSession) return JSON.parse(storedSession);

      return null;
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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Skeleton loading state for slow internet / initial data fetch
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Action loading spinner overlay state ("Signing you in...", "Adding...", etc.)
  const [actionLoading, setActionLoading] = useState<{
    isLoading: boolean;
    title: string;
    subtitle?: string;
  }>({
    isLoading: false,
    title: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsDataLoading(true);
    try {
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
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Recover active Supabase Auth session on app reload
  useEffect(() => {
    if (!currentUser) {
      api.getCurrentSessionUser().then((sessionUser) => {
        if (sessionUser) {
          setCurrentUser(sessionUser);
        }
      });
    }
  }, [currentUser]);

  // Automatically refresh cloud data whenever currentUser logs in or recovers
  useEffect(() => {
    if (currentUser) {
      loadData(true);
    }
  }, [currentUser, loadData]);

  // Real-time synchronization for clinical appointments via Supabase postgres_changes
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('appointments-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('[Realtime] appointments table change:', payload.eventType);
          api.getAppointments().then((res) => {
            setAppointments(res.data);
          });
          api.getDashboardMetrics().then(setMetrics);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = (user: UserAccount, rememberMe: boolean = true) => {
    setCurrentUser(user);
    try {
      if (rememberMe) {
        localStorage.setItem('isectai_current_user', JSON.stringify(user));
        sessionStorage.removeItem('isectai_current_user');
      } else {
        sessionStorage.setItem('isectai_current_user', JSON.stringify(user));
        localStorage.removeItem('isectai_current_user');
      }
    } catch (e) {
      console.warn('Session persistence error:', e);
    }

    // Immediately reload all data from live cloud with the authenticated JWT session
    loadData(true);

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

  const handleLogout = async () => {
    setActionLoading({
      isLoading: true,
      title: 'Signing you out… please wait.',
      subtitle: 'Safely terminating encrypted session credentials...'
    });
    try {
      await api.logout();
    } catch (e) {
      console.warn('API logout error:', e);
    }
    await new Promise((r) => setTimeout(r, 600));
    setCurrentUser(null);
    try {
      localStorage.removeItem('isectai_current_user');
      sessionStorage.removeItem('isectai_current_user');
    } catch (e) {
      console.warn('Session cleanup error:', e);
    }
    setActionLoading({ isLoading: false, title: '' });
    showToast('Signed out successfully.');
  };

  const handleSimulateCall = async (tenant: Tenant, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading({
      isLoading: true,
      title: 'Simulating AI call… please wait.',
      subtitle: `Connecting autonomous AI receptionist for ${tenant.name}...`
    });
    try {
      await api.simulateAICall(tenant);
      await loadData();

      const isMedical = tenant.industry === 'medical_clinic';
      const detail = isMedical ? 'New Clinical Appointment' : 'Emergency Field Dispatch';
      showToast(`⚡ AI Auto-Booked: ${detail} for ${tenant.name}`);
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleAddAppointment = async (newAppt: Omit<Appointment, 'id' | 'created_at'>) => {
    setActionLoading({
      isLoading: true,
      title: 'Adding appointment… please wait.',
      subtitle: 'Reserving clinical schedule slot and notifying patient...'
    });
    try {
      const created = await api.createAppointment(newAppt);
      setAppointments((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      showToast(`Booked appointment: ${created.appointment_type}`);
      api.getDashboardMetrics().then(setMetrics);
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setActionLoading({
      isLoading: true,
      title: 'Updating appointment… please wait.',
      subtitle: 'Synchronizing clinical records and schedule...'
    });
    try {
      const updated = await api.updateAppointment(id, updates);
      if (updated) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
        showToast(`Updated appointment: ${updated.appointment_type}`);
        api.getDashboardMetrics().then(setMetrics);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setActionLoading({
      isLoading: true,
      title: 'Removing appointment… please wait.',
      subtitle: 'Releasing schedule slot in database...'
    });
    try {
      const success = await api.deleteAppointment(id);
      if (success) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        showToast('Appointment removed from schedule');
        api.getDashboardMetrics().then(setMetrics);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleAddServiceJob = async (newJob: Omit<ServiceJob, 'id' | 'created_at'>) => {
    setActionLoading({
      isLoading: true,
      title: 'Creating work order… please wait.',
      subtitle: 'Dispatching field technician and synchronizing database...'
    });
    try {
      const created = await api.createServiceJob(newJob);
      setServiceJobs((prev) => [created, ...prev.filter((j) => j.id !== created.id)]);
      showToast(`⚡ Created work order: ${created.service_type}`);
      api.getDashboardMetrics().then(setMetrics);
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleUpdateServiceJob = async (id: string, updates: Partial<ServiceJob>) => {
    setActionLoading({
      isLoading: true,
      title: 'Updating work order… please wait.',
      subtitle: 'Saving work order updates in database...'
    });
    try {
      const updated = await api.updateServiceJob(id, updates);
      if (updated) {
        setServiceJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
        showToast(`Updated work order: ${updated.service_type}`);
        api.getDashboardMetrics().then(setMetrics);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleDeleteServiceJob = async (id: string) => {
    setActionLoading({
      isLoading: true,
      title: 'Removing work order… please wait.',
      subtitle: 'Releasing technician dispatch from database...'
    });
    try {
      const targetJob = serviceJobs.find((j) => j.id === id);
      const success = await api.deleteServiceJob(id);
      if (success) {
        setServiceJobs((prev) => prev.filter((j) => j.id !== id));
        showToast(`Removed work order: ${targetJob?.service_type || 'Job'}`);
        api.getDashboardMetrics().then(setMetrics);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleAddTenant = async (newTenantData: Omit<Tenant, 'id' | 'created_at'>) => {
    setActionLoading({
      isLoading: true,
      title: 'Adding business… please wait.',
      subtitle: 'Provisioning multi-tenant database partitions & AI agent...'
    });
    try {
      const created = await api.createTenant(newTenantData);
      await loadData();
      showToast(`🎉 "${created.name}" onboarded successfully!`);
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleUpdateTenant = async (id: string, updates: Partial<Tenant>) => {
    setActionLoading({
      isLoading: true,
      title: 'Updating business… please wait.',
      subtitle: 'Saving business profile & operational parameters...'
    });
    try {
      const updated = await api.updateTenant(id, updates);
      if (updated) {
        await loadData();
        setSelectedTenant(updated);
        showToast(`Updated "${updated.name}"`);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleDeleteTenant = async (id: string) => {
    setActionLoading({
      isLoading: true,
      title: 'Removing business… please wait.',
      subtitle: 'Cascading deletion of records from database...'
    });
    try {
      const targetTenant = tenants.find((t) => t.id === id);
      const success = await api.deleteTenant(id);
      if (success) {
        setSelectedTenant(null);
        await loadData();
        showToast(`Removed "${targetTenant?.name || 'Business'}"`);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleAddStaff = async (newUserData: Omit<UserAccount, 'id' | 'created_at'>) => {
    setActionLoading({
      isLoading: true,
      title: 'Adding staff member… please wait.',
      subtitle: 'Provisioning team credentials and assigning clinic practice...'
    });
    try {
      const created = await api.createStaffUser(newUserData);
      const updatedUsers = await api.getUsers();
      setUsers(updatedUsers.data);
      showToast(`🎉 Staff account created for ${created.full_name}!`);
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<UserAccount>) => {
    setActionLoading({
      isLoading: true,
      title: 'Updating staff account… please wait.',
      subtitle: 'Saving account profile updates...'
    });
    try {
      const updated = await api.updateUser(id, updates);
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        showToast(`Updated staff account: ${updated.full_name}`);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setActionLoading({
      isLoading: true,
      title: 'Removing staff account… please wait.',
      subtitle: 'Revoking permissions & deleting user credentials...'
    });
    try {
      const targetUser = users.find((u) => u.id === id);
      const success = await api.deleteUser(id);
      if (success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        showToast(`Removed staff account: ${targetUser?.full_name || 'User'}`);
      }
    } finally {
      setActionLoading({ isLoading: false, title: '' });
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
  };

  // If not logged in, render the Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
          {isDataLoading ? (
            <SkeletonView activeTab={activeTab} />
          ) : (
            <>
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
                  onAddAppointment={handleAddAppointment}
                  onUpdateAppointment={handleUpdateAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onRefresh={loadData}
                  searchQuery={searchQuery}
                />
              )}

              {/* TAB 3: FIELD DISPATCHES */}
              {activeTab === 'dispatches' && (
                <DispatchesView
                  serviceJobs={visibleServiceJobs}
                  tenants={visibleTenants}
                  onSelectTenant={(t) => setSelectedTenant(t)}
                  onAddServiceJob={handleAddServiceJob}
                  onUpdateServiceJob={handleUpdateServiceJob}
                  onDeleteServiceJob={handleDeleteServiceJob}
                  searchQuery={searchQuery}
                />
              )}

              {/* TAB 4: AI TELEMETRY */}
              {activeTab === 'telemetry' && (
                <AITelemetryView
                  logs={visibleAiLogs}
                  tenants={visibleTenants}
                  searchQuery={searchQuery}
                />
              )}

              {/* TAB 5: STAFF & TEAM MANAGEMENT (Admin Only) */}
              {activeTab === 'staff' && currentUser.role === 'platform_admin' && (
                <StaffManagementView
                  users={users}
                  tenants={tenants}
                  onOpenAddStaff={() => setShowAddStaffModal(true)}
                  currentUser={currentUser}
                  onUpdateStaff={handleUpdateStaff}
                  onDeleteStaff={handleDeleteStaff}
                  searchQuery={searchQuery}
                />
              )}

              {/* TAB 6: ARCHITECTURE & DATABASE SPECIFICATION */}
              {activeTab === 'architecture' && (
                <ArchitectureView />
              )}
            </>
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
          onUpdateTenant={handleUpdateTenant}
          onDeleteTenant={handleDeleteTenant}
          isAdmin={currentUser.role === 'platform_admin'}
        />
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

      {/* Action Loading Overlay Spinner ("Signing you in...", "Signing you out...", "Adding...", etc.) */}
      {actionLoading.isLoading && (
        <ActionLoadingOverlay
          title={actionLoading.title}
          subtitle={actionLoading.subtitle}
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
