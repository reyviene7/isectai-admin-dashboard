import type { Tenant, AIAgent, Contact, Appointment, ServiceJob, AIActivityLog } from '../lib/types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    name: 'Apex Dental & Maxillofacial Care',
    slug: 'apex-dental',
    industry: 'medical_clinic',
    subscription_tier: 'enterprise',
    status: 'active',
    phone: '+1 (212) 555-0144',
    email: 'admin@apexdentalnyc.com',
    address: '450 Lexington Ave, Suite 1400',
    city: 'New York',
    state: 'NY',
    postal_code: '10017',
    branding: {
      primary_color: '#0ea5e9',
      accent_color: '#38bdf8',
      tagline: 'Advanced Oral Surgery & Aesthetic Dentistry'
    },
    business_settings: {
      operating_hours: '07:30 - 18:30',
      timezone: 'America/New_York',
      ai_auto_booking: true,
      emergency_triage_enabled: true
    },
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'b2222222-2222-4222-8222-222222222222',
    name: 'PulsePoint Cardiology & Vascular Center',
    slug: 'pulsepoint-cardio',
    industry: 'medical_clinic',
    subscription_tier: 'enterprise',
    status: 'active',
    phone: '+1 (212) 555-0189',
    email: 'intake@pulsepointcardio.org',
    address: '880 Fifth Avenue, Pavilion B',
    city: 'New York',
    state: 'NY',
    postal_code: '10021',
    branding: {
      primary_color: '#f43f5e',
      accent_color: '#fda4af',
      tagline: 'Precision Cardiovascular Diagnostics & Care'
    },
    business_settings: {
      operating_hours: '08:00 - 17:00',
      timezone: 'America/New_York',
      ai_auto_booking: true,
      hipaa_strict_mode: true
    },
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    name: 'VoltFlow HVAC, Plumbing & Electrical',
    slug: 'voltflow-services',
    industry: 'service_business',
    subscription_tier: 'growth',
    status: 'active',
    phone: '+1 (718) 555-0922',
    email: 'dispatch@voltflowservices.com',
    address: '1240 Atlantic Avenue',
    city: 'Brooklyn',
    state: 'NY',
    postal_code: '11216',
    branding: {
      primary_color: '#f59e0b',
      accent_color: '#fde68a',
      tagline: '24/7 Smart Field Service & Rapid Emergency Dispatch'
    },
    business_settings: {
      operating_hours: '24/7 Rapid Response',
      timezone: 'America/New_York',
      ai_auto_booking: true,
      after_hours_emergency: true
    },
    created_at: new Date(Date.now() - 90 * 86400000).toISOString()
  }
];

export const INITIAL_AI_AGENTS: AIAgent[] = [
  {
    id: 'g1111111-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    name: 'Apex Voice Receptionist & Emergency Triage',
    agent_type: 'voice_receptionist',
    phone_number: '+1 (212) 555-0144',
    voice_profile: 'en-US-Neural2-F (Emma)',
    llm_model: 'gpt-4o',
    system_prompt: 'You are the intelligent front-desk receptionist for Apex Dental. Warmly greet patients, verify dental insurance, assess tooth pain severity (1-10), and book emergency surgery slots with Dr. Vance.',
    is_active: true,
    call_forward_enabled: true,
    total_calls_handled: 1482,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'g2222222-2222-4222-8222-222222222222',
    tenant_id: 'b2222222-2222-4222-8222-222222222222',
    name: 'PulsePoint Clinical Screening AI',
    agent_type: 'triage_assistant',
    phone_number: '+1 (212) 555-0189',
    voice_profile: 'en-US-Journey-O (Marcus)',
    llm_model: 'gpt-4o',
    system_prompt: 'You are PulsePoint Cardio clinical scheduling coordinator. Strict HIPAA compliance. If acute chest pain/shortness of breath is reported, immediately initiate 911 transfer protocol. Otherwise schedule ECG/Holter reviews.',
    is_active: true,
    call_forward_enabled: true,
    total_calls_handled: 974,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'g3333333-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    name: 'VoltFlow 24/7 Smart Dispatcher',
    agent_type: 'dispatch_coordinator',
    phone_number: '+1 (718) 555-0922',
    voice_profile: 'en-US-Neural2-D (Alex)',
    llm_model: 'gpt-4o',
    system_prompt: 'You are the after-hours dispatch coordinator for VoltFlow. Capture issue category, address, property type, give rough bracket estimate, and dispatch on-call technicians Tyler or Carlos.',
    is_active: true,
    call_forward_enabled: true,
    total_calls_handled: 2150,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString()
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1010101-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    full_name: 'Eleanor Wright',
    email: 'eleanor.w@example.com',
    phone: '+1 (917) 555-3810',
    address: '184 E 73rd St, New York, NY',
    contact_type: 'patient',
    industry_attributes: {
      dob: '1991-03-14',
      insurance_provider: 'Delta Dental Premier',
      allergies: 'Penicillin',
      last_cleaning: '2025-09-10'
    },
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'c1020202-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    full_name: 'Marcus Thorne',
    email: 'marcus.thorne@example.com',
    phone: '+1 (646) 555-8911',
    address: '210 W 89th St, New York, NY',
    contact_type: 'patient',
    industry_attributes: {
      dob: '1983-11-29',
      insurance_provider: 'Cigna Dental PPO',
      allergies: 'None',
      notes: 'Wisdom tooth evaluation'
    },
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'c2010101-2222-4222-8222-222222222222',
    tenant_id: 'b2222222-2222-4222-8222-222222222222',
    full_name: 'Arthur Pendelton',
    email: 'apendelton@example.com',
    phone: '+1 (212) 555-9014',
    address: '500 Park Ave, Apt 11A, New York, NY',
    contact_type: 'patient',
    industry_attributes: {
      dob: '1958-02-18',
      insurance_provider: 'Medicare Part B + Aetna',
      primary_condition: 'Hypertension / Arrhythmia'
    },
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'c3010101-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    full_name: 'Hudson Yards Bistro (Mgr: Jason Lee)',
    email: 'ops@hudsonbistro.ny',
    phone: '+1 (212) 555-4491',
    address: '420 W 33rd St, New York, NY',
    contact_type: 'customer',
    industry_attributes: {
      property_type: 'commercial_restaurant',
      equipment: 'Carrier 15-Ton Commercial RTU',
      contract_tier: 'Gold Priority'
    },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'c3020202-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    full_name: 'David Sterling',
    email: 'dsterl@example.com',
    phone: '+1 (718) 555-6672',
    address: '178 7th Avenue, Park Slope, Brooklyn, NY',
    contact_type: 'customer',
    industry_attributes: {
      property_type: 'residential_brownstone',
      equipment: 'Navien Tankless Boiler + 200A Electrical Panel'
    },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'm1010101-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    contact_id: 'c1010101-1111-4111-8111-111111111111',
    provider_name: 'Dr. Julian Vance, DDS',
    department: 'Oral Surgery',
    appointment_type: 'Emergency Toothache & Extraction Consult',
    scheduled_start: new Date(Date.now() + 2 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 3600000).toISOString(),
    status: 'confirmed',
    chief_complaint: 'Severe sharp pain lower left molar #19, sensitivity to hot liquids for 48 hrs.',
    ai_triage_summary: 'AI triage flagged high pain level (8/10). Automatically assigned urgent slot with Dr. Vance. Pre-screened for NSAID allergies.',
    hipaa_notes_masked: '[PROTECTED MEDICAL RECORD] Insured via Delta Dental. Radiograph Suite 2 pre-ordered.',
    room_number: 'Surgical Suite 2',
    booked_via_ai: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'm1020202-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    contact_id: 'c1020202-1111-4111-8111-111111111111',
    provider_name: 'Dr. Elena Reed, DMD',
    department: 'Orthodontics',
    appointment_type: 'Impaction Assessment 3D Cone Beam CT',
    scheduled_start: new Date(Date.now() + 24 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 25 * 3600000).toISOString(),
    status: 'scheduled',
    chief_complaint: 'Wisdom teeth evaluation, mild pressure in jaw angle.',
    ai_triage_summary: 'Standard scheduling flow completed via inbound voice agent. Patient opted for afternoon slot.',
    hipaa_notes_masked: '[PROTECTED MEDICAL RECORD] Prior panoramic X-ray requested from transferring practice.',
    room_number: 'Exam Room 4',
    booked_via_ai: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'm2010101-2222-4222-8222-222222222222',
    tenant_id: 'b2222222-2222-4222-8222-222222222222',
    contact_id: 'c2010101-2222-4222-8222-222222222222',
    provider_name: 'Dr. Anaya Patel, MD, FACC',
    department: 'Cardiology Diagnostics',
    appointment_type: 'Transthoracic Echocardiogram (TTE) + Holter Review',
    scheduled_start: new Date(Date.now() + 4 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 5.5 * 3600000).toISOString(),
    status: 'confirmed',
    chief_complaint: 'Episodic palpitations during mild exertion, history of PVCs.',
    ai_triage_summary: 'Clinical intake AI screened for red-flag chest pressure (negative). Scheduled expedited ultrasound test.',
    hipaa_notes_masked: '[PROTECTED HIPAA DATA] Prior Holter recorded 6.4% PVC burden. Fasting not required.',
    room_number: 'Cardio Lab 1',
    booked_via_ai: true,
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

export const INITIAL_SERVICE_JOBS: ServiceJob[] = [
  {
    id: 's3010101-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    contact_id: 'c3010101-3333-4333-8333-333333333333',
    technician_name: 'Tyler Vance (Master HVAC Tech)',
    service_type: 'Commercial Walk-in Cooler Compressor Tripping',
    priority: 'emergency',
    status: 'in_progress',
    scheduled_for: new Date(Date.now() + 1800000).toISOString(),
    estimated_cost: 1850.00,
    dispatch_address: '420 W 33rd St, Kitchen Loading Dock, New York, NY',
    ai_intake_notes: 'Inbound emergency AI call at 02:14 AM. Kitchen temperature rose from 34F to 52F. AI dispatched primary on-call refrigeration specialist Tyler Vance.',
    parts_required: ['Copeland Hermetic Compressor 2.5HP', 'R-448A Refrigerant 10lb', 'Thermal Expansion Valve'],
    booked_via_ai: true,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 's3020202-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    contact_id: 'c3020202-3333-4333-8333-333333333333',
    technician_name: 'Carlos Mendez (Licensed Electrician)',
    service_type: '200 Amp Main Electrical Service Panel Upgrade & EV Charger',
    priority: 'medium',
    status: 'dispatched',
    scheduled_for: new Date(Date.now() + 5 * 3600000).toISOString(),
    estimated_cost: 4200.00,
    dispatch_address: '178 7th Avenue, Park Slope, Brooklyn, NY',
    ai_intake_notes: 'Customer requested estimate for Tesla Universal Wall Connector and replacing old Zinsco fuse box. AI analyzed panel photos uploaded via SMS.',
    parts_required: ['Square D QO 200A Panelboard', 'Tesla Universal Wall Connector', '60A Double Pole Breaker'],
    booked_via_ai: true,
    created_at: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: 's3030303-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    contact_id: 'c3020202-3333-4333-8333-333333333333',
    technician_name: 'Derrick Washington (Senior Plumber)',
    service_type: 'Basement Main Drain Hydro-Jetting & Camera Inspection',
    priority: 'high',
    status: 'completed',
    scheduled_for: new Date(Date.now() - 86400000).toISOString(),
    estimated_cost: 950.00,
    final_cost: 950.00,
    dispatch_address: '178 7th Avenue, Basement Entry, Brooklyn, NY',
    ai_intake_notes: 'AI voice booking captured heavy storm drain backup. Scheduled hydro-jet unit. Tech cleared root intrusion at 42-foot mark.',
    parts_required: ['Bio-Clean Drain Enzyme Treatment', '4-inch Cleanout Plug'],
    booked_via_ai: true,
    created_at: new Date(Date.now() - 90000000).toISOString()
  }
];

export const INITIAL_AI_LOGS: AIActivityLog[] = [
  {
    id: 'l1010101-1111-4111-8111-111111111111',
    tenant_id: 'a1111111-1111-4111-8111-111111111111',
    agent_id: 'g1111111-1111-4111-8111-111111111111',
    caller_phone: '+1 (917) 555-3810',
    caller_name: 'Eleanor Wright',
    event_type: 'voice_call',
    duration_seconds: 145,
    tokens_used: 3120,
    estimated_cost: 0.0468,
    sentiment: 'urgent',
    summary: 'Patient called with acute molar throbbing. AI evaluated pain score 8/10, checked insurance eligibility on file, and booked emergency 2h window.',
    transcript_snippet: 'Patient: "I can barely chew on my left side, the pain is radiating to my ear..." -> AI: "I understand how painful that is, Eleanor. Let us get you relief right away. Dr. Vance has an emergency opening at 10:30 AM today. Shall I secure that for you?"',
    created_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'l2010101-2222-4222-8222-222222222222',
    tenant_id: 'b2222222-2222-4222-8222-222222222222',
    agent_id: 'g2222222-2222-4222-8222-222222222222',
    caller_phone: '+1 (212) 555-9014',
    caller_name: 'Arthur Pendelton',
    event_type: 'voice_call',
    duration_seconds: 210,
    tokens_used: 4480,
    estimated_cost: 0.0672,
    sentiment: 'positive',
    summary: 'Patient inquired about Holter monitor reading and rescheduled diagnostic follow-up with Dr. Patel.',
    transcript_snippet: 'Patient: "Good morning, I was told my heart monitor data had been processed..." -> AI: "Good morning Mr. Pendelton. Your telemetry has been synchronized. Dr. Patel has reviewed the preliminary traces. Let us schedule your 90-minute ultrasound and consultation..."',
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'l3010101-3333-4333-8333-333333333333',
    tenant_id: 'c3333333-3333-4333-8333-333333333333',
    agent_id: 'g3333333-3333-4333-8333-333333333333',
    caller_phone: '+1 (212) 555-4491',
    caller_name: 'Jason Lee (Hudson Yards Bistro)',
    event_type: 'emergency_triage',
    duration_seconds: 180,
    tokens_used: 3890,
    estimated_cost: 0.0583,
    sentiment: 'urgent',
    summary: 'Commercial kitchen emergency: Walk-in cooler temperature alert. AI captured equipment model and dispatched Tyler Vance with 45-min ETA.',
    transcript_snippet: 'Caller: "Our walk-in is up to 50 degrees, we have $14,000 in seafood inventory at risk!" -> AI: "Understood, Jason. I am dispatching our master refrigeration tech Tyler Vance immediately under Emergency Priority Code 1..."',
    created_at: new Date(Date.now() - 60 * 60000).toISOString()
  }
];
