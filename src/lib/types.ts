export type BusinessIndustry = 'medical_clinic' | 'service_business';
export type TenantStatus = 'active' | 'onboarding' | 'paused' | 'suspended';
export type SubscriptionTier = 'starter' | 'growth' | 'enterprise';

export interface TenantBranding {
  primary_color?: string;
  accent_color?: string;
  tagline?: string;
  logo_url?: string;
}

export interface TenantSettings {
  operating_hours?: string;
  timezone?: string;
  ai_auto_booking?: boolean;
  emergency_triage_enabled?: boolean;
  hipaa_strict_mode?: boolean;
  after_hours_emergency?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: BusinessIndustry;
  subscription_tier: SubscriptionTier;
  status: TenantStatus;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  branding?: TenantBranding;
  business_settings?: TenantSettings;
  created_at: string;
  updated_at?: string;
}

export interface AIAgent {
  id: string;
  tenant_id: string;
  name: string;
  agent_type: 'voice_receptionist' | 'triage_assistant' | 'scheduler' | 'dispatch_coordinator';
  phone_number: string;
  voice_profile: string;
  llm_model: string;
  system_prompt: string;
  is_active: boolean;
  call_forward_enabled: boolean;
  total_calls_handled: number;
  created_at: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  contact_type: 'patient' | 'customer';
  industry_attributes?: Record<string, any>;
  created_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  contact_id?: string;
  provider_name: string;
  department: string;
  appointment_type: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'confirmed' | 'in_consultation' | 'completed' | 'cancelled' | 'no_show';
  chief_complaint?: string;
  ai_triage_summary?: string;
  hipaa_notes_masked?: string;
  room_number?: string;
  booked_via_ai: boolean;
  created_at: string;
}

export interface ServiceJob {
  id: string;
  tenant_id: string;
  contact_id?: string;
  technician_name: string;
  service_type: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending_dispatch' | 'dispatched' | 'on_site' | 'in_progress' | 'completed' | 'invoiced';
  scheduled_for: string;
  estimated_cost: number;
  final_cost?: number;
  dispatch_address: string;
  ai_intake_notes?: string;
  parts_required?: string[];
  booked_via_ai: boolean;
  created_at: string;
}

export interface AIActivityLog {
  id: string;
  tenant_id: string;
  agent_id?: string;
  caller_phone: string;
  caller_name: string;
  event_type: 'voice_call' | 'automated_reschedule' | 'emergency_triage';
  duration_seconds: number;
  tokens_used: number;
  estimated_cost: number;
  sentiment: 'positive' | 'neutral' | 'urgent' | 'frustrated';
  summary: string;
  transcript_snippet: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalBusinesses: number;
  activeMedicalClinics: number;
  activeServiceBusinesses: number;
  totalAppointments: number;
  totalServiceJobs: number;
  totalAiCalls: number;
  totalTokensConsumed: number;
  aiAutomationRate: number; // percentage
}
