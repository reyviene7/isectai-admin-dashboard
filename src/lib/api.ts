import { getSupabaseClient } from './supabase';
import type {
  Tenant,
  Appointment,
  ServiceJob,
  AIAgent,
  AIActivityLog,
  Contact,
  DashboardMetrics
} from './types';
import {
  INITIAL_TENANTS,
  INITIAL_APPOINTMENTS,
  INITIAL_SERVICE_JOBS,
  INITIAL_AI_AGENTS,
  INITIAL_AI_LOGS,
  INITIAL_CONTACTS
} from '../data/mockData';

// Local in-memory state fallback when Supabase is offline or unconfigured
let localTenants: Tenant[] = [...INITIAL_TENANTS];
let localAppointments: Appointment[] = [...INITIAL_APPOINTMENTS];
let localServiceJobs: ServiceJob[] = [...INITIAL_SERVICE_JOBS];
let localAIAgents: AIAgent[] = [...INITIAL_AI_AGENTS];
let localAILogs: AIActivityLog[] = [...INITIAL_AI_LOGS];
let localContacts: Contact[] = [...INITIAL_CONTACTS];

export interface FetchResult<T> {
  data: T;
  source: 'supabase_cloud' | 'local_demo';
  error?: string;
}

export const api = {
  async getTenants(): Promise<FetchResult<Tenant[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local dataset:', err);
      }
    }
    return { data: localTenants, source: 'local_demo' };
  },

  async getTenantById(id: string): Promise<FetchResult<Tenant | null>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase single tenant query failed:', err);
      }
    }
    const found = localTenants.find((t) => t.id === id) || null;
    return { data: found, source: 'local_demo' };
  },

  async getAppointments(tenantId?: string): Promise<FetchResult<Appointment[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('appointments')
          .select('*')
          .order('scheduled_start', { ascending: true });

        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase appointments query failed:', err);
      }
    }
    const filtered = tenantId
      ? localAppointments.filter((a) => a.tenant_id === tenantId)
      : localAppointments;
    return { data: filtered, source: 'local_demo' };
  },

  async getServiceJobs(tenantId?: string): Promise<FetchResult<ServiceJob[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('service_jobs')
          .select('*')
          .order('scheduled_for', { ascending: true });

        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase service_jobs query failed:', err);
      }
    }
    const filtered = tenantId
      ? localServiceJobs.filter((j) => j.tenant_id === tenantId)
      : localServiceJobs;
    return { data: filtered, source: 'local_demo' };
  },

  async getAIAgents(tenantId?: string): Promise<FetchResult<AIAgent[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('ai_agents').select('*');
        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase ai_agents query failed:', err);
      }
    }
    const filtered = tenantId
      ? localAIAgents.filter((a) => a.tenant_id === tenantId)
      : localAIAgents;
    return { data: filtered, source: 'local_demo' };
  },

  async getAILogs(tenantId?: string): Promise<FetchResult<AIActivityLog[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('ai_activity_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase ai_activity_logs query failed:', err);
      }
    }
    const filtered = tenantId
      ? localAILogs.filter((l) => l.tenant_id === tenantId)
      : localAILogs;
    return { data: filtered, source: 'local_demo' };
  },

  async getContacts(tenantId?: string): Promise<FetchResult<Contact[]>> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('contacts').select('*');
        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { data, source: 'supabase_cloud' };
        }
      } catch (err) {
        console.warn('Supabase contacts query failed:', err);
      }
    }
    const filtered = tenantId
      ? localContacts.filter((c) => c.tenant_id === tenantId)
      : localContacts;
    return { data: filtered, source: 'local_demo' };
  },

  async createTenant(newTenant: Omit<Tenant, 'id' | 'created_at'>): Promise<Tenant> {
    const generatedId = crypto.randomUUID();
    const created: Tenant = {
      ...newTenant,
      id: generatedId,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .insert([created])
          .select()
          .single();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Failed to insert tenant to Supabase, saving to local store:', err);
      }
    }

    localTenants = [created, ...localTenants];
    return created;
  },

  async simulateAICall(tenant: Tenant): Promise<{ log: AIActivityLog; record?: Appointment | ServiceJob }> {
    const isMedical = tenant.industry === 'medical_clinic';
    const timestamp = new Date().toISOString();
    const logId = crypto.randomUUID();

    if (isMedical) {
      const patientNames = ['Victoria Belmont', 'Julian Sterling', 'Maya Lin', 'Gabriel Rossi'];
      const randomPatient = patientNames[Math.floor(Math.random() * patientNames.length)];
      const log: AIActivityLog = {
        id: logId,
        tenant_id: tenant.id,
        caller_phone: '+1 (917) 555-8120',
        caller_name: randomPatient,
        event_type: 'voice_call',
        duration_seconds: 135,
        tokens_used: 2890,
        estimated_cost: 0.0433,
        sentiment: 'positive',
        summary: `Patient ${randomPatient} called with acute concern. AI triaged symptoms, checked clinical calendar, and booked an expedited exam.`,
        transcript_snippet: `Caller: "Hi, I have severe pain on my right side that started last night..." -> AI: "I'm so sorry you're hurting. Let's schedule an emergency priority consult right away."`,
        created_at: timestamp
      };

      const newAppt: Appointment = {
        id: crypto.randomUUID(),
        tenant_id: tenant.id,
        provider_name: 'Dr. Julian Vance, DDS',
        department: 'Urgent Care',
        appointment_type: 'AI Auto-Booked Emergency Triage Consult',
        scheduled_start: new Date(Date.now() + 3 * 3600000).toISOString(),
        scheduled_end: new Date(Date.now() + 4 * 3600000).toISOString(),
        status: 'confirmed',
        chief_complaint: 'Acute discomfort triaged via iSectAI Voice Agent.',
        ai_triage_summary: 'Automated live triage: Pain scale 7/10. Insurance verified active.',
        hipaa_notes_masked: '[PROTECTED MEDICAL RECORD] Insured verified. Surgical slot reserved.',
        room_number: 'Rapid Care 1',
        booked_via_ai: true,
        created_at: timestamp
      };

      localAILogs = [log, ...localAILogs];
      localAppointments = [newAppt, ...localAppointments];

      // Also attempt write to Supabase if connected
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('ai_activity_logs').insert([log]).then();
        supabase.from('appointments').insert([newAppt]).then();
      }

      return { log, record: newAppt };
    } else {
      const customerNames = ['Apex Tower Facilities', 'Brooklyn Roasting Co', 'Elena Fisher', 'Dumbo Lofts HOA'];
      const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];
      const log: AIActivityLog = {
        id: logId,
        tenant_id: tenant.id,
        caller_phone: '+1 (718) 555-4389',
        caller_name: randomCustomer,
        event_type: 'emergency_triage',
        duration_seconds: 165,
        tokens_used: 3410,
        estimated_cost: 0.0512,
        sentiment: 'urgent',
        summary: `Emergency dispatch call from ${randomCustomer}. AI determined circuit overload hazard, generated $850 bracket estimate, and dispatched technician.`,
        transcript_snippet: `Caller: "Our commercial breaker is buzzing and we lost power in zone B!" -> AI: "Understood. That is a priority hazard. I have dispatched emergency technician Carlos Mendez with an immediate 35-minute arrival time."`,
        created_at: timestamp
      };

      const newJob: ServiceJob = {
        id: crypto.randomUUID(),
        tenant_id: tenant.id,
        technician_name: 'Carlos Mendez (Licensed Electrician)',
        service_type: 'Emergency Circuit Overload & Panel Hazard Isolation',
        priority: 'emergency',
        status: 'dispatched',
        scheduled_for: new Date(Date.now() + 1800000).toISOString(),
        estimated_cost: 850.00,
        dispatch_address: '55 Water St, Brooklyn, NY',
        ai_intake_notes: 'AI captured emergency hazard. Customer approved after-hours diagnostic deposit.',
        parts_required: ['Thermal Breaker 50A', 'Insulation Clamp Kit'],
        booked_via_ai: true,
        created_at: timestamp
      };

      localAILogs = [log, ...localAILogs];
      localServiceJobs = [newJob, ...localServiceJobs];

      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('ai_activity_logs').insert([log]).then();
        supabase.from('service_jobs').insert([newJob]).then();
      }

      return { log, record: newJob };
    }
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const tenants = (await this.getTenants()).data;
    const appointments = (await this.getAppointments()).data;
    const jobs = (await this.getServiceJobs()).data;
    const logs = (await this.getAILogs()).data;

    const medicalCount = tenants.filter((t) => t.industry === 'medical_clinic').length;
    const serviceCount = tenants.filter((t) => t.industry === 'service_business').length;

    const totalTokens = logs.reduce((acc, l) => acc + (l.tokens_used || 0), 0);
    const totalAiBookings =
      appointments.filter((a) => a.booked_via_ai).length +
      jobs.filter((j) => j.booked_via_ai).length;
    const totalRecords = appointments.length + jobs.length;
    const aiAutomationRate = totalRecords > 0 ? Math.round((totalAiBookings / totalRecords) * 100) : 92;

    return {
      totalBusinesses: tenants.length,
      activeMedicalClinics: medicalCount,
      activeServiceBusinesses: serviceCount,
      totalAppointments: appointments.length,
      totalServiceJobs: jobs.length,
      totalAiCalls: logs.length + 4606, // Seeded base metrics
      totalTokensConsumed: totalTokens + 1845000,
      aiAutomationRate
    };
  }
};
