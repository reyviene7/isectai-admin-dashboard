# iSectAI Platform: Database Architecture & Internal Admin Dashboard

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)
[![PostgreSQL / Supabase](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-3ECF8E.svg)](https://supabase.com)

A high-performance, modern multi-tenant admin dashboard prototype and complete PostgreSQL database architecture for **iSectAI** (New York).

The platform centralizes the management, monitoring, and telemetry of AI-powered services across medical clinics and commercial service businesses.

---

## 🚀 Quick Start (Instant Run in Under 60 Seconds)

You can run and evaluate the prototype immediately without requiring any external accounts or setup:

```bash
# 1. Install dependencies
npm install

# 2. Launch development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser. The application loads with pre-configured mock data reflecting the exact PostgreSQL schema, with full interactivity.

---

## 🗄️ Setting Up the Supabase Database (Cloud Connection)

To connect this dashboard to a live Supabase PostgreSQL database:

### 1. Create a Supabase Project
1. Log in to [Supabase](https://database.new) and create a new project.
2. Note your **Project URL** and **Anon Public API Key** from **Project Settings ➔ API**.

### 2. Execute the Database Schema & Seed Data
1. Open the **SQL Editor** tab in your Supabase dashboard.
2. Copy and paste the contents of [`supabase/schema.sql`](file:///supabase/schema.sql) and click **Run**. This establishes:
   - Custom ENUM types (`business_industry`, `tenant_status`, `job_priority`, etc.).
   - Core tables (`tenants`, `users`, `ai_agents`, `contacts`, `appointments`, `service_jobs`, `ai_activity_logs`).
   - Performance indexes on tenant foreign keys and timestamps.
   - Row Level Security (RLS) policies and tenant isolation functions.
3. Copy and paste the contents of [`supabase/seed.sql`](file:///supabase/seed.sql) and click **Run**. This prepopulates:
   - **Apex Dental & Maxillofacial Care** (Medical Clinic)
   - **PulsePoint Cardiology & Vascular Center** (Medical Clinic)
   - **VoltFlow HVAC, Plumbing & Electrical** (Service Business)
   - Realistic appointments, dispatch jobs, and AI call logs.

### 3. Connect the Dashboard to Supabase
You can connect in either of two ways:

#### Option A: Via the Web Dashboard UI (Easiest)
1. In the top navigation bar of the dashboard, click the **"Local DB Demo"** status pill.
2. Enter your **Project URL** and **Anon Key**.
3. Click **"Connect & Verify"**. The application will perform a live ping test, measure roundtrip latency, and immediately switch to live database queries.

#### Option B: Via `.env` File
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Populate your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart the dev server (`npm run dev`).

---

## 🎨 UI/UX Features & Capabilities

- **Pinterest-Inspired Modern Aesthetic:** Obsidian glassmorphic surfaces, curated typography (Plus Jakarta Sans), responsive Bento Grid layouts, and subtle micro-animations.
- **Multi-Tenant Filter Pills:** Seamless filtering across *All Businesses*, *Medical Clinics*, *Field Services*, and *Enterprise Tiers*.
- **Live Search & Dual View Modes:** Instant search with one-click toggling between the visual Bento Grid and structured Data Table.
- **Slide-Over Detail Drawer:** Click any business card or table row to inspect:
  - **Domain Records:** Specialized appointment schedules for medical clinics and work order dispatches for service contractors.
  - **AI Agent Profile:** Model parameters (`gpt-4o`), DID phone number, and active system prompts.
  - **AI Call Telemetry:** Duration, tokens consumed, sentiment tags, and transcript snippets.
- **Real-Time Simulation Trigger:** Click **"Simulate Call"** on any business card to trigger an incoming emergency voice call, generating a new appointment or emergency dispatch in real-time.
- **Built-in Architecture Whitepaper:** Click **"Architecture & RLS"** in the navigation bar to review direct answers to the trial prompt's questions, ERD diagram, and copyable SQL.

---

## 📁 Repository Structure

```
iSectAI/
├── supabase/
│   ├── schema.sql              # Complete PostgreSQL DDL, RLS, and indexes
│   └── seed.sql                # Fictional sample data (2 medical, 1 service)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Sticky header with live DB status badge
│   │   ├── MetricCards.tsx     # Bento-style KPI statistics widgets
│   │   ├── BusinessList.tsx    # Filterable listing with Grid & Table views
│   │   ├── BusinessCard.tsx    # Pinterest-style business card with live audio wave
│   │   ├── BusinessDetailDrawer.tsx # Slide-over records and AI agent drawer
│   │   ├── ArchitectureModal.tsx # In-app architecture review & SQL inspector
│   │   ├── SupabaseConfigModal.tsx # Live connection tester and key manager
│   │   └── AddBusinessModal.tsx # Interactive onboarding modal for new tenants
│   ├── data/
│   │   └── mockData.ts         # Preloaded sample data matching seed.sql
│   ├── lib/
│   │   ├── api.ts              # Unified API layer (Supabase query + local fallback)
│   │   ├── supabase.ts         # Supabase client setup & connection ping test
│   │   └── types.ts            # TypeScript interfaces
│   ├── App.tsx                 # Core application layout and state
│   ├── index.css               # Design system & CSS variables
│   └── main.tsx
├── ARCHITECTURE.md             # Complete technical architecture whitepaper
├── .env.example                # Environment variables template
├── package.json
└── README.md
```

---

## 🛡️ Security & Architecture Documentation

For a comprehensive explanation of:
- Why PostgreSQL/Supabase was chosen over NoSQL alternatives
- Multi-tenancy isolation via PostgreSQL Row Level Security (RLS)
- Internal Platform Administrator vs. Customer RBAC
- Production roadmap (HIPAA BAA compliance, read replicas, and `pgvector` knowledge bases)

Please read the full **[`ARCHITECTURE.md`](file:///ARCHITECTURE.md)** whitepaper included in this repository, or click the **"Architecture & RLS"** button inside the running application.
