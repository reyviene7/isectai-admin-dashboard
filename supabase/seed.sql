-- ==============================================================================================
-- iSectAI Platform: Fictional Sample Data Seed
-- Prepopulates:
--   1. Apex Dental & Maxillofacial Care (Medical Clinic)
--   2. PulsePoint Cardiology & Vascular Center (Medical Clinic)
--   3. VoltFlow HVAC, Plumbing & Electrical (Service Business)
-- ==============================================================================================

-- 1. INSERT TENANTS
INSERT INTO tenants (id, name, slug, industry, subscription_tier, status, phone, email, address, city, state, postal_code, branding, business_settings)
VALUES
(
    'a1111111-1111-4111-8111-111111111111',
    'Apex Dental & Maxillofacial Care',
    'apex-dental',
    'medical_clinic',
    'enterprise',
    'active',
    '+1 (212) 555-0144',
    'admin@apexdentalnyc.com',
    '450 Lexington Ave, Suite 1400',
    'New York',
    'NY',
    '10017',
    '{"primary_color": "#0ea5e9", "accent_color": "#38bdf8", "tagline": "Advanced Oral Surgery & Aesthetic Dentistry"}'::jsonb,
    '{"operating_hours": "07:30 - 18:30", "timezone": "America/New_York", "ai_auto_booking": true, "emergency_triage_enabled": true}'::jsonb
),
(
    'b2222222-2222-4222-8222-222222222222',
    'PulsePoint Cardiology & Vascular Center',
    'pulsepoint-cardio',
    'medical_clinic',
    'enterprise',
    'active',
    '+1 (212) 555-0189',
    'intake@pulsepointcardio.org',
    '880 Fifth Avenue, Pavilion B',
    'New York',
    'NY',
    '10021',
    '{"primary_color": "#e11d48", "accent_color": "#fb7185", "tagline": "Precision Cardiovascular Diagnostics & Care"}'::jsonb,
    '{"operating_hours": "08:00 - 17:00", "timezone": "America/New_York", "ai_auto_booking": true, "hipaa_strict_mode": true}'::jsonb
),
(
    'c3333333-3333-4333-8333-333333333333',
    'VoltFlow HVAC, Plumbing & Electrical',
    'voltflow-services',
    'service_business',
    'growth',
    'active',
    '+1 (718) 555-0922',
    'dispatch@voltflowservices.com',
    '1240 Atlantic Avenue',
    'Brooklyn',
    'NY',
    '11216',
    '{"primary_color": "#f59e0b", "accent_color": "#fbbf24", "tagline": "24/7 Smart Field Service & Rapid Emergency Dispatch"}'::jsonb,
    '{"operating_hours": "24/7 Rapid Response", "timezone": "America/New_York", "ai_auto_booking": true, "after_hours_emergency": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. INSERT USERS (Staff & Platform Admin)
INSERT INTO users (id, tenant_id, email, full_name, role, phone, is_active)
VALUES
(
    'u0000000-0000-4000-8000-000000000000',
    NULL,
    'admin@isectai.internal',
    'Sarah Chen (iSectAI Chief Architect)',
    'platform_admin',
    '+1 (212) 555-0100',
    true
),
(
    'u1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'dr.vance@apexdentalnyc.com',
    'Dr. Julian Vance, DDS',
    'business_owner',
    '+1 (212) 555-0145',
    true
),
(
    'u2222222-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'dr.patel@pulsepointcardio.org',
    'Dr. Anaya Patel, MD, FACC',
    'business_owner',
    '+1 (212) 555-0190',
    true
),
(
    'u3333333-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'mike.ross@voltflowservices.com',
    'Mike Ross (Field Ops Director)',
    'business_owner',
    '+1 (718) 555-0925',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT AI AGENTS
INSERT INTO ai_agents (id, tenant_id, name, agent_type, phone_number, voice_profile, llm_model, system_prompt, is_active, call_forward_enabled, total_calls_handled)
VALUES
(
    'g1111111-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Apex Voice Receptionist & Emergency Triage',
    'voice_receptionist',
    '+1 (212) 555-0144',
    'en-US-Neural2-F',
    'gpt-4o',
    'You are the intelligent front-desk receptionist for Apex Dental. You warmly greet patients, verify dental insurance provider, assess tooth pain emergency severity on a 1-10 scale, and book time with Dr. Vance or Dr. Reed.',
    true,
    true,
    1482
),
(
    'g2222222-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'PulsePoint Clinical Screening AI',
    'triage_assistant',
    '+1 (212) 555-0189',
    'en-US-Journey-O',
    'gpt-4o',
    'You are PulsePoint Cardio clinical scheduling coordinator. Adhere strictly to HIPAA guidelines. Identify if caller reports acute chest pain or shortness of breath—if so, immediately trigger 911 protocol. Otherwise book cardiac consults.',
    true,
    true,
    974
),
(
    'g3333333-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'VoltFlow 24/7 Smart Dispatcher',
    'dispatch_coordinator',
    '+1 (718) 555-0922',
    'en-US-Neural2-D',
    'gpt-4o',
    'You are the dispatch coordinator for VoltFlow HVAC, Plumbing & Electrical. Collect problem description, address, property type (commercial vs residential), provide rough diagnostic estimate bracket, and dispatch on-call techs.',
    true,
    true,
    2150
)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT CONTACTS
INSERT INTO contacts (id, tenant_id, full_name, email, phone, address, contact_type, industry_attributes)
VALUES
-- Apex Dental Patients
(
    'c1010101-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Eleanor Wright',
    'eleanor.w@example.com',
    '+1 (917) 555-3810',
    '184 E 73rd St, New York, NY',
    'patient',
    '{"dob": "1991-03-14", "insurance_provider": "Delta Dental Premier", "allergies": "Penicillin", "last_cleaning": "2025-09-10"}'::jsonb
),
(
    'c1020202-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Marcus Thorne',
    'marcus.thorne@example.com',
    '+1 (646) 555-8911',
    '210 W 89th St, New York, NY',
    'patient',
    '{"dob": "1983-11-29", "insurance_provider": "Cigna Dental PPO", "allergies": "None", "notes": "Wisdom tooth evaluation"}'::jsonb
),
(
    'c1030303-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'Sophia Martinez',
    'smartinez@example.com',
    '+1 (212) 555-7312',
    '330 Madison Ave, New York, NY',
    'patient',
    '{"dob": "1997-07-04", "insurance_provider": "MetLife Dental", "allergies": "Latex", "notes": "Invisalign progress check"}'::jsonb
),
-- PulsePoint Cardiology Patients
(
    'c2010101-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'Arthur Pendelton',
    'apendelton@example.com',
    '+1 (212) 555-9014',
    '500 Park Ave, Apt 11A, New York, NY',
    'patient',
    '{"dob": "1958-02-18", "insurance_provider": "Medicare Part B + Aetna", "primary_condition": "Hypertension / Arrhythmia"}'::jsonb
),
(
    'c2020202-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'Clara Montgomery',
    'cmontgomery@example.com',
    '+1 (917) 555-2349',
    '15 Central Park West, New York, NY',
    'patient',
    '{"dob": "1966-08-22", "insurance_provider": "Empire BlueCross BlueShield", "primary_condition": "Aortic Valve Surveillance"}'::jsonb
),
-- VoltFlow Customers
(
    'c3010101-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'Hudson Yards Bistro (Mgr: Jason Lee)',
    'ops@hudsonbistro.ny',
    '+1 (212) 555-4491',
    '420 W 33rd St, New York, NY',
    'customer',
    '{"property_type": "commercial_restaurant", "equipment": "Carrier 15-Ton Commercial RTU", "contract_type": "Gold Maintenance"}'::jsonb
),
(
    'c3020202-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'David Sterling (Brownstone Owner)',
    'dsterl@example.com',
    '+1 (718) 555-6672',
    '178 7th Avenue, Park Slope, Brooklyn, NY',
    'customer',
    '{"property_type": "residential_multi_family", "equipment": "Navien Tankless Boiler + 200A Electrical Panel"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 5. INSERT APPOINTMENTS (Medical Clinic records)
INSERT INTO appointments (id, tenant_id, contact_id, provider_name, department, appointment_type, scheduled_start, scheduled_end, status, chief_complaint, ai_triage_summary, hipaa_notes_masked, room_number, booked_via_ai)
VALUES
(
    'm1010101-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'c1010101-1111-4111-8111-111111111111',
    'Dr. Julian Vance, DDS',
    'Oral Surgery',
    'Emergency Toothache & Extraction Consult',
    timezone('utc', now() + interval '2 hours'),
    timezone('utc', now() + interval '3 hours'),
    'confirmed',
    'Severe sharp pain lower left molar #19, sensitivity to hot liquids for 48 hrs.',
    'AI triage flagged high pain level (8/10). Automatically assigned urgent slot with Dr. Vance. Pre-screened for NSAID allergies.',
    '[MASKED: PII Encrypted] Patient insured via Delta Dental. Radiograph suite 2 pre-ordered.',
    'Surgical Suite 2',
    true
),
(
    'm1020202-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'c1020202-1111-4111-8111-111111111111',
    'Dr. Elena Reed, DMD',
    'Orthodontics',
    'Impaction Assessment 3D Cone Beam CT',
    timezone('utc', now() + interval '1 day'),
    timezone('utc', now() + interval '1 day 45 minutes'),
    'scheduled',
    'Wisdom teeth evaluation, mild pressure in jaw angle.',
    'Standard scheduling flow completed via inbound voice agent. Patient opted for afternoon slot.',
    '[MASKED: PII Encrypted] Prior panoramic X-ray requested from transferring practice.',
    'Exam Room 4',
    true
),
(
    'm1030303-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'c1030303-1111-4111-8111-111111111111',
    'Dr. Elena Reed, DMD',
    'Cosmetic Dentistry',
    'Invisalign Tray 14 Progress & Refinement',
    timezone('utc', now() - interval '3 hours'),
    timezone('utc', now() - interval '2 hours'),
    'completed',
    'Routine aligner checkup and interproximal reduction.',
    'Automated SMS reminder confirmed 24h prior. Patient arrived on time.',
    '[MASKED: PII Encrypted] Aligner tracking on target. Handed off trays 15-18.',
    'Hygiene Bay A',
    true
),
(
    'm2010101-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'c2010101-2222-4222-8222-222222222222',
    'Dr. Anaya Patel, MD, FACC',
    'Cardiology Diagnostics',
    'Transthoracic Echocardiogram (TTE) + Holter Review',
    timezone('utc', now() + interval '4 hours'),
    timezone('utc', now() + interval '5 hours 30 minutes'),
    'confirmed',
    'Episodic palpitations during mild exertion, history of PVCs.',
    'Clinical intake AI screened for red-flag chest pressure (negative). Scheduled expedited ultrasound test.',
    '[MASKED: HIPAA Strictly Protected] Prior Holter recorded 6.4% PVC burden. Fasting not required.',
    'Cardio Lab 1',
    true
),
(
    'm2020202-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'c2020202-2222-4222-8222-222222222222',
    'Dr. Samuel Sterling, MD',
    'Vascular Medicine',
    'Carotid Duplex Ultrasound Follow-up',
    timezone('utc', now() + interval '2 days'),
    timezone('utc', now() + interval '2 days 1 hour'),
    'scheduled',
    'Routine annual surveillance of 30-49% internal carotid stenosis.',
    'AI automated appointment recall sent 30 days prior. Patient confirmed slot via voice prompt.',
    '[MASKED: HIPAA Strictly Protected] Comparative doppler baseline loaded from 2025 archive.',
    'Ultrasound Suite 3',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 6. INSERT SERVICE JOBS (Service Business records)
INSERT INTO service_jobs (id, tenant_id, contact_id, technician_name, service_type, priority, status, scheduled_for, estimated_cost, final_cost, dispatch_address, ai_intake_notes, parts_required, booked_via_ai)
VALUES
(
    's3010101-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'c3010101-3333-4333-8333-333333333333',
    'Tyler Vance (Master HVAC Tech)',
    'Commercial Walk-in Cooler Compressor Tripping',
    'emergency',
    'in_progress',
    timezone('utc', now() + interval '30 minutes'),
    1850.00,
    NULL,
    '420 W 33rd St, Kitchen Loading Dock, New York, NY',
    'Inbound emergency AI call at 02:14 AM. Kitchen temperature rose from 34F to 52F. AI dispatched primary on-call refrigeration specialist Tyler Vance.',
    '["Copeland Hermetic Compressor 2.5HP", "R-448A Refrigerant 10lb", "Thermal Expansion Valve"]'::jsonb,
    true
),
(
    's3020202-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'c3020202-3333-4333-8333-333333333333',
    'Carlos Mendez (Licensed Electrician)',
    '200 Amp Main Electrical Service Panel Upgrade & EV Charger',
    'medium',
    'dispatched',
    timezone('utc', now() + interval '5 hours'),
    4200.00,
    NULL,
    '178 7th Avenue, Park Slope, Brooklyn, NY',
    'Customer requested estimate for Tesla Universal Wall Connector and replacing old Zinsco fuse box. AI analyzed panel photos uploaded via SMS.',
    '["Square D QO 200A Panelboard", "Tesla Universal Wall Connector", "60A Double Pole Breaker", "6 AWG THHN Copper Wire"]'::jsonb,
    true
),
(
    's3030303-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'c3020202-3333-4333-8333-333333333333',
    'Derrick Washington (Senior Plumber)',
    'Basement Main Drain Hydro-Jetting & Camera Inspection',
    'high',
    'completed',
    timezone('utc', now() - interval '1 day'),
    950.00,
    950.00,
    '178 7th Avenue, Basement Entry, Brooklyn, NY',
    'AI voice booking captured heavy storm drain backup. Scheduled hydro-jet unit. Tech cleared root intrusion at 42-foot mark.',
    '["Bio-Clean Drain Enzyme Treatment", "4-inch Cleanout Plug"]'::jsonb,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 7. INSERT AI ACTIVITY TELEMETRY LOGS
INSERT INTO ai_activity_logs (id, tenant_id, agent_id, caller_phone, caller_name, event_type, duration_seconds, tokens_used, estimated_cost, sentiment, summary, transcript_snippet, created_at)
VALUES
(
    'l1010101-1111-4111-8111-111111111111',
    'a1111111-1111-4111-8111-111111111111',
    'g1111111-1111-4111-8111-111111111111',
    '+1 (917) 555-3810',
    'Eleanor Wright',
    'voice_call',
    145,
    3120,
    0.0468,
    'urgent',
    'Patient called with acute molar throbbing. AI evaluated pain score 8/10, checked insurance eligibility on file, and booked emergency 2h window.',
    'Patient: "I can barely chew on my left side, the pain is radiating to my ear..." -> AI: "I understand how painful that is, Eleanor. Let us get you relief right away. Dr. Vance has an emergency opening at 10:30 AM today. Shall I secure that for you?"',
    timezone('utc', now() - interval '45 minutes')
),
(
    'l2010101-2222-4222-8222-222222222222',
    'b2222222-2222-4222-8222-222222222222',
    'g2222222-2222-4222-8222-222222222222',
    '+1 (212) 555-9014',
    'Arthur Pendelton',
    'voice_call',
    210,
    4480,
    0.0672,
    'positive',
    'Patient inquired about Holter monitor reading and rescheduled diagnostic follow-up with Dr. Patel.',
    'Patient: "Good morning, I was told my heart monitor data had been processed..." -> AI: "Good morning Mr. Pendelton. Your telemetry has been synchronized. Dr. Patel has reviewed the preliminary traces. Let us schedule your 90-minute ultrasound and consultation..."',
    timezone('utc', now() - interval '2 hours')
),
(
    'l3010101-3333-4333-8333-333333333333',
    'c3333333-3333-4333-8333-333333333333',
    'g3333333-3333-4333-8333-333333333333',
    '+1 (212) 555-4491',
    'Jason Lee (Hudson Bistro)',
    'emergency_triage',
    180,
    3890,
    0.0583,
    'urgent',
    'Commercial kitchen emergency: Walk-in cooler temperature alert. AI captured equipment model and dispatched Tyler Vance with 45-min ETA.',
    'Caller: "Our walk-in is up to 50 degrees, we have $14,000 in seafood inventory at risk!" -> AI: "Understood, Jason. I am dispatching our master refrigeration tech Tyler Vance immediately under Emergency Priority Code 1..."',
    timezone('utc', now() - interval '1 hour')
)
ON CONFLICT (id) DO NOTHING;
