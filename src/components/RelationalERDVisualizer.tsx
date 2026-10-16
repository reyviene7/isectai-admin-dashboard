import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Database,
  Calendar,
  Wrench,
  Users,
  MapPin,
  Activity,
  Bot,
  ShieldCheck,
  Key,
  Layers,
  Info,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';

export type TableCategory = 'all' | 'core' | 'medical' | 'service' | 'auth';
export type ViewDensity = 'detailed' | 'compact';

interface SchemaColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  fkTarget?: string;
  isRlsKey?: boolean;
  description: string;
}

interface TableNode {
  id: string;
  schema: string;
  name: string;
  displayName: string;
  category: 'core' | 'medical' | 'service' | 'auth';
  badgeLabel: string;
  rowCountBadge: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  heightDetailed: number;
  heightCompact: number;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  accentColor: string;
  softBg: string;
  borderColor: string;
  description: string;
  rlsPolicy: string;
  columns: SchemaColumn[];
  previewColumns: { name: string; type: string; keyType: 'pk' | 'fk' | 'rls' | 'normal' }[];
}

interface ConnectionLink {
  id: string;
  from: string;
  to: string;
  category: 'core' | 'medical' | 'service' | 'auth';
  isDashed?: boolean;
  label?: string;
  fromPort: { x: number; y: number };
  toPort: { x: number; y: number };
}

// ------------------------------------------------------------------------------------------------
// CANVAS GEOMETRY: BASE_WIDTH = 910px, BASE_HEIGHT = 590px (Fits all screens with 0 scrollbar)
// ------------------------------------------------------------------------------------------------
const BASE_WIDTH = 910;
const BASE_HEIGHT_DETAILED = 590;
const BASE_HEIGHT_COMPACT = 540;

const TABLE_NODES: TableNode[] = [
  // ----------------------------------------------------------------------------------------------
  // COLUMN 1: INDUSTRY SCOPE (x: 15, width: 175)
  // ----------------------------------------------------------------------------------------------
  {
    id: 'industries',
    schema: 'core',
    name: 'industries',
    displayName: 'industries',
    category: 'core',
    badgeLabel: 'Enum Scope',
    rowCountBadge: '2 Types',
    subtitle: 'Taxonomy & Routing',
    x: 15,
    y: 195,
    width: 175,
    heightDetailed: 140,
    heightCompact: 64,
    icon: Layers,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Defines industry boundaries, clinical triage versus trade dispatch workflows, and compliance profiles.',
    rlsPolicy: 'Public lookup table; readable by all authenticated users across all tenants.',
    columns: [
      { name: 'record_type', type: 'VARCHAR(50)', isPk: true, description: "Enum identifier: 'medical_clinic' | 'service_business'" },
      { name: 'record_label', type: 'VARCHAR(100)', description: "Human-readable label: 'Healthcare & Clinical' | 'Home & Trade Services'" },
      { name: 'default_workflow', type: 'VARCHAR(50)', description: 'Default routing engine assigned to incoming tenant accounts' }
    ],
    previewColumns: [
      { name: 'record_type', type: 'varchar(50)', keyType: 'pk' },
      { name: 'record_label', type: 'varchar(100)', keyType: 'normal' },
      { name: 'default_workflow', type: 'varchar(50)', keyType: 'normal' }
    ]
  },

  // ----------------------------------------------------------------------------------------------
  // COLUMN 2: ROOT TENANTS (x: 215, width: 195)
  // ----------------------------------------------------------------------------------------------
  {
    id: 'tenants',
    schema: 'core',
    name: 'tenants',
    displayName: 'tenants',
    category: 'core',
    badgeLabel: 'Root Organization',
    rowCountBadge: '3 Tenants',
    subtitle: 'Tenant Partition Anchor',
    x: 215,
    y: 175,
    width: 195,
    heightDetailed: 190,
    heightCompact: 68,
    icon: Database,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Root multi-tenant entity. Every clinical clinic, cardiology center, or HVAC company partitions from this table.',
    rlsPolicy: 'Tenants can only view their own organization: (id = auth_user_tenant_id()). Platform Admins have full access.',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, isRlsKey: true, description: 'Primary tenant identifier used across all foreign keys' },
      { name: 'name', type: 'VARCHAR(255)', description: 'Official business or medical facility trade name' },
      { name: 'slug', type: 'VARCHAR(100)', description: 'Globally unique URL subdomain & routing identifier' },
      { name: 'industry', type: 'business_industry (ENUM)', description: 'Industry classification: medical_clinic or service_business' },
      { name: 'subscription_tier', type: 'subscription_tier (ENUM)', description: 'Active plan tier: starter | growth | enterprise' },
      { name: 'status', type: 'tenant_status (ENUM)', description: 'Operational status: active | onboarding | paused | suspended' },
      { name: 'branding', type: 'JSONB', description: 'Hex primary colors, logo marks, and patient portal styling' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'slug', type: 'varchar', keyType: 'normal' },
      { name: 'industry', type: 'enum', keyType: 'normal' },
      { name: 'subscription', type: 'tier', keyType: 'normal' },
      { name: 'status', type: 'enum', keyType: 'normal' }
    ]
  },

  // ----------------------------------------------------------------------------------------------
  // COLUMN 3: SHARED CORE OPERATIONAL TABLES (x: 435, width: 205)
  // ----------------------------------------------------------------------------------------------
  {
    id: 'locations',
    schema: 'core',
    name: 'locations',
    displayName: 'locations',
    category: 'core',
    badgeLabel: 'Sites',
    rowCountBadge: '3 Sites',
    subtitle: 'Facility Branch & Depot',
    x: 435,
    y: 20,
    width: 205,
    heightDetailed: 80,
    heightCompact: 58,
    icon: MapPin,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Physical consultation suites, surgery rooms, field service depots, or satellite clinics.',
    rlsPolicy: 'Strictly isolated by tenant: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Unique location identifier' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Owning business tenant' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Facility name (e.g., Main Surgical Wing, North Depot)' },
      { name: 'is_primary', type: 'BOOLEAN', description: 'Designates headquarters facility for billing & routing' },
      { name: 'timezone', type: 'VARCHAR(50)', description: 'Local operational timezone for calendar booking engines' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'is_primary', type: 'bool', keyType: 'normal' }
    ]
  },
  {
    id: 'staff',
    schema: 'core',
    name: 'users',
    displayName: 'users (staff)',
    category: 'core',
    badgeLabel: 'Staff',
    rowCountBadge: '7 Staff',
    subtitle: 'Practitioners & Dispatchers',
    x: 435,
    y: 110,
    width: 205,
    heightDetailed: 85,
    heightCompact: 58,
    icon: Users,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Attending physicians, oral surgeons, triage coordinators, dispatchers, and field technicians.',
    rlsPolicy: 'Tenants can view staff in their organization: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Staff user UUID' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Owning business tenant' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Corporate login email address' },
      { name: 'full_name', type: 'VARCHAR(255)', description: 'Practitioner or staff full name' },
      { name: 'role', type: 'user_role (ENUM)', description: 'Role: platform_admin | business_owner | business_staff | practitioner' },
      { name: 'title', type: 'VARCHAR(150)', description: 'Professional designation (Chief Oral Surgeon, Field Dispatcher)' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'role', type: 'user_role', keyType: 'normal' }
    ]
  },
  {
    id: 'customers',
    schema: 'core',
    name: 'contacts',
    displayName: 'contacts',
    category: 'core',
    badgeLabel: 'Clients',
    rowCountBadge: '8 Clients',
    subtitle: 'Patients & Property Clients',
    x: 435,
    y: 205,
    width: 205,
    heightDetailed: 85,
    heightCompact: 58,
    icon: Activity,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Patient records, client accounts, insurance references, and property access information.',
    rlsPolicy: 'Tenants can only access their own contacts: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Unique customer/patient UUID' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Owning business tenant' },
      { name: 'full_name', type: 'VARCHAR(255)', description: 'Primary contact or patient name' },
      { name: 'phone', type: 'VARCHAR(50)', description: 'Caller ID phone number used by Voice Receptionist' },
      { name: 'industry_attributes', type: 'JSONB', description: 'Polymorphic metadata: HIPAA allergies, lockbox codes, property size' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'full_name', type: 'varchar', keyType: 'normal' }
    ]
  },
  {
    id: 'activity_events',
    schema: 'core',
    name: 'ai_activity_logs',
    displayName: 'ai_activity_logs',
    category: 'core',
    badgeLabel: 'AI Logs',
    rowCountBadge: '15+ Logs',
    subtitle: 'Voice Calls & Transcripts',
    x: 435,
    y: 300,
    width: 205,
    heightDetailed: 85,
    heightCompact: 58,
    icon: Bot,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Real-time telemetry stream capturing voice reception transcripts, sentiment scores, and token spend.',
    rlsPolicy: 'Tenants can only view their own AI logs: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Unique telemetry event UUID' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Tenant identifier' },
      { name: 'agent_id', type: 'UUID', isFk: true, fkTarget: 'ai_agents.id', description: 'Assigned autonomous agent' },
      { name: 'caller_phone', type: 'VARCHAR(50)', description: 'Inbound caller phone number' },
      { name: 'duration_seconds', type: 'INTEGER', description: 'Call duration in seconds' },
      { name: 'tokens_used', type: 'INTEGER', description: 'LLM token consumption for cost accounting' },
      { name: 'transcript', type: 'TEXT', description: 'Full conversational audio transcript' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'tokens_used', type: 'int', keyType: 'normal' }
    ]
  },
  {
    id: 'business_members',
    schema: 'core',
    name: 'business_members',
    displayName: 'business_members',
    category: 'core',
    badgeLabel: 'RBAC',
    rowCountBadge: 'Role Link',
    subtitle: 'Tenant RBAC Claims',
    x: 435,
    y: 395,
    width: 205,
    heightDetailed: 85,
    heightCompact: 58,
    icon: ShieldCheck,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Tenant membership binding linking users to organization roles for Supabase Auth JWT claims.',
    rlsPolicy: 'Scoped to authenticated user session and tenant boundary.',
    columns: [
      { name: 'user_id', type: 'UUID', isPk: true, isFk: true, fkTarget: 'auth.users.id', description: 'Supabase Auth user reference' },
      { name: 'tenant_id', type: 'UUID', isPk: true, isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Linked tenant organization' },
      { name: 'role', type: 'user_role', description: 'Role granted in this tenant: owner or staff' }
    ],
    previewColumns: [
      { name: 'user_id', type: 'uuid', keyType: 'fk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'role', type: 'user_role', keyType: 'normal' }
    ]
  },
  {
    id: 'platform_admins',
    schema: 'core',
    name: 'platform_admins',
    displayName: 'platform_admins',
    category: 'core',
    badgeLabel: 'Superuser',
    rowCountBadge: 'Global Scope',
    subtitle: 'Cross-Tenant Overseer',
    x: 435,
    y: 490,
    width: 205,
    heightDetailed: 80,
    heightCompact: 58,
    icon: Key,
    accentColor: '#059669',
    softBg: 'rgba(5, 150, 105, 0.08)',
    borderColor: '#059669',
    description: 'Super administrator role with global visibility to monitor AI uptime, inspect audit logs, and onboard tenants.',
    rlsPolicy: "Platform Admins have full access across all tables via (auth_user_role() = 'platform_admin').",
    columns: [
      { name: 'user_id', type: 'UUID', isPk: true, isFk: true, fkTarget: 'auth.users.id', description: 'Supabase Auth user reference' },
      { name: 'role', type: 'VARCHAR(50)', description: "Constant value 'platform_admin' embedded in JWT" },
      { name: 'security_clearance', type: 'VARCHAR(50)', description: 'Multi-tenant diagnostic & telemetry authority level' }
    ],
    previewColumns: [
      { name: 'user_id', type: 'uuid', keyType: 'fk' },
      { name: 'role', type: 'platform_admin', keyType: 'normal' }
    ]
  },

  // ----------------------------------------------------------------------------------------------
  // COLUMN 4: SPECIALIZED WORKFLOWS & MANAGED IDENTITY (x: 670, width: 225)
  // ----------------------------------------------------------------------------------------------
  {
    id: 'appointments',
    schema: 'medical',
    name: 'appointments',
    displayName: 'appointments',
    category: 'medical',
    badgeLabel: 'Clinic Workflow',
    rowCountBadge: '12 Bookings',
    subtitle: 'Surgeon Consults & Triage',
    x: 670,
    y: 30, // Nested with 22px clearance below 'CLINICAL HEALTHCARE WORKFLOW' title
    width: 225,
    heightDetailed: 140,
    heightCompact: 68,
    icon: Calendar,
    accentColor: '#0284c7',
    softBg: 'rgba(2, 132, 199, 0.08)',
    borderColor: '#0284c7',
    description: 'Clinical consultations, surgical procedures, doctor room assignments, and patient chief complaints.',
    rlsPolicy: 'Tenants can only access their own appointments: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Clinical appointment UUID' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Clinic tenant partition key' },
      { name: 'contact_id', type: 'UUID', isFk: true, fkTarget: 'contacts.id', description: 'Patient receiving medical consultation' },
      { name: 'provider_id', type: 'UUID', isFk: true, fkTarget: 'staff.id', description: 'Attending surgeon or physician' },
      { name: 'scheduled_start', type: 'TIMESTAMPTZ', description: 'Scheduled appointment start datetime' },
      { name: 'status', type: 'appointment_status', description: 'Status: scheduled | confirmed | in_consultation | completed | cancelled' },
      { name: 'chief_complaint', type: 'TEXT', description: 'Patient symptoms captured autonomously by AI Receptionist' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'provider_id', type: 'uuid', keyType: 'fk' },
      { name: 'starts_at', type: 'timestamptz', keyType: 'normal' },
      { name: 'status', type: 'enum', keyType: 'normal' }
    ]
  },
  {
    id: 'jobs',
    schema: 'field_service',
    name: 'service_jobs',
    displayName: 'service_jobs',
    category: 'service',
    badgeLabel: 'Service Workflow',
    rowCountBadge: '12 Dispatches',
    subtitle: 'Trades Dispatches & Parts',
    x: 670,
    y: 218, // Nested with 23px clearance below 'FIELD TRADES DISPATCH WORKFLOW' title
    width: 225,
    heightDetailed: 140,
    heightCompact: 68,
    icon: Wrench,
    accentColor: '#d97706',
    softBg: 'rgba(217, 119, 6, 0.08)',
    borderColor: '#d97706',
    description: 'Trade dispatches, emergency HVAC/electrical calls, technician truck inventory, and work orders.',
    rlsPolicy: 'Tenants can only access their own service jobs: (tenant_id = auth_user_tenant_id()).',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Field service job UUID' },
      { name: 'tenant_id', type: 'UUID', isFk: true, fkTarget: 'tenants.id', isRlsKey: true, description: 'Trade business partition key' },
      { name: 'contact_id', type: 'UUID', isFk: true, fkTarget: 'contacts.id', description: 'Customer or job-site property owner' },
      { name: 'technician_id', type: 'UUID', isFk: true, fkTarget: 'staff.id', description: 'Dispatched master technician or electrician' },
      { name: 'scheduled_for', type: 'TIMESTAMPTZ', description: 'On-site arrival scheduled datetime' },
      { name: 'priority', type: 'job_priority', description: 'Priority: low | medium | high | emergency' },
      { name: 'status', type: 'job_status', description: 'Status: pending_dispatch | dispatched | on_site | completed' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'tenant_id', type: 'uuid', keyType: 'rls' },
      { name: 'technician_id', type: 'uuid', keyType: 'fk' },
      { name: 'scheduled_at', type: 'timestamptz', keyType: 'normal' },
      { name: 'priority', type: 'enum', keyType: 'normal' }
    ]
  },
  {
    id: 'auth_users',
    schema: 'auth',
    name: 'users',
    displayName: 'users (GoTrue)',
    category: 'auth',
    badgeLabel: 'Supabase Auth',
    rowCountBadge: 'Managed Auth',
    subtitle: 'JWT Claims · RLS Issuer',
    x: 670,
    y: 405, // Nested with 23px clearance below 'IDENTITY & RLS SECURITY LAYER' title
    width: 225,
    heightDetailed: 140,
    heightCompact: 68,
    icon: Key,
    accentColor: '#8b5cf6',
    softBg: 'rgba(139, 92, 246, 0.08)',
    borderColor: '#8b5cf6',
    description: 'Managed Supabase Auth layer. Signs cryptographic JWTs containing app_metadata role and tenant_id claims.',
    rlsPolicy: 'Internal managed schema. Directly powers PostgreSQL functions auth_user_role() and auth_user_tenant_id().',
    columns: [
      { name: 'id', type: 'UUID', isPk: true, description: 'Subject UUID (auth.uid())' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Authenticated user email' },
      { name: 'encrypted_password', type: 'TEXT', description: 'Bcrypt hashed password' },
      { name: 'raw_app_meta_data', type: 'JSONB', description: 'Claims containing { role: user_role, tenant_id: UUID }' },
      { name: 'email_confirmed_at', type: 'TIMESTAMPTZ', description: 'Email confirmation timestamp' }
    ],
    previewColumns: [
      { name: 'id', type: 'uuid', keyType: 'pk' },
      { name: 'email', type: 'varchar(255)', keyType: 'normal' },
      { name: 'app_metadata', type: 'jsonb', keyType: 'rls' }
    ]
  }
];

// Clean non-colliding relationship links with parallel bus ports
const CONNECTIONS: ConnectionLink[] = [
  // 1. Industry to Tenant
  {
    id: 'c1',
    from: 'industries',
    to: 'tenants',
    category: 'core',
    fromPort: { x: 190, y: 265 },
    toPort: { x: 215, y: 265 }
  },

  // 2. Tenant to Core Tables (Parallel Bus)
  {
    id: 'c2',
    from: 'tenants',
    to: 'locations',
    category: 'core',
    fromPort: { x: 410, y: 195 },
    toPort: { x: 435, y: 60 }
  },
  {
    id: 'c3',
    from: 'tenants',
    to: 'staff',
    category: 'core',
    fromPort: { x: 410, y: 225 },
    toPort: { x: 435, y: 152 }
  },
  {
    id: 'c4',
    from: 'tenants',
    to: 'customers',
    category: 'core',
    fromPort: { x: 410, y: 255 },
    toPort: { x: 435, y: 247 }
  },
  {
    id: 'c5',
    from: 'tenants',
    to: 'activity_events',
    category: 'core',
    fromPort: { x: 410, y: 285 },
    toPort: { x: 435, y: 342 }
  },
  {
    id: 'c6',
    from: 'tenants',
    to: 'business_members',
    category: 'core',
    fromPort: { x: 410, y: 315 },
    toPort: { x: 435, y: 437 }
  },
  {
    id: 'c7',
    from: 'tenants',
    to: 'platform_admins',
    category: 'core',
    fromPort: { x: 410, y: 345 },
    toPort: { x: 435, y: 530 }
  },

  // 3. Core Tables to Medical Appointments (Distinct Pin Offsets)
  {
    id: 'c8',
    from: 'locations',
    to: 'appointments',
    category: 'medical',
    fromPort: { x: 640, y: 45 },
    toPort: { x: 670, y: 55 }
  },
  {
    id: 'c9',
    from: 'staff',
    to: 'appointments',
    category: 'medical',
    fromPort: { x: 640, y: 135 },
    toPort: { x: 670, y: 90 }
  },
  {
    id: 'c10',
    from: 'customers',
    to: 'appointments',
    category: 'medical',
    fromPort: { x: 640, y: 230 },
    toPort: { x: 670, y: 125 }
  },

  // 4. Core Tables to Field Service Jobs (Distinct Pin Offsets)
  {
    id: 'c11',
    from: 'locations',
    to: 'jobs',
    category: 'service',
    fromPort: { x: 640, y: 65 },
    toPort: { x: 670, y: 245 }
  },
  {
    id: 'c12',
    from: 'staff',
    to: 'jobs',
    category: 'service',
    fromPort: { x: 640, y: 155 },
    toPort: { x: 670, y: 280 }
  },
  {
    id: 'c13',
    from: 'customers',
    to: 'jobs',
    category: 'service',
    fromPort: { x: 640, y: 250 },
    toPort: { x: 670, y: 315 }
  },

  // 5. Auth Bindings (Dashed)
  {
    id: 'c14',
    from: 'business_members',
    to: 'auth_users',
    category: 'auth',
    isDashed: true,
    fromPort: { x: 640, y: 435 },
    toPort: { x: 670, y: 445 }
  },
  {
    id: 'c15',
    from: 'platform_admins',
    to: 'auth_users',
    category: 'auth',
    isDashed: true,
    fromPort: { x: 640, y: 525 },
    toPort: { x: 670, y: 485 }
  }
];

export const RelationalERDVisualizer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TableCategory>('all');
  const [density, setDensity] = useState<ViewDensity>('detailed');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tenants');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedDdl, setCopiedDdl] = useState(false);

  // Responsive container width tracking to guarantee ZERO horizontal scrollbar
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(BASE_WIDTH);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute responsive auto-fit scale
  const scale = useMemo(() => {
    const available = containerWidth > 0 ? containerWidth : BASE_WIDTH;
    if (available >= BASE_WIDTH) return 1;
    return Math.max(0.68, available / BASE_WIDTH);
  }, [containerWidth]);

  const baseHeight = density === 'detailed' ? BASE_HEIGHT_DETAILED : BASE_HEIGHT_COMPACT;

  // Selected node details
  const selectedNode = useMemo(() => {
    return TABLE_NODES.find((n) => n.id === selectedNodeId) || TABLE_NODES[1];
  }, [selectedNodeId]);

  // Connected nodes map for hover highlighting
  const connectedNodes = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const set = new Set<string>([hoveredNodeId]);
    CONNECTIONS.forEach((c) => {
      if (c.from === hoveredNodeId) set.add(c.to);
      if (c.to === hoveredNodeId) set.add(c.from);
    });
    return set;
  }, [hoveredNodeId]);

  // Compute bezier curve path between node distributed pins
  const getCurvePath = (conn: ConnectionLink) => {
    const startX = conn.fromPort.x;
    const startY = conn.fromPort.y;
    const endX = conn.toPort.x;
    const endY = conn.toPort.y;

    const deltaX = Math.max(24, (endX - startX) * 0.52);
    const cp1x = startX + deltaX;
    const cp1y = startY;
    const cp2x = endX - deltaX;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const copyTableDdl = () => {
    const ddl = `CREATE TABLE ${selectedNode.schema}.${selectedNode.name} (\n` +
      selectedNode.columns.map((c) => `  ${c.name} ${c.type}${c.isPk ? ' PRIMARY KEY' : ''}`).join(',\n') +
      `\n);\n\n-- Row Level Security Policy:\n-- ${selectedNode.rlsPolicy}`;
    navigator.clipboard.writeText(ddl);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0 }}>
      <style>{`
        @keyframes pulseLine {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        .erd-flowing-line {
          animation: pulseLine 1.4s linear infinite;
        }
      `}</style>

      {/* 1. Main ERD Visualizer Card */}
      <div
        className="clean-table-card"
        style={{
          padding: '22px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
      >
        {/* Diagram Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Shared multi-tenant relational model
              </h2>
              <span className="badge-clean badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Interactive Schema Studio
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4, marginBottom: 0 }}>
              Common organisation tables plus industry-specific workflow tables. Every tenant-owned row carries{' '}
              <code style={{ color: 'var(--primary)', background: 'var(--primary-soft)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                tenant_id
              </code>.
            </p>
          </div>

          {/* Technology Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(5, 150, 105, 0.1)',
                color: '#059669',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Database size={12} />
              PostgreSQL · Supabase
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <ShieldCheck size={12} />
              Row-Level Security Active
            </span>
          </div>
        </div>

        {/* Filter Controls & Search Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter:
            </span>

            {[
              { id: 'all', label: 'All Tables', color: 'var(--primary)' },
              { id: 'core', label: 'Shared Core', color: '#059669' },
              { id: 'medical', label: 'Clinic Workflow', color: '#0284c7' },
              { id: 'service', label: 'Service Workflow', color: '#d97706' },
              { id: 'auth', label: 'Supabase Auth', color: '#8b5cf6' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCategory(f.id as TableCategory)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  border: activeCategory === f.id ? `1.5px solid ${f.color}` : '1px solid var(--border-light)',
                  background: activeCategory === f.id ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                  color: activeCategory === f.id ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Density & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-subtle)',
                padding: 2,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}
            >
              <button
                onClick={() => setDensity('detailed')}
                style={{
                  padding: '4px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 5,
                  border: 'none',
                  background: density === 'detailed' ? 'var(--bg-surface)' : 'transparent',
                  color: density === 'detailed' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: density === 'detailed' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Maximize2 size={11} />
                Detailed
              </button>
              <button
                onClick={() => setDensity('compact')}
                style={{
                  padding: '4px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 5,
                  border: 'none',
                  background: density === 'compact' ? 'var(--bg-surface)' : 'transparent',
                  color: density === 'compact' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: density === 'compact' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Minimize2 size={11} />
                Compact
              </button>
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', width: 180 }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Find table/field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px 5px 28px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Responsive Auto-Fitting Canvas (Guaranteed ZERO horizontal scrollbar) */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            overflow: 'hidden', // Completely removes horizontal scrollbar
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '16px 0',
            userSelect: 'none'
          }}
        >
          {/* Scaled Responsive Outer Wrapper */}
          <div
            style={{
              width: BASE_WIDTH * scale,
              height: baseHeight * scale,
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* Native 1:1 Pixel Canvas transformed proportionally */}
            <div
              style={{
                width: BASE_WIDTH,
                height: baseHeight,
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
            >
              {/* Ambient Architecture Domain Zones */}
              {/* Zone 1: Core Multi-Tenant Boundary */}
              <div
                style={{
                  position: 'absolute',
                  left: 8,
                  top: 8,
                  width: 642,
                  height: baseHeight - 16,
                  background: 'rgba(5, 150, 105, 0.02)',
                  border: '1px dashed rgba(5, 150, 105, 0.22)',
                  borderRadius: 'var(--radius-lg)',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(5, 150, 105, 0.85)'
                  }}
                >
                  Core Multi-Tenant Partition Boundary
                </span>
              </div>

              {/* Zone 2: Clinical Healthcare Workflow */}
              <div
                style={{
                  position: 'absolute',
                  left: 660,
                  top: 8,
                  width: 245,
                  height: 175,
                  background: 'rgba(2, 132, 199, 0.025)',
                  border: '1px dashed rgba(2, 132, 199, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(2, 132, 199, 0.85)'
                  }}
                >
                  Clinical Healthcare Workflow
                </span>
              </div>

              {/* Zone 3: Field Trades Dispatch Workflow (Unblocked Title with clean 23px breathing room) */}
              <div
                style={{
                  position: 'absolute',
                  left: 660,
                  top: 195,
                  width: 245,
                  height: 175,
                  background: 'rgba(217, 119, 6, 0.025)',
                  border: '1px dashed rgba(217, 119, 6, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(217, 119, 6, 0.9)'
                  }}
                >
                  Field Trades Dispatch Workflow
                </span>
              </div>

              {/* Zone 4: Identity & RLS Security Layer (Unblocked Title) */}
              <div
                style={{
                  position: 'absolute',
                  left: 660,
                  top: 382,
                  width: 245,
                  height: 195,
                  background: 'rgba(139, 92, 246, 0.025)',
                  border: '1px dashed rgba(139, 92, 246, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  pointerEvents: 'none'
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 12,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(139, 92, 246, 0.9)'
                  }}
                >
                  Identity & RLS Security Layer
                </span>
              </div>

              {/* SVG Relationship Connector Lines */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <defs>
                  <linearGradient id="curveGradCore" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="curveGradMedical" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="curveGradService" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="curveGradAuth" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                  </linearGradient>

                  {/* Arrow markers */}
                  <marker id="arrowCore" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
                  </marker>
                  <marker id="arrowMedical" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
                  </marker>
                  <marker id="arrowService" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
                  </marker>
                  <marker id="arrowAuth" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
                  </marker>
                </defs>

                {CONNECTIONS.map((conn) => {
                  const isConnectedToHovered =
                    hoveredNodeId === conn.from || hoveredNodeId === conn.to;
                  const isMatchingCategory =
                    activeCategory === 'all' ||
                    conn.category === activeCategory ||
                    (activeCategory === 'medical' && conn.to === 'appointments') ||
                    (activeCategory === 'service' && conn.to === 'jobs') ||
                    (activeCategory === 'auth' && conn.to === 'auth_users');

                  let strokeColor = '#94a3b8';
                  let strokeWidth = 1.6;
                  let strokeOpacity = 0.5;
                  let markerUrl = '';

                  if (conn.category === 'core') {
                    strokeColor = 'url(#curveGradCore)';
                    markerUrl = 'url(#arrowCore)';
                  } else if (conn.category === 'medical') {
                    strokeColor = 'url(#curveGradMedical)';
                    markerUrl = 'url(#arrowMedical)';
                  } else if (conn.category === 'service') {
                    strokeColor = 'url(#curveGradService)';
                    markerUrl = 'url(#arrowService)';
                  } else if (conn.category === 'auth') {
                    strokeColor = 'url(#curveGradAuth)';
                    markerUrl = 'url(#arrowAuth)';
                  }

                  if (isConnectedToHovered) {
                    strokeWidth = 3;
                    strokeOpacity = 1;
                  } else if (hoveredNodeId && !isConnectedToHovered) {
                    strokeOpacity = 0.12;
                  } else if (!isMatchingCategory) {
                    strokeOpacity = 0.12;
                  }

                  return (
                    <path
                      key={conn.id}
                      d={getCurvePath(conn)}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={conn.isDashed ? '5,4' : isConnectedToHovered ? '8,4' : undefined}
                      className={isConnectedToHovered ? 'erd-flowing-line' : undefined}
                      markerEnd={strokeOpacity > 0.3 ? markerUrl : undefined}
                      style={{
                        transition: 'stroke-width 200ms ease, stroke-opacity 200ms ease'
                      }}
                    />
                  );
                })}
              </svg>

              {/* Render Table Node Cards (Clean & Non-truncated) */}
              {TABLE_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = connectedNodes.has(node.id);
                const isDimmed =
                  (hoveredNodeId !== null && !isHovered && !isConnected) ||
                  (activeCategory !== 'all' && node.category !== activeCategory && activeCategory !== 'core' && node.id !== 'tenants');

                const isSearchMatch =
                  !searchQuery ||
                  node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  node.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  node.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  node.columns.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

                const Icon = node.icon;
                const cardHeight = density === 'detailed' ? node.heightDetailed : node.heightCompact;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      height: cardHeight,
                      zIndex: isHovered || isSelected ? 12 : 2,
                      background: 'var(--bg-surface)',
                      border: `1.8px ${node.category === 'auth' ? 'dashed' : 'solid'} ${
                        isSelected ? 'var(--primary)' : isHovered ? node.accentColor : node.borderColor
                      }`,
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? `0 0 0 3px rgba(37, 99, 235, 0.25), 0 10px 22px -4px rgba(37, 99, 235, 0.15)`
                        : isHovered
                        ? `0 8px 20px -2px rgba(0, 0, 0, 0.1), 0 0 15px ${node.accentColor}25`
                        : 'var(--shadow-sm)',
                      opacity: !isSearchMatch ? 0.2 : isDimmed ? 0.22 : 1,
                      transform: isSelected || isHovered ? 'translateY(-2px)' : 'none',
                      transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      overflow: 'hidden'
                    }}
                    id={`erd-node-${node.id}`}
                  >
                    {/* Card Header (Full title without truncation) */}
                    <div
                      style={{
                        padding: '6px 10px',
                        background: node.softBg,
                        borderBottom: density === 'detailed' ? '1px solid var(--border-light)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                        <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                          <Icon size={13} color={node.accentColor} />
                        </span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono, monospace)',
                            flexShrink: 0
                          }}
                        >
                          {node.schema}.
                        </span>
                        <strong
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            fontFamily: 'var(--font-mono, monospace)',
                            letterSpacing: '-0.02em',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {node.name}
                        </strong>
                      </div>

                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface)',
                          color: node.accentColor,
                          border: `1px solid ${node.borderColor}`,
                          flexShrink: 0
                        }}
                      >
                        {node.rowCountBadge}
                      </span>
                    </div>

                    {/* Card Body: Columns Preview (Detailed Mode) */}
                    {density === 'detailed' ? (
                      <div
                        style={{
                          padding: '6px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono, monospace)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {node.previewColumns.map((col) => (
                          <div
                            key={col.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 4
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                              {col.keyType === 'pk' && <span style={{ color: '#d97706', fontSize: '0.65rem' }} title="Primary Key">🔑</span>}
                              {col.keyType === 'fk' && <span style={{ color: '#2563eb', fontSize: '0.65rem' }} title="Foreign Key">🔗</span>}
                              {col.keyType === 'rls' && <span style={{ color: '#059669', fontSize: '0.65rem' }} title="RLS Tenant Key">🛡️</span>}
                              {col.keyType === 'normal' && <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>•</span>}
                              <span
                                style={{
                                  fontWeight: col.keyType === 'pk' || col.keyType === 'rls' ? 700 : 500,
                                  color: col.keyType === 'pk' ? 'var(--text-main)' : 'var(--text-secondary)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {col.name}
                              </span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', flexShrink: 0 }}>
                              {col.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Compact Subtitle Mode */
                      <div
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono, monospace)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {node.subtitle}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}
        >
          {/* Pill Legends */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, border: '2px solid #059669', background: 'rgba(5,150,105,0.1)' }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Shared core</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, border: '2px solid #0284c7', background: 'rgba(2,132,199,0.1)' }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Clinic workflow</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, border: '2px solid #d97706', background: 'rgba(217,119,6,0.1)' }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Service workflow</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, border: '2px dashed #8b5cf6', background: 'rgba(139,92,246,0.1)' }} />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Supabase Auth (managed)</span>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={12} color="var(--primary)" />
            <span>Arrows run from <strong>one</strong> side to <strong>many</strong> side. Click any table to inspect full columns and live RLS rules.</span>
          </div>
        </div>

        {/* Informational Callout */}
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}
        >
          <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Row-Level Security Architecture:</strong> Appointments and jobs carry direct <code style={{ color: 'var(--primary)', background: 'var(--primary-soft)', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>tenant_id</code> foreign keys like every tenant-owned table. Direct diagram lines to the root tenant are omitted to maintain visual clarity; PostgreSQL Row-Level Security automatically verifies <code style={{ color: 'var(--primary)', background: 'var(--primary-soft)', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>tenant_id = auth_user_tenant_id()</code> at the database kernel level.
          </div>
        </div>
      </div>

      {/* 3. Interactive Schema & RLS Inspector Drawer */}
      <div
        className="clean-table-card"
        style={{
          padding: '22px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: selectedNode.softBg,
                color: selectedNode.accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${selectedNode.borderColor}`,
                flexShrink: 0
              }}
            >
              <selectedNode.icon size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedNode.schema}.{selectedNode.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedNode.softBg,
                    color: selectedNode.accentColor,
                    border: `1px solid ${selectedNode.borderColor}`
                  }}
                >
                  {selectedNode.badgeLabel}
                </span>
                <span className="badge-clean badge-neutral" style={{ fontSize: '0.66rem' }}>
                  {selectedNode.rowCountBadge}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
                {selectedNode.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={copyTableDdl}
              className="btn-clean-secondary"
              style={{ padding: '6px 12px', fontSize: '0.76rem' }}
            >
              {copiedDdl ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              <span>{copiedDdl ? 'DDL Copied' : 'Copy Table DDL'}</span>
            </button>
          </div>
        </div>

        {/* Row-Level Security Policy Box */}
        <div
          style={{
            marginBottom: 14,
            padding: '10px 14px',
            background: 'rgba(5, 150, 105, 0.05)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}
        >
          <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#059669' }}>Active RLS Rule: </strong>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.76rem', color: 'var(--text-main)' }}>
              {selectedNode.rlsPolicy}
            </span>
          </div>
        </div>

        {/* Columns Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="clean-table" style={{ width: '100%', fontSize: '0.78rem' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Column Name</th>
                <th style={{ width: '24%' }}>Data Type</th>
                <th style={{ width: '16%' }}>Key Constraint</th>
                <th style={{ width: '38%' }}>Domain Description</th>
              </tr>
            </thead>
            <tbody>
              {selectedNode.columns.map((col) => (
                <tr key={col.name}>
                  <td>
                    <code style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                      {col.name}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--primary)', fontSize: '0.74rem' }}>
                      {col.type}
                    </span>
                  </td>
                  <td>
                    {col.isPk && (
                      <span className="badge-clean badge-warning" style={{ fontSize: '0.64rem', marginRight: 4 }}>
                        PK
                      </span>
                    )}
                    {col.isFk && (
                      <span className="badge-clean badge-primary" style={{ fontSize: '0.64rem', marginRight: 4 }}>
                        FK → {col.fkTarget}
                      </span>
                    )}
                    {col.isRlsKey && (
                      <span className="badge-clean badge-success" style={{ fontSize: '0.64rem' }}>
                        RLS Partition
                      </span>
                    )}
                    {!col.isPk && !col.isFk && !col.isRlsKey && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                    {col.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
