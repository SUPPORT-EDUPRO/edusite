# EduDash Pro Ecosystem - Complete Architecture & Business Model

**Version:** 2.0  
**Date:** November 20, 2025  
**Status:** Production Ready  
**Currency:** South African Rand (ZAR/R)  
**Author:** EduDash Pro Architecture Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Multi-Database Architecture](#2-multi-database-architecture)
3. [Premium CMS Add-On Business Model](#3-premium-cms-add-on-business-model)
4. [Professional UI/UX Standards](#4-professional-uiux-standards)
5. [TTS Language & Voice Selection System](#5-tts-language--voice-selection-system)
6. [Implementation Roadmap with Revenue Projections](#6-implementation-roadmap-with-revenue-projections)
7. [Database Schemas & API Bridges](#7-database-schemas--api-bridges)
8. [Component Design System](#8-component-design-system)
9. [Mobile-First Development Rules](#9-mobile-first-development-rules)
10. [Security & Compliance](#10-security--compliance)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [Deployment & DevOps](#12-deployment--devops)
13. [Cost Analysis & Break-Even Projections](#13-cost-analysis--break-even-projections)
14. [Competitive Analysis](#14-competitive-analysis)
15. [Appendices & Reference Materials](#15-appendices--reference-materials)

---

## 1. Executive Summary

### 1.1 Vision Statement

**EduDash Pro** is a comprehensive, multi-tenant educational platform ecosystem designed to revolutionize how South African educational institutions manage operations, engage with families, and present themselves online. The platform combines three distinct but interconnected applications serving different purposes while maintaining strict tenant isolation and professional-grade user experiences.

**Mission:** Empower every South African educational institution—from preschools to universities—with enterprise-grade tools at accessible prices, leveraging AI to reduce administrative burden and enhance learning outcomes.

---

### 1.2 Platform Overview

#### Three-Application Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                    EduDash Pro Ecosystem                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   EduDashPro     │  │   EduSitePro     │  │ Young Eagles │ │
│  │   (Operations)   │  │ (Website Builder)│  │   (Custom)   │ │
│  │                  │  │                  │  │              │ │
│  │ • Dashboard      │  │ • CMS Builder    │  │ • Vite App   │ │
│  │ • Student Mgmt   │  │ • Page Editor    │  │ • Standalone │ │
│  │ • AI Lessons     │  │ • Theme Designer │  │ • Reference  │ │
│  │ • Attendance     │  │ • Form Builder   │  │ • Implementation│
│  │ • Billing        │  │ • Analytics      │  │              │ │
│  │                  │  │                  │  │              │ │
│  │ React Native +   │  │ Next.js 14       │  │ Vite 7.0.4   │ │
│  │ Next.js Web      │  │ TypeScript       │  │ React 18     │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│          │                      │                     │         │
│          └──────────────────────┴─────────────────────┘         │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │   API Bridge Layer      │                  │
│                    │ • Sync Tenants          │                  │
│                    │ • Sync Branding         │                  │
│                    │ • Cross-DB Queries      │                  │
│                    └────────────┬────────────┘                  │
│                                 │                               │
│         ┌───────────────────────┴───────────────────┐           │
│         │                                           │           │
│  ┌──────▼──────────┐                    ┌──────────▼────────┐  │
│  │  Database 1     │                    │   Database 2      │  │
│  │ lvvvjywrmpcqrpv │                    │ bppuzibjlxgfwrujz │  │
│  │                 │                    │                   │  │
│  │ • Operations    │                    │ • Websites        │  │
│  │ • Students      │                    │ • Pages           │  │
│  │ • Teachers      │                    │ • Registrations   │  │
│  │ • Classes       │                    │ • CMS Content     │  │
│  │ • Lessons       │                    │ • Themes          │  │
│  │ • Attendance    │                    │ • Media           │  │
│  └─────────────────┘                    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Key Differentiators

#### For Educational Institutions

**1. Unified Operations + Marketing**
- Single ecosystem for running daily operations (EduDashPro) AND building public websites (EduSitePro)
- Branding automatically syncs from website to dashboard (logo, colors, fonts)
- Registration forms on website flow directly into operational dashboard

**2. AI-Powered Education**
- CAPS-aligned lesson generation (South African curriculum)
- Automated homework grading with detailed feedback
- Parent communication via WhatsApp in 11 SA languages
- Voice-enabled accessibility (Text-to-Speech with local accents)

**3. Multi-Tenant by Design**
- Strict RLS (Row-Level Security) ensures complete data isolation
- Each institution sees ONLY their data, always
- SuperAdmin oversight without compromising tenant privacy
- Scales from 1 to 10,000+ institutions on shared infrastructure

**4. Mobile-First Architecture**
- 44px minimum touch targets (WCAG AAA compliant)
- Progressive Web App (PWA) installable on any device
- React Native app for iOS/Android (native performance)
- Works offline with smart sync when connectivity returns

---

### 1.4 Pricing Structure (ZAR)

**Currency Note:** All pricing in South African Rand (R). USD equivalent shown at R18.50/$1 (Nov 2025 rate).

#### Subscription Tiers (Monthly Pricing)

| Tier | Price (ZAR) | Price (USD) | Annual (ZAR) | Annual (USD) |
|------|-------------|-------------|--------------|--------------|
| **Free** | R0 | $0 | R0 | $0 |
| **CMS Starter** | R499 | ~$27 | R4,990 | ~$270 |
| **CMS Pro** | R1,399 | ~$76 | R13,990 | ~$756 |
| **CMS Enterprise** | R3,499 | ~$189 | R34,990 | ~$1,891 |

**Annual Discount:** 17% off (2 months free)

---

#### Feature Comparison Matrix

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Monthly Price** | R0 | R499 | R1,399 | R3,499 |
| **Operations Dashboard** | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Website Builder** | ❌ | ✅ Basic | ✅ Advanced | ✅ White-label |
| **Editor Accounts** | 1 | 1 | 5 | Unlimited |
| **Pages** | 0 | 10 | Unlimited | Unlimited |
| **Content Blocks** | 0 | 10 basic | All 15 blocks | All + custom |
| **Forms** | ❌ | 1 contact form | Form builder | Advanced logic |
| **Custom Domain** | ❌ | ❌ | ✅ | ✅ Multi-domain |
| **AI Quota/Month** | 100 requests | 500 requests | 2,000 requests | Unlimited* |
| **TTS Characters/Month** | 0 | 10,000 | 50,000 | Unlimited* |
| **Support** | Community | Email (48h) | Priority (24h) | Dedicated manager |
| **Branding** | Required badge | Optional badge | Removable | White-label |
| **API Access** | ❌ | ❌ | ❌ | ✅ Full REST/GraphQL |
| **SLA** | None | 99% | 99.5% | 99.9% |

*Fair use policy applies

---

### 1.5 Target Market & Revenue Potential

#### Primary Market: South Africa

**1. Early Childhood Development (ECD) Centres**
- **Market Size:** ~24,000 registered centres (Dept. Social Development, 2024)
- **Target Segment:** 5,000 centres (urban, 50+ students)
- **ARPU:** R499-1,399/month
- **TAM:** R30M - R84M annual revenue

**2. Primary Schools (Grade R-7)**
- **Market Size:** ~13,500 schools (DBE Statistics, 2024)
- **Target Segment:** 3,000 schools (independent + well-funded public)
- **ARPU:** R1,399-3,499/month
- **TAM:** R50M - R126M annual revenue

**3. High Schools & FET Colleges**
- **Market Size:** ~6,000 secondary schools + 50 FET colleges
- **Target Segment:** 1,500 schools
- **ARPU:** R3,499+/month
- **TAM:** R63M+ annual revenue

**Total South African TAM:** **R143M - R273M ARR** ($7.7M - $14.8M USD)

---

### 1.6 Success Metrics (Year 1 Targets)

#### Customer Acquisition Projections

| Quarter | Customers | MRR (ZAR) | ARR (ZAR) | Churn |
|---------|-----------|-----------|-----------|-------|
| **Q1** | 50 | R42,450 | R509,400 | <5% |
| **Q2** | 200 | R203,800 | R2,445,600 | <8% |
| **Q3** | 500 | R594,750 | R7,137,000 | <10% |
| **Q4** | 1,000 | R1,273,500 | R15,282,000 | <12% |

**Assumptions:**
- Customer Mix: 60% Starter (R499), 30% Pro (R1,399), 10% Enterprise (R3,499)
- Average Weighted ARPU: R849/month
- Customer Lifetime: 36 months (3 years)
- CAC: R2,550 (~$138) via organic + paid search
- LTV:CAC Ratio: 8:1 (target >3:1 healthy)

---

### 1.7 Investment & Break-Even Analysis

#### Development Costs (8-Month Runway)

| Phase | Duration | Dev Hours | Cost @ R1,850/hr ($100) |
|-------|----------|-----------|-------------------------|
| Phase 1: API Bridges | 2 weeks | 80 | R148,000 |
| Phase 2: CMS Starter | 4 weeks | 160 | R296,000 |
| Phase 3: CMS Pro | 4 weeks | 160 | R296,000 |
| Phase 4: Enterprise | 4 weeks | 120 | R222,000 |
| Phase 5: TTS & Polish | 4 weeks | 120 | R222,000 |
| **Total Development** | **18 weeks** | **640 hours** | **R1,184,000** |

**Additional Costs (8 months):**
- Infrastructure (Supabase, Vercel): R9,250/month = R74,000
- Third-party APIs (ElevenLabs, SendGrid): R5,550/month = R44,400
- Marketing (ads, content): R37,000/month = R296,000
- **Total 8-Month Investment:** **R1,598,400** (~$86,400 USD)

---

#### Monthly Operating Costs (Post-Launch)

| Category | Cost (ZAR) | Cost (USD) |
|----------|------------|------------|
| Infrastructure (Supabase + Vercel) | R9,250 | ~$500 |
| APIs (ElevenLabs, SendGrid, etc.) | R5,550 | ~$300 |
| Support Staff (part-time) | R22,200 | ~$1,200 |
| Marketing & Ads | R37,000 | ~$2,000 |
| **Total Fixed Costs** | **R74,000/month** | **~$4,000** |

---

#### Break-Even Analysis

**Customers Needed (Single Tier):**
- Starter-only: 149 customers (R499 × 149 = R74,251)
- Pro-only: 53 customers (R1,399 × 53 = R74,147)
- Enterprise-only: 22 customers (R3,499 × 22 = R76,978)

**Realistic Customer Mix (60/30/10):**
- 75 Starter (R37,425) + 30 Pro (R41,970) + 10 Enterprise (R34,990) = **115 customers = R114,385 MRR**
- **Break-even at ~65 mixed customers (R74,000 revenue)**
- **Expected Timeline:** End of Q2 (Month 6 post-launch)

---

### 1.8 Strategic Risks & Mitigations

#### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cross-database sync failures | Medium | High | Idempotent APIs, retry with exponential backoff, monitoring alerts |
| RLS policy vulnerabilities | Low | Critical | Automated security tests, bi-annual penetration testing |
| TTS API downtime (ElevenLabs) | Low | Medium | Fallback to browser TTS, queue with retry logic |
| Supabase regional outage | Low | High | Multi-region replication (Enterprise tier), automated failover |
| Performance degradation at scale | Medium | Medium | Redis caching layer, query optimization, CDN for assets |

#### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low free→paid conversion (<5%) | Medium | High | 14-day Pro trial, upgrade prompts, email nurture campaigns |
| High churn (>15% monthly) | Medium | High | Onboarding checklist, success dashboard, quarterly reviews |
| Price sensitivity (SA market) | Medium | Medium | Flexible annual plans, discounts for multi-year, NGO pricing |
| Regulatory changes (POPIA Act) | Low | Critical | Legal review every 12 months, data residency compliance |

---

### 1.9 Next Immediate Actions

**Development Team (This Week):**
1. ✅ Complete `/api/sync-tenant` endpoint (EduDashPro)
2. ✅ Complete `/api/sync-branding` endpoint (both apps)
3. ⏳ Implement Supabase Auth in EduSitePro
4. ⏳ Create `users`, `centre_users`, `roles` tables
5. ⏳ Test cross-database registration flow

**Product Team (This Week):**
1. ✅ Finalize pricing (reviewed against competitors)
2. ⏳ Create upgrade flow mockups (Figma)
3. ⏳ Write feature comparison matrix
4. ⏳ Draft onboarding email sequence (5 emails)

**Marketing Team (Next 2 Weeks):**
1. ⏳ Build CMS landing page (benefits, pricing, demo video)
2. ⏳ Create 3-minute product demo video
3. ⏳ Set up PostHog analytics (product usage tracking)
4. ⏳ Prepare launch email (existing user base)

---

**Document Status:** Section 1 Complete ✅  
**Next Section:** [2. Multi-Database Architecture](#2-multi-database-architecture)

---


## 2. Multi-Database Architecture

### 2.1 Architecture Overview

EduDash Pro uses a **federated multi-database architecture** with two separate Supabase PostgreSQL instances connected via API bridges. This design separates concerns between **operational data** (student records, attendance, lessons) and **public-facing content** (websites, registration forms, marketing pages).

---

#### Database Separation Rationale

**Why Two Databases Instead of One?**

| Consideration | Single Database | Multi-Database (Current) |
|---------------|-----------------|--------------------------|
| **Regulatory Compliance** | POPIA applies to all data equally | Separate PII (operations) from public content |
| **Scalability** | Vertical scaling only | Independent horizontal scaling per workload |
| **Performance** | Queries compete for resources | CMS queries don't impact dashboard performance |
| **Backup & Recovery** | All-or-nothing backup | Granular restore (e.g., restore website without affecting operations) |
| **Team Organization** | Dev team needs access to all data | Content team limited to CMS DB, dev team to operations |
| **Cost Optimization** | Same compute for all workloads | Right-size each database (CMS can use smaller instance) |
| **Vendor Lock-in** | Single point of failure | Can migrate CMS to different provider without touching operations |

**Decision:** Multi-database architecture provides better separation of concerns, compliance, and scalability despite added complexity.

---

### 2.2 Database 1: Operations (EduDashPro)

**Supabase Project ID:** `lvvvjywrmpcqrpvuptdi`  
**Primary URL:** `https://lvvvjywrmpcqrpvuptdi.supabase.co`  
**Region:** South Africa (Johannesburg) - Cape Town fallback  
**Purpose:** Daily operational data for running educational institutions

#### Core Tables

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  organization_type VARCHAR(50) DEFAULT 'preschool', -- preschool, k-12, high-school, university
  plan_tier VARCHAR(20) DEFAULT 'free', -- free, cms_starter, cms_pro, cms_enterprise
  max_students INT DEFAULT 50,
  max_teachers INT DEFAULT 5,
  
  -- Contact Info
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Billing
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'active', -- active, past_due, canceled, trialing
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Branding (synced from EduSitePro)
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#7c3aed',
  secondary_color VARCHAR(7) DEFAULT '#4f46e5',
  font_family VARCHAR(100) DEFAULT 'Inter',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- RLS Helper
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- RLS Policy
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see only their organization"
  ON organizations FOR SELECT
  USING (id = current_setting('app.current_organization_id', true)::uuid);
```

```sql
-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  id_number VARCHAR(50),
  
  -- Enrollment
  enrollment_date DATE DEFAULT CURRENT_DATE,
  grade_level VARCHAR(20),
  class_id UUID REFERENCES classes(id),
  student_status VARCHAR(20) DEFAULT 'active', -- active, graduated, withdrawn, suspended
  
  -- Parent/Guardian
  primary_guardian_name VARCHAR(255),
  primary_guardian_email VARCHAR(255),
  primary_guardian_phone VARCHAR(50),
  
  -- Medical
  medical_conditions TEXT,
  allergies TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations see only their students"
  ON students FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

```sql
-- Teachers
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Employment
  employment_date DATE DEFAULT CURRENT_DATE,
  job_title VARCHAR(100),
  qualifications TEXT,
  specializations TEXT[],
  
  -- Status
  teacher_status VARCHAR(20) DEFAULT 'active', -- active, on_leave, resigned
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations see only their teachers"
  ON teachers FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

```sql
-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Class Info
  class_name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(20),
  academic_year INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Assignment
  teacher_id UUID REFERENCES teachers(id),
  max_students INT DEFAULT 25,
  
  -- Schedule
  class_schedule JSONB, -- e.g., {"monday": ["08:00-09:00", "..."], ...}
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- RLS Policy
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations see only their classes"
  ON classes FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

**Additional Tables:**
- `lessons` - AI-generated lessons and worksheets
- `attendance` - Daily attendance records
- `assessments` - Tests, quizzes, homework assignments
- `grades` - Student performance data
- `fees` - Billing and payment records
- `announcements` - School-wide communications
- `ai_usage` - Track AI API consumption per organization

---

### 2.3 Database 2: Websites & CMS (EduSitePro)

**Supabase Project ID:** `bppuzibjlxgfwrujzfsz`  
**Primary URL:** `https://bppuzibjlxgfwrujzfsz.supabase.co`  
**Region:** South Africa (Johannesburg)  
**Purpose:** Public websites, registration forms, CMS content, themes

#### Core Tables

```sql
-- Centres (Maps to organizations in DB1)
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL, -- SYNCED from DB1 (same UUID)
  
  -- Basic Info
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Domain Configuration
  primary_domain VARCHAR(255), -- e.g., youngeagles.co.za
  default_subdomain VARCHAR(100), -- e.g., youngeagles.edudashpro.co.za
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
  plan_tier VARCHAR(20) DEFAULT 'free', -- Duplicated from DB1 for quick access
  
  -- Branding
  branding JSONB DEFAULT '{}', -- {"logo_url": "...", "colors": {...}}
  brand_theme JSONB DEFAULT '{}',
  
  -- Deployment
  vercel_project_name VARCHAR(255),
  vercel_deploy_hook_url TEXT,
  last_deployed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active centres"
  ON centres FOR SELECT
  USING (status = 'active');
```

```sql
-- Pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  
  -- Page Info
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- SEO
  og_image TEXT,
  keywords TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(centre_id, slug)
);

-- RLS Policy
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Centres see only their pages"
  ON pages FOR SELECT
  USING (centre_id IN (
    SELECT id FROM centres WHERE organization_id = current_setting('app.current_organization_id', true)::uuid
  ));
```

```sql
-- Page Blocks (CMS Content)
CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Block Configuration
  block_key TEXT NOT NULL, -- e.g., 'hero', 'gallery', 'testimonials'
  props JSONB NOT NULL DEFAULT '{}', -- Block-specific properties
  block_order INTEGER NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocks inherit page permissions"
  ON page_blocks FOR SELECT
  USING (
    page_id IN (
      SELECT id FROM pages WHERE centre_id IN (
        SELECT id FROM centres WHERE organization_id = current_setting('app.current_organization_id', true)::uuid
      )
    )
  );
```

```sql
-- Registration Requests (Public Form Submissions)
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL, -- Links to DB1 organizations
  
  -- Student Info
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_dob DATE NOT NULL,
  student_gender VARCHAR(20),
  
  -- Guardian Info
  guardian_name VARCHAR(255) NOT NULL,
  guardian_email VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(50) NOT NULL,
  guardian_address TEXT,
  
  -- Enrollment Preferences
  preferred_class VARCHAR(100),
  preferred_start_date DATE,
  
  -- Status
  request_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approval_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Campaign Tracking
  early_bird BOOLEAN DEFAULT FALSE,
  referral_source VARCHAR(100),
  
  -- Metadata
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations see only their registration requests"
  ON registration_requests FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

CREATE POLICY "Public can insert registrations"
  ON registration_requests FOR INSERT
  WITH CHECK (true); -- Anyone can submit registration forms
```

```sql
-- Themes (Visual Customization)
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID REFERENCES centres(id) ON DELETE CASCADE,
  
  -- Theme Info
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Design Tokens
  colors JSONB DEFAULT '{
    "primary": "#7c3aed",
    "secondary": "#4f46e5",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "text": "#1c1917",
    "textMuted": "#78716c"
  }',
  typography JSONB DEFAULT '{
    "fontFamily": "Inter",
    "headingFontFamily": "Inter",
    "fontSize": "16px",
    "lineHeight": "1.5"
  }',
  layout JSONB DEFAULT '{
    "containerWidth": "1280px",
    "borderRadius": "0.5rem",
    "spacing": "1rem"
  }',
  
  -- Advanced Customization
  custom_css TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Centres see only their themes"
  ON themes FOR SELECT
  USING (centre_id IN (
    SELECT id FROM centres WHERE organization_id = current_setting('app.current_organization_id', true)::uuid
  ));
```

**Additional Tables:**
- `media` - Images, videos, documents (Supabase Storage)
- `navigation_menus` - Header/footer navigation structures
- `forms` - Custom form definitions (CMS Pro+)
- `form_submissions` - Form submission data
- `analytics_events` - Page views, clicks, conversions

---

### 2.4 API Bridge Layer

The API bridge layer synchronizes critical data between the two databases and enables cross-database queries without violating RLS policies.

#### Bridge Endpoints

**1. Sync Tenant Creation (`POST /api/sync-tenant`)**

**Location:** Both `edudashpro/web/src/app/api/sync-tenant/route.ts` AND `edusitepro/src/app/api/sync-tenant/route.ts`

**Purpose:** When a new organization is created in EduDashPro, automatically create a corresponding `centre` in EduSitePro (and vice versa).

**Flow:**
```
EduDashPro Admin creates organization "ABC Preschool"
    ↓
organization.id = "123e4567-e89b-12d3-a456-426614174000"
    ↓
POST https://edusitepro.com/api/sync-tenant
    {
      "organization_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "ABC Preschool",
      "slug": "abc-preschool",
      "plan_tier": "cms_starter"
    }
    ↓
EduSitePro creates centre with SAME organization_id
    ↓
Return success + centre_id
```

**Authentication:** Internal API key (stored in environment variables)

```typescript
// edudashpro/web/src/app/api/sync-tenant/route.ts
import { createClient } from '@supabase/supabase-js';

const EDUSITEPRO_API_URL = process.env.EDUSITEPRO_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(request: Request) {
  const { organization_id, name, slug, plan_tier } = await request.json();
  
  // Call EduSitePro to create centre
  const response = await fetch(`${EDUSITEPRO_API_URL}/api/sync-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-API-Key': INTERNAL_API_KEY,
    },
    body: JSON.stringify({ organization_id, name, slug, plan_tier }),
  });
  
  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to sync tenant' }), {
      status: 500,
    });
  }
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
```

---

**2. Sync Branding (`POST /api/sync-branding`)**

**Purpose:** When a tenant updates their branding in the EduSitePro CMS (logo, colors, fonts), sync those changes to the EduDashPro operations database so the dashboard reflects the same branding.

**Flow:**
```
Tenant updates theme in EduSitePro CMS
    ↓
themes table updated (logo_url, primary_color, font_family)
    ↓
POST https://edudashpro.org.za/api/sync-branding
    {
      "organization_id": "123e4567...",
      "logo_url": "https://storage.supabase.co/...",
      "primary_color": "#FF5733",
      "secondary_color": "#C70039",
      "font_family": "Poppins"
    }
    ↓
EduDashPro updates organizations.branding column
    ↓
Dashboard components re-render with new branding
```

**Implementation:**
```typescript
// edudashpro/web/src/app/api/sync-branding/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

export async function POST(request: Request) {
  // Verify internal API key
  const apiKey = request.headers.get('X-Internal-API-Key');
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { organization_id, logo_url, primary_color, secondary_color, font_family } =
    await request.json();
  
  // Update branding in operations DB
  const { error } = await supabase
    .from('organizations')
    .update({
      logo_url,
      primary_color,
      secondary_color,
      font_family,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organization_id);
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
```

---

**3. Fetch Registrations (`GET /api/registrations/[orgId]`)**

**Purpose:** Allow EduDashPro dashboard to query registration requests from the EduSitePro database (since registration forms are submitted to the website DB).

**Flow:**
```
Principal opens dashboard → "Pending Registrations" widget
    ↓
GET https://edusitepro.com/api/registrations/123e4567...
    Headers: { "X-Internal-API-Key": "..." }
    ↓
EduSitePro queries registration_requests WHERE organization_id = '123e4567...'
    ↓
Returns: [
      { id: "...", student_first_name: "John", status: "pending", ... },
      ...
    ]
    ↓
EduDashPro displays in ParentApprovalWidget component
```

**Implementation:**
```typescript
// edusitepro/src/app/api/registrations/[orgId]/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { orgId: string } }
) {
  // Verify internal API key
  const apiKey = request.headers.get('X-Internal-API-Key');
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { orgId } = params;
  
  const { data, error } = await supabase
    .from('registration_requests')
    .select('*')
    .eq('organization_id', orgId)
    .order('submission_date', { ascending: false });
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  
  return new Response(JSON.stringify({ registrations: data }), { status: 200 });
}
```

---

### 2.5 Data Synchronization Strategy

#### Synchronization Triggers

| Event | Source DB | Target DB | Sync Method | Latency |
|-------|-----------|-----------|-------------|---------|
| **Organization created** | DB1 (EduDashPro) | DB2 (EduSitePro) | API call on insert | <2 seconds |
| **Organization updated** | Either | Both | API call on update | <2 seconds |
| **Branding changed** | DB2 (EduSitePro) | DB1 (EduDashPro) | API call on theme save | <2 seconds |
| **Registration submitted** | DB2 (EduSitePro) | Display in DB1 dashboard | API query on demand | Real-time |
| **Plan tier upgraded** | DB1 (EduDashPro) | DB2 (EduSitePro) | API call on Stripe webhook | <5 seconds |

---

#### Conflict Resolution

**Scenario:** Organization branding updated in both databases simultaneously.

**Resolution Strategy:** **Last-Write-Wins (LWW)** based on `updated_at` timestamp.

```sql
-- Example: Merge branding from both DBs
SELECT
  CASE
    WHEN db1.updated_at > db2.updated_at THEN db1.logo_url
    ELSE db2.logo_url
  END AS logo_url
FROM db1_organizations db1
JOIN db2_centres db2 ON db1.id = db2.organization_id;
```

**Better Approach:** Use event sourcing with conflict detection:
- Each branding change emits an event with timestamp
- Sync service detects conflicts (competing writes within 5 seconds)
- Alerts admin to resolve manually via dashboard

---

### 2.6 Performance & Caching

#### Query Performance Optimization

**Problem:** Cross-database queries add 200-500ms latency.

**Solutions:**

1. **Redis Cache Layer** (Planned for Month 6)
   - Cache organization branding for 1 hour
   - Cache registration counts for 5 minutes
   - Invalidate on update via API bridge

2. **Materialized Views** (Planned for Month 8)
   - Denormalize registration summary in DB1
   - Refresh every 5 minutes via cron job

3. **Query Batching**
   - Combine multiple registration requests into single API call
   - Use DataLoader pattern in GraphQL (if implemented)

---

#### Database Monitoring

**Metrics to Track:**

| Metric | Threshold | Alert Action |
|--------|-----------|--------------|
| Query latency (p95) | >500ms | Investigate slow queries, add indexes |
| Connection pool utilization | >80% | Increase pool size, optimize connection reuse |
| Replication lag | >10s | Check network, scale read replicas |
| Storage usage | >80% | Archive old data, increase disk size |
| RLS policy violations | >0 | Security audit, fix broken policies |

**Tools:**
- Supabase Dashboard (built-in metrics)
- PostHog for product analytics
- Sentry for error tracking
- Custom monitoring via `pg_stat_statements`

---

**Document Status:** Section 2 Complete ✅  
**Next Section:** [3. Premium CMS Add-On Business Model](#3-premium-cms-add-on-business-model)

---


## 3. Premium CMS Add-On Business Model

### 3.1 Business Model Overview

**Core Principle:** EduDash Pro operations dashboard is **FREE forever**. The Premium CMS (EduSitePro) is a **paid add-on** that unlocks website building, registration forms, and marketing tools.

**Why This Model?**

| Strategy | Rationale |
|----------|-----------|
| **Free Core Product** | Removes barriers to adoption — every school can use operations dashboard without cost |
| **Premium Upsell** | Only schools needing public websites pay — aligns pricing with value |
| **Land-and-Expand** | Users experience value first (dashboard), then upgrade when ready for marketing |
| **Competitive Advantage** | Competitors charge for basic features — we give them free |
| **Revenue Concentration** | 20% of users (those wanting websites) generate 80% of revenue |

---

### 3.2 Feature Gating & Access Control

#### Feature Matrix by Tier

| Feature | Free (R0) | CMS Starter (R499) | CMS Pro (R1,399) | CMS Enterprise (R3,499) |
|---------|-----------|-------------------|------------------|------------------------|
| **Operations Dashboard** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Student Management** | ✅ Up to 50 students | ✅ Up to 200 students | ✅ Up to 1,000 students | ✅ Unlimited |
| **Teacher Accounts** | ✅ Up to 5 teachers | ✅ Up to 10 teachers | ✅ Up to 50 teachers | ✅ Unlimited |
| **AI Lesson Generation** | ✅ 10 lessons/month | ✅ 50 lessons/month | ✅ 200 lessons/month | ✅ Unlimited |
| **WhatsApp Integration** | ✅ Basic notifications | ✅ Basic notifications | ✅ Full 2-way chat | ✅ Full 2-way chat + automation |
| | | | | |
| **Website Builder** | ❌ Not available | ✅ 1 website | ✅ 1 website | ✅ 1 website |
| **CMS Editors** | ❌ | ✅ 1 editor | ✅ 5 editors | ✅ Unlimited editors |
| **Pages** | ❌ | ✅ Up to 10 pages | ✅ Unlimited pages | ✅ Unlimited pages |
| **CMS Blocks** | ❌ | ✅ 12 basic blocks | ✅ 30+ blocks | ✅ 30+ blocks + custom |
| **Registration Forms** | ❌ | ✅ Basic form | ✅ Multi-step forms | ✅ Advanced forms + webhooks |
| **Custom Domain** | ❌ | ❌ (subdomain only) | ✅ Custom domain | ✅ Custom domain + SSL |
| **Theme Customization** | ❌ | ✅ 5 pre-built themes | ✅ Full theme editor | ✅ Full theme + custom CSS |
| **Analytics** | ❌ | ✅ Basic page views | ✅ Full PostHog analytics | ✅ Full analytics + API |
| **SEO Tools** | ❌ | ✅ Basic meta tags | ✅ Advanced SEO + sitemap | ✅ Enterprise SEO + schema |
| **Storage** | ❌ | ✅ 500MB media | ✅ 5GB media | ✅ 50GB media |
| **API Access** | ❌ | ❌ | ❌ | ✅ Full REST API |
| **White-label** | ❌ | ❌ | ❌ | ✅ Remove EduDash branding |
| **Priority Support** | ❌ | ❌ | ✅ Email support (24h) | ✅ Phone + Slack (4h SLA) |
| **Early Bird Discount** | — | 🎁 **R249/mo** (50% off) | 🎁 **R699/mo** (50% off) | 🎁 **R1,749/mo** (50% off) |

---

#### Middleware Enforcement

**Location:** `edudashpro/web/src/middleware.ts` AND `edusitepro/src/middleware.ts`

**Purpose:** Block access to CMS features based on `plan_tier` column in `organizations` table.

```typescript
// edusitepro/src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Get user's organization and plan tier
  const { data: org } = await supabase
    .from('organizations')
    .select('plan_tier, subscription_status')
    .eq('id', session.user.user_metadata.organization_id)
    .single();
  
  if (!org) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }
  
  // Block CMS routes for free tier
  const isCMSRoute = req.nextUrl.pathname.startsWith('/cms');
  const hasCMSAccess = ['cms_starter', 'cms_pro', 'cms_enterprise'].includes(org.plan_tier);
  
  if (isCMSRoute && !hasCMSAccess) {
    return NextResponse.redirect(new URL('/upgrade', req.url));
  }
  
  // Block advanced features for Starter tier
  const isAdvancedRoute = req.nextUrl.pathname.startsWith('/cms/forms') || 
                          req.nextUrl.pathname.startsWith('/cms/analytics');
  const hasAdvancedAccess = ['cms_pro', 'cms_enterprise'].includes(org.plan_tier);
  
  if (isAdvancedRoute && !hasAdvancedAccess) {
    return NextResponse.redirect(new URL('/upgrade?feature=advanced', req.url));
  }
  
  // Check subscription status
  if (org.subscription_status === 'past_due') {
    return NextResponse.redirect(new URL('/billing/past-due', req.url));
  }
  
  if (org.subscription_status === 'canceled') {
    return NextResponse.redirect(new URL('/billing/reactivate', req.url));
  }
  
  return res;
}

export const config = {
  matcher: ['/cms/:path*', '/api/cms/:path*'],
};
```

---

#### Client-Side Feature Checks

**Hook:** `useFeatureAccess.ts`

```typescript
// hooks/useFeatureAccess.ts
import { useOrganization } from '@/hooks/useOrganization';

export type Feature =
  | 'cms_access'
  | 'custom_domain'
  | 'advanced_forms'
  | 'api_access'
  | 'white_label'
  | 'priority_support';

const FEATURE_TIER_MAP: Record<Feature, string[]> = {
  cms_access: ['cms_starter', 'cms_pro', 'cms_enterprise'],
  custom_domain: ['cms_pro', 'cms_enterprise'],
  advanced_forms: ['cms_pro', 'cms_enterprise'],
  api_access: ['cms_enterprise'],
  white_label: ['cms_enterprise'],
  priority_support: ['cms_pro', 'cms_enterprise'],
};

export function useFeatureAccess() {
  const { organization } = useOrganization();
  
  const hasFeature = (feature: Feature): boolean => {
    if (!organization) return false;
    return FEATURE_TIER_MAP[feature].includes(organization.plan_tier);
  };
  
  const getUpgradeUrl = (feature: Feature): string => {
    const requiredTier = FEATURE_TIER_MAP[feature][0]; // Minimum tier
    return `/upgrade?feature=${feature}&tier=${requiredTier}`;
  };
  
  return { hasFeature, getUpgradeUrl, currentTier: organization?.plan_tier };
}
```

**Usage:**

```tsx
// components/cms/CustomDomainSettings.tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export function CustomDomainSettings() {
  const { hasFeature, getUpgradeUrl } = useFeatureAccess();
  
  if (!hasFeature('custom_domain')) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Custom Domain — CMS Pro Feature
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to CMS Pro to connect your own domain (e.g., youngeagles.co.za)
        </p>
        <Button asChild>
          <a href={getUpgradeUrl('custom_domain')}>
            Upgrade to CMS Pro — R1,399/mo
          </a>
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Actual custom domain settings UI */}
    </div>
  );
}
```

---

### 3.3 Upgrade Flow & Conversion Optimization

#### Upgrade Trigger Points

**Where Users See Upgrade Prompts:**

1. **Free Tier Dashboard** — Banner: "Add a professional website — from R249/mo (Early Bird 50% off)"
2. **Settings Page** — "Website Builder" menu item shows lock icon
3. **In-App Modals** — When user clicks locked feature (e.g., "Custom Domain")
4. **Email Campaigns** — Weekly digest: "3 parents asked about your website this week"
5. **Onboarding Wizard** — Step 5: "Want a website for registrations?" (skippable)

---

#### Upgrade Page Design

**Route:** `/upgrade`

**Key Elements:**

1. **Hero Section**
   - Headline: "Get More Registrations with a Professional Website"
   - Subheadline: "Add EduSitePro CMS to your dashboard — no coding required"
   - Comparison: Side-by-side screenshot (Free tier vs CMS Pro)

2. **Pricing Cards** (see Section 1 for full pricing table)
   - Highlight "CMS Pro" as "Most Popular"
   - Show annual discount: "Save R3,358/year (17% off)"
   - Early Bird badge: "🎁 Limited Time: 50% off for 6 months"

3. **Social Proof**
   - Testimonials: "We got 42 registrations in 2 weeks!" — ABC Preschool
   - Case study: "How Young Eagles grew from 80 to 120 students in 3 months"

4. **Feature Comparison Table** (11 features × 4 tiers — see Section 3.2)

5. **FAQ Section**
   - "Can I cancel anytime?" — Yes, no lock-in contracts
   - "What happens to my website if I cancel?" — Paused, not deleted (reactivate within 30 days)
   - "Do I need technical skills?" — No, drag-and-drop editor

6. **Urgency/Scarcity**
   - Countdown timer: "Early Bird pricing ends in 14 days"
   - Limited slots: "Only 47 spots left at 50% off"

7. **CTA Buttons**
   - Primary: "Start 14-Day Free Trial" (no credit card required)
   - Secondary: "Schedule a Demo" (link to Calendly)

---

#### Checkout Flow (Stripe Integration)

**Step 1: Select Plan**

```tsx
// components/upgrade/PricingCards.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'cms_starter',
    name: 'CMS Starter',
    price: 499,
    earlyBirdPrice: 249,
    features: ['1 editor', '10 pages', '12 blocks', '500MB storage'],
  },
  {
    id: 'cms_pro',
    name: 'CMS Pro',
    price: 1399,
    earlyBirdPrice: 699,
    popular: true,
    features: ['5 editors', 'Unlimited pages', '30+ blocks', 'Custom domain', '5GB storage'],
  },
  {
    id: 'cms_enterprise',
    name: 'CMS Enterprise',
    price: 3499,
    earlyBirdPrice: 1749,
    features: ['Unlimited editors', 'White-label', 'API access', 'Priority support', '50GB storage'],
  },
];

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const router = useRouter();
  
  const handleSelectPlan = async (planId: string) => {
    // Create Stripe checkout session
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        billingCycle,
        successUrl: `${window.location.origin}/cms/welcome`,
        cancelUrl: `${window.location.origin}/upgrade`,
      }),
    });
    
    const { sessionUrl } = await response.json();
    router.push(sessionUrl);
  };
  
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`border rounded-lg p-6 ${
            plan.popular ? 'border-violet-500 shadow-lg relative' : 'border-gray-200'
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          )}
          
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">R{plan.earlyBirdPrice}</span>
              <span className="text-gray-400 line-through">R{plan.price}</span>
            </div>
            <p className="text-sm text-gray-600">per month • 50% Early Bird discount</p>
          </div>
          
          <ul className="space-y-2 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => handleSelectPlan(plan.id)}
            className={`w-full py-3 rounded-lg font-semibold ${
              plan.popular
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Start 14-Day Free Trial
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Stripe Checkout Session**

```typescript
// app/api/stripe/create-checkout/route.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_IDS = {
  cms_starter_monthly: 'price_starter_monthly_zar',
  cms_starter_annual: 'price_starter_annual_zar',
  cms_pro_monthly: 'price_pro_monthly_zar',
  cms_pro_annual: 'price_pro_annual_zar',
  cms_enterprise_monthly: 'price_enterprise_monthly_zar',
  cms_enterprise_annual: 'price_enterprise_annual_zar',
};

export async function POST(request: Request) {
  const { planId, billingCycle, successUrl, cancelUrl } = await request.json();
  
  // Get organization ID from session
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = user?.user_metadata?.organization_id;
  
  if (!orgId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Get or create Stripe customer
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, primary_contact_email')
    .eq('id', orgId)
    .single();
  
  let customerId = org?.stripe_customer_id;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org.primary_contact_email,
      metadata: { organization_id: orgId },
    });
    customerId = customer.id;
    
    // Save customer ID
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', orgId);
  }
  
  // Create checkout session
  const priceId = PRICE_IDS[`${planId}_${billingCycle}`];
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: { organization_id: orgId, plan_id: planId },
    },
    allow_promotion_codes: true,
  });
  
  return new Response(JSON.stringify({ sessionUrl: session.url }), { status: 200 });
}
```

**Step 3: Webhook Handler (Subscription Activated)**

```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
  // Handle subscription events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.subscription_data?.metadata?.organization_id;
    const planId = session.subscription_data?.metadata?.plan_id;
    
    if (orgId && planId) {
      await supabase
        .from('organizations')
        .update({
          plan_tier: planId,
          subscription_status: 'trialing',
          subscription_start_date: new Date().toISOString(),
        })
        .eq('id', orgId);
      
      // Sync to EduSitePro
      await fetch(`${process.env.EDUSITEPRO_API_URL}/api/sync-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': process.env.INTERNAL_API_KEY!,
        },
        body: JSON.stringify({
          organization_id: orgId,
          plan_tier: planId,
        }),
      });
    }
  }
  
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const orgId = subscription.metadata.organization_id;
    
    await supabase
      .from('organizations')
      .update({
        subscription_status: subscription.status,
      })
      .eq('id', orgId);
  }
  
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

### 3.4 Revenue Projections & Unit Economics

#### Customer Acquisition Cost (CAC)

**Marketing Budget:** R296,000 (8 months)

**Breakdown:**
- Google Ads: R120,000 (R15,000/month)
- Facebook/Instagram Ads: R80,000 (R10,000/month)
- Content Marketing (blog, SEO): R40,000 (R5,000/month)
- Influencer partnerships: R32,000 (R4,000/month)
- Events/conferences: R24,000 (R3,000/month)

**Expected Conversions:**
- Q1: 50 customers (CAC = R296,000 / 50 = **R5,920 per customer**)
- Q2: +150 customers (cumulative 200) — CAC decreases as word-of-mouth kicks in
- Q3: +300 customers (cumulative 500) — CAC = **R3,500 per customer**
- Q4: +500 customers (cumulative 1,000) — CAC = **R2,000 per customer**

**Payback Period:** 4-6 months (LTV/CAC ratio target: 3:1)

---

#### Lifetime Value (LTV)

**Assumptions:**
- Average customer stays for **18 months** (based on SaaS benchmarks)
- Average plan tier: **60% Starter, 30% Pro, 10% Enterprise**
- Annual churn rate: **25%** (aggressive for early-stage SaaS)

**Weighted Average Monthly Revenue per Customer:**
```
(0.60 × R249) + (0.30 × R699) + (0.10 × R1,749) = R149 + R210 + R175 = R534/month
```

**LTV Calculation:**
```
LTV = R534/month × 18 months × (1 - 0.25 churn) = R534 × 13.5 months = R7,209
```

**LTV/CAC Ratio:**
- Q1: R7,209 / R5,920 = **1.22:1** (below target — acceptable for launch)
- Q3: R7,209 / R3,500 = **2.06:1** (improving)
- Q4: R7,209 / R2,000 = **3.60:1** (healthy SaaS business)

---

#### Revenue Projection Breakdown

| Quarter | New Customers | Total Active | Starter (60%) | Pro (30%) | Enterprise (10%) | MRR | ARR |
|---------|---------------|--------------|---------------|-----------|------------------|-----|-----|
| Q1 | 50 | 50 | 30 @ R249 | 15 @ R699 | 5 @ R1,749 | **R26,685** | R320,220 |
| Q2 | 150 | 200 | 120 @ R249 | 60 @ R699 | 20 @ R1,749 | **R106,740** | R1,280,880 |
| Q3 | 300 | 500 | 300 @ R249 | 150 @ R699 | 50 @ R1,749 | **R266,850** | R3,202,200 |
| Q4 | 500 | 1,000 | 600 @ R249 | 300 @ R699 | 100 @ R1,749 | **R533,700** | R6,404,400 |

**Year 1 Total ARR:** R6,404,400 (~$346,000 USD)

---

### 3.5 Competitive Pricing Analysis

#### Competitor Comparison (ZAR Pricing)

| Provider | Entry Plan | Mid Plan | Enterprise Plan | Notes |
|----------|-----------|----------|-----------------|-------|
| **WordPress + WooCommerce** | R0 (self-hosted) | R185/mo (hosting) | R925/mo (managed) | Complex setup, not education-focused |
| **Squarespace** | R222/mo | R333/mo | R592/mo | No operations dashboard, no student management |
| **Webflow** | R259/mo | R555/mo | Custom | Designer-focused, steep learning curve |
| **Wix** | R111/mo | R259/mo | R481/mo | Basic features, no education-specific tools |
| **Teachable** | R555/mo | R1,850/mo | Custom | Course delivery only, no website builder |
| **Brightwheel** | $1,100/year (~R20,350/year) | Enterprise | — | US-focused, expensive for SA market |
| **EduDash Pro** | **R0** (ops only) | **R249/mo** (Early Bird) | **R1,749/mo** (Early Bird) | **Only solution with free ops dashboard + paid CMS** |

**Key Differentiator:** EduDash Pro is the **only platform** that gives free operations dashboard (student management, attendance, lessons) AND offers premium website builder as add-on. Competitors force you to choose between operations OR marketing.

---

### 3.6 Early Bird Campaign Strategy

#### Campaign Details

**Offer:** **50% off for 6 months** for first 500 customers

**Pricing:**
- CMS Starter: R499/mo → **R249/mo** (save R1,500 over 6 months)
- CMS Pro: R1,399/mo → **R699/mo** (save R4,200 over 6 months)
- CMS Enterprise: R3,499/mo → **R1,749/mo** (save R10,500 over 6 months)

**After 6 months:** Auto-renew at full price (users notified 30 days before)

**Eligibility:**
- New customers only (not upgrades)
- Must sign up before March 31, 2026
- Limited to first 500 signups

---

#### Campaign Landing Page

**URL:** `edudashpro.co.za/early-bird`

**Hero Section:**
```
🎁 Early Bird Special — 50% Off for 6 Months

Get a professional website + operations dashboard for your preschool

Only 47 spots left • Offer ends March 31, 2026

[Start 14-Day Free Trial] [See Pricing]
```

**Countdown Timer:** JavaScript-powered real-time countdown to March 31

**Social Proof:**
- "472 schools already using EduDash Pro"
- "4.9/5 stars from 89 reviews"
- Logos of 6 well-known preschools

**Video Testimonial:** 60-second video from Young Eagles principal

**Urgency Banner:** "⚡ Only 47 spots left at 50% off — claim yours now"

---

#### Email Drip Campaign

**Triggered on Free Tier Signup:**

**Day 1:** Welcome email
- Subject: "Welcome to EduDash Pro! Here's how to get started"
- Content: Quick start guide, link to dashboard tour

**Day 3:** Feature highlight
- Subject: "Did you know? You can generate AI lessons in 30 seconds"
- Content: Showcase AI lesson generator with example

**Day 7:** Early Bird offer
- Subject: "🎁 Special offer: 50% off website builder (500 spots only)"
- Content: Explain CMS benefits, show before/after website examples

**Day 10:** Case study
- Subject: "How Young Eagles got 42 registrations in 2 weeks"
- Content: Full case study with screenshots and quotes

**Day 14:** Last chance
- Subject: "Your Early Bird discount expires in 48 hours"
- Content: Urgency message, link to upgrade page

---

#### Conversion Tracking

**Metrics to Monitor:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Upgrade Rate (Free → Paid) | 15% | PostHog funnel analysis |
| Trial-to-Paid Conversion | 40% | Stripe subscription data |
| Avg Time to Upgrade | 21 days | Custom event tracking |
| Churn Rate (First 3 months) | <10% | Stripe cancellation events |
| Upsell Rate (Starter → Pro) | 25% | Subscription change events |

**Tools:**
- PostHog: Product analytics, funnel tracking
- Stripe Dashboard: Subscription metrics
- Google Analytics 4: Marketing attribution
- Hotjar: Session recordings on upgrade page

---

**Document Status:** Section 3 Complete ✅  
**Next Section:** [4. Professional UI/UX Standards](#4-professional-ui-ux-standards)

---


## 4. Professional UI/UX Standards

### 4.1 Design Philosophy

**Core Principle:** EduDash Pro must feel as polished and professional as **Vercel, Linear, and Stripe** — products known for exceptional design quality.

**Design Values:**

1. **Clarity over Complexity** — Every UI element should have a clear purpose
2. **Speed** — Interactions feel instant (perceived performance <100ms)
3. **Consistency** — Same patterns everywhere (buttons, forms, modals)
4. **Accessibility** — WCAG AAA compliance (not just AA)
5. **Mobile-First** — Touch targets ≥44px, optimized for small screens
6. **Delight** — Micro-interactions and animations that feel joyful (but not distracting)

---

### 4.2 Benchmark Analysis: Industry Leaders

#### Vercel Dashboard

**What We Adopt:**

| Element | Vercel Pattern | EduDash Implementation |
|---------|---------------|------------------------|
| **Navigation** | Persistent sidebar + top bar | Same pattern: Sidebar for apps/orgs, top bar for user menu |
| **Card Design** | Subtle shadows, rounded corners (8px) | Use `rounded-lg` (8px), `shadow-sm` for cards |
| **Typography** | Inter font, clear hierarchy (48px → 14px) | Same font stack, consistent scale |
| **Color Palette** | Neutral grays + accent color (blue) | Gray-900 → Gray-50 scale + Violet-600 accent |
| **Button States** | Hover darkens by 10%, active scales 98% | Implement same using Tailwind utilities |
| **Loading States** | Skeleton screens (not spinners) | Use `react-loading-skeleton` library |
| **Empty States** | Illustration + helpful CTA | Custom illustrations for "No students yet" states |

---

#### Linear App

**What We Adopt:**

| Element | Linear Pattern | EduDash Implementation |
|---------|---------------|------------------------|
| **Command Menu** | Cmd+K opens search/command palette | Implement same with `cmdk` library |
| **Keyboard Shortcuts** | Heavy keyboard navigation | Add shortcuts for common actions (e.g., `C` = create student) |
| **Animations** | Smooth page transitions (200ms ease-out) | Use Framer Motion for route transitions |
| **Tables** | Virtualized rows, infinite scroll | Use `@tanstack/react-virtual` for student lists |
| **Notifications** | Toast notifications (top-right, auto-dismiss 4s) | Use `sonner` library for toasts |
| **Focus States** | Visible focus rings (accessibility) | Tailwind `focus-visible:ring-2` on all interactive elements |

---

#### Stripe Dashboard

**What We Adopt:**

| Element | Stripe Pattern | EduDash Implementation |
|---------|---------------|------------------------|
| **Data Tables** | Dense tables with row hover highlights | Same pattern for student/teacher tables |
| **Form Validation** | Inline errors (not modal alerts) | Real-time validation with `react-hook-form` |
| **Payment UI** | Card input with live formatting | Use Stripe Elements for payment collection |
| **Status Badges** | Color-coded pills (green = active, red = overdue) | Implement same for subscription status |
| **Metrics Cards** | Large number + trend indicator (↑5%) | Use same for dashboard KPIs |
| **Documentation** | Inline docs with code examples | Add contextual help tooltips throughout |

---

### 4.3 Design Tokens (Color, Typography, Spacing)

#### Color Palette

**Base Colors (Neutrals):**

```typescript
// constants/DesignSystem.ts
export const COLORS = {
  // Grays (9-step scale)
  gray50: '#fafaf9',   // Backgrounds
  gray100: '#f5f5f4',  // Hover states
  gray200: '#e7e5e4',  // Borders
  gray300: '#d6d3d1',  // Disabled states
  gray400: '#a8a29e',  // Placeholders
  gray500: '#78716c',  // Muted text
  gray600: '#57534e',  // Secondary text
  gray700: '#44403c',  // Body text
  gray800: '#292524',  // Headings
  gray900: '#1c1917',  // Darkest text
  
  // Accent Colors (Brand)
  violet50: '#faf5ff',
  violet100: '#f3e8ff',
  violet200: '#e9d5ff',
  violet300: '#d8b4fe',
  violet400: '#c084fc',
  violet500: '#a855f7',
  violet600: '#9333ea',  // PRIMARY BRAND COLOR
  violet700: '#7e22ce',
  violet800: '#6b21a8',
  violet900: '#581c87',
  
  // Semantic Colors
  success: '#10b981',    // Green-500
  warning: '#f59e0b',    // Amber-500
  error: '#ef4444',      // Red-500
  info: '#3b82f6',       // Blue-500
  
  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#fafaf9', // gray-50
  bgTertiary: '#f5f5f4',  // gray-100
};
```

**Usage Guidelines:**

- **Primary Actions:** `violet-600` background, white text
- **Secondary Actions:** `gray-200` background, `gray-900` text
- **Destructive Actions:** `red-600` background, white text
- **Borders:** `gray-200` (light mode), `gray-700` (dark mode — future)
- **Focus Rings:** `violet-500` with 2px width

---

#### Typography Scale

**Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Scale:**

| Size | Usage | Tailwind Class | Line Height |
|------|-------|----------------|-------------|
| **48px** | Hero headings (landing pages) | `text-5xl` | 1.1 (tight) |
| **36px** | Page titles | `text-4xl` | 1.2 |
| **30px** | Section headings | `text-3xl` | 1.2 |
| **24px** | Card titles | `text-2xl` | 1.3 |
| **20px** | Subheadings | `text-xl` | 1.4 |
| **16px** | Body text (default) | `text-base` | 1.5 |
| **14px** | Small text (captions) | `text-sm` | 1.5 |
| **12px** | Labels, timestamps | `text-xs` | 1.5 |

**Font Weights:**

- **400 (Regular):** Body text
- **500 (Medium):** Subheadings, button text
- **600 (Semibold):** Card titles, form labels
- **700 (Bold):** Page headings, CTA buttons

---

#### Spacing Scale (Tailwind Default)

**8px Base Unit:**

| Pixels | Tailwind | Usage |
|--------|----------|-------|
| 4px | `space-1` | Icon padding |
| 8px | `space-2` | Small gaps |
| 12px | `space-3` | Default gap between elements |
| 16px | `space-4` | Card padding, button padding |
| 20px | `space-5` | Section spacing |
| 24px | `space-6` | Card spacing |
| 32px | `space-8` | Large section gaps |
| 48px | `space-12` | Page section spacing |
| 64px | `space-16` | Hero section spacing |

---

### 4.4 Component Design Patterns

#### Buttons

**Primary Button:**

```tsx
<button className="
  bg-violet-600 text-white 
  px-4 py-2 
  rounded-lg 
  font-medium text-sm
  hover:bg-violet-700 
  active:scale-98
  transition-all duration-150
  focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Create Student
</button>
```

**Secondary Button:**

```tsx
<button className="
  border border-gray-300 bg-white text-gray-700
  px-4 py-2
  rounded-lg
  font-medium text-sm
  hover:bg-gray-50
  active:scale-98
  transition-all duration-150
  focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2
">
  Cancel
</button>
```

**Destructive Button:**

```tsx
<button className="
  bg-red-600 text-white
  px-4 py-2
  rounded-lg
  font-medium text-sm
  hover:bg-red-700
  active:scale-98
  transition-all duration-150
  focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
">
  Delete Student
</button>
```

---

#### Form Inputs

**Text Input:**

```tsx
<div className="space-y-2">
  <label htmlFor="student-name" className="block text-sm font-semibold text-gray-700">
    Student Name
  </label>
  <input
    id="student-name"
    type="text"
    placeholder="Enter first and last name"
    className="
      w-full px-3 py-2
      border border-gray-300 rounded-lg
      text-base text-gray-900
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
      transition-all duration-150
    "
  />
  <p className="text-xs text-gray-500">
    Full name as it appears on ID document
  </p>
</div>
```

**Error State:**

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    className="
      w-full px-3 py-2
      border-2 border-red-500 rounded-lg
      text-base text-gray-900
      focus:outline-none focus:ring-2 focus:ring-red-500
    "
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-xs text-red-600 flex items-center gap-1">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    Please enter a valid email address
  </p>
</div>
```

---

#### Cards

**Standard Card:**

```tsx
<div className="
  bg-white
  border border-gray-200
  rounded-lg
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow duration-200
">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Total Students
  </h3>
  <p className="text-4xl font-bold text-violet-600">
    142
  </p>
  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12 7a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V8.414l-5.293 5.293a1 1 0 01-1.414 0L7 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L10 11.586 14.586 7H13a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
    +12% from last month
  </p>
</div>
```

---

#### Tables

**Responsive Data Table:**

```tsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Student Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Grade
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      <tr className="hover:bg-gray-50 transition-colors duration-100">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <img src="/avatars/1.jpg" alt="" className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Thabo Molefe</p>
              <p className="text-xs text-gray-500">ID: 001234</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          Grade R
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button className="text-violet-600 hover:text-violet-700 font-medium">
            Edit
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 4.5 Mobile-First Rules (STRICT ENFORCEMENT)

#### Touch Targets

**Rule:** All interactive elements MUST be ≥44px × 44px (Apple HIG + Material Design standard)

**Bad Example (Non-Compliant):**

```tsx
❌ <button className="px-2 py-1 text-xs">Delete</button>
// This is only ~32px tall — too small for touch
```

**Good Example (Compliant):**

```tsx
✅ <button className="px-4 py-3 text-sm min-h-[44px]">Delete</button>
// Meets 44px minimum height
```

**Enforcement:** ESLint rule `jsx-a11y/click-events-have-key-events` + custom rule to check button dimensions

---

#### Nested Div Hell (MAX 3 LEVELS)

**Rule:** No more than 3 nested `<div>` levels to avoid layout complexity and improve performance.

**Bad Example (Non-Compliant):**

```tsx
❌ 
<div>
  <div>
    <div>
      <div>
        <div>
          <p>Student Name</p>
        </div>
      </div>
    </div>
  </div>
</div>
// 5 levels deep — too complex
```

**Good Example (Compliant):**

```tsx
✅ 
<div className="p-4">
  <div className="flex items-center gap-2">
    <p className="text-base font-semibold">Student Name</p>
  </div>
</div>
// Only 2 levels — clean and maintainable
```

**Enforcement:** ESLint rule `max-depth` set to 3 for JSX elements

---

#### Responsive Breakpoints

**Tailwind Default Breakpoints:**

| Breakpoint | Min Width | Max Width | Usage |
|------------|-----------|-----------|-------|
| `sm` | 640px | 767px | Large phones (landscape) |
| `md` | 768px | 1023px | Tablets |
| `lg` | 1024px | 1279px | Small laptops |
| `xl` | 1280px | 1535px | Desktops |
| `2xl` | 1536px+ | — | Large monitors |

**Mobile-First Approach:**

```tsx
// Start with mobile styles, add complexity for larger screens
<div className="
  p-4                 // Mobile: 16px padding
  md:p-6              // Tablet: 24px padding
  lg:p-8              // Desktop: 32px padding
  grid grid-cols-1    // Mobile: 1 column
  md:grid-cols-2      // Tablet: 2 columns
  lg:grid-cols-3      // Desktop: 3 columns
  gap-4
">
  {/* Content */}
</div>
```

---

#### Stack vs. Grid Layouts

**Mobile (<768px):** Stack vertically (1 column)  
**Tablet (768px-1023px):** 2 columns  
**Desktop (1024px+):** 3-4 columns

**Example:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <StatsCard title="Students" value={142} />
  <StatsCard title="Teachers" value={12} />
  <StatsCard title="Classes" value={8} />
</div>
```

---

### 4.6 Accessibility Standards (WCAG AAA)

#### Contrast Ratios

**WCAG AAA Requirements:**

- **Normal Text (16px):** 7:1 contrast ratio
- **Large Text (24px+):** 4.5:1 contrast ratio
- **UI Components (buttons, inputs):** 3:1 contrast ratio

**Compliance Check:**

| Combination | Ratio | Passes AAA? |
|-------------|-------|-------------|
| `gray-900` on `white` | 19.85:1 | ✅ Yes |
| `gray-700` on `white` | 10.26:1 | ✅ Yes |
| `gray-600` on `white` | 7.02:1 | ✅ Yes |
| `gray-500` on `white` | 4.54:1 | ❌ No (fails AAA for normal text) |
| `violet-600` on `white` | 8.59:1 | ✅ Yes |

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

#### Keyboard Navigation

**Requirements:**

1. **All interactive elements** must be keyboard accessible (no mouse-only actions)
2. **Focus indicators** must be visible (2px ring, high contrast)
3. **Tab order** must follow logical reading flow
4. **Esc key** closes modals and dialogs

**Example:**

```tsx
<dialog
  open={isOpen}
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  }}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
>
  <div className="bg-white rounded-lg p-6 max-w-md w-full">
    <h2 className="text-xl font-bold mb-4" id="modal-title">
      Delete Student
    </h2>
    <p className="text-gray-600 mb-6">
      Are you sure you want to delete Thabo Molefe? This action cannot be undone.
    </p>
    <div className="flex justify-end gap-3">
      <button
        onClick={closeModal}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        autoFocus
      >
        Delete
      </button>
    </div>
  </div>
</dialog>
```

---

#### Screen Reader Support

**Requirements:**

1. **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, `<article>` (not just `<div>`)
2. **ARIA labels:** Add `aria-label` for icon-only buttons
3. **Live regions:** Use `aria-live` for dynamic content (e.g., toast notifications)
4. **Alt text:** All images must have descriptive `alt` attributes

**Example:**

```tsx
// Good: Semantic HTML + ARIA
<button aria-label="Delete student Thabo Molefe">
  <TrashIcon className="w-5 h-5" />
</button>

// Bad: Generic div with onClick
❌ <div onClick={handleDelete}>
  <TrashIcon />
</div>
```

---

### 4.7 Animation & Micro-Interactions

#### Transition Durations

**Rule:** Use consistent durations based on element type

| Element | Duration | Easing | Example |
|---------|----------|--------|---------|
| **Hover states** | 150ms | `ease-out` | Button background change |
| **Page transitions** | 200ms | `ease-in-out` | Route change fade |
| **Drawer/modal open** | 300ms | `ease-out` | Sidebar slide-in |
| **Toast notifications** | 200ms | `ease-out` | Notification slide-down |
| **Loading skeletons** | 1500ms | `ease-in-out` | Shimmer effect (infinite loop) |

**Implementation:**

```tsx
// Tailwind utilities
<button className="transition-all duration-150 ease-out hover:bg-violet-700">
  Click Me
</button>

// Framer Motion for complex animations
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  Toast notification content
</motion.div>
```

---

#### Button Active States

**Rule:** Buttons should scale to 98% on click (feels responsive)

```tsx
<button className="
  bg-violet-600 text-white px-4 py-2 rounded-lg
  active:scale-98
  transition-transform duration-100
">
  Save Changes
</button>
```

---

### 4.8 Loading States & Skeletons

**Rule:** Never show blank screens or spinners — use skeleton screens instead

**Bad Example (Spinner):**

```tsx
❌ {loading && <div className="flex justify-center"><Spinner /></div>}
```

**Good Example (Skeleton):**

```tsx
✅ import Skeleton from 'react-loading-skeleton';

{loading ? (
  <div className="space-y-4">
    <Skeleton height={80} />
    <Skeleton height={80} />
    <Skeleton height={80} />
  </div>
) : (
  students.map((student) => <StudentCard key={student.id} student={student} />)
)}
```

---

### 4.9 Empty States

**Rule:** Empty states must have:

1. **Illustration or icon** (not just text)
2. **Clear message** explaining why it's empty
3. **CTA button** to add first item

**Example:**

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <img src="/illustrations/empty-students.svg" alt="" className="w-48 h-48 mb-6" />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No students yet
  </h3>
  <p className="text-gray-600 mb-6 max-w-md">
    Get started by adding your first student. You can import from a CSV or add them manually.
  </p>
  <div className="flex gap-3">
    <button className="bg-violet-600 text-white px-4 py-2 rounded-lg">
      Add Student
    </button>
    <button className="border border-gray-300 px-4 py-2 rounded-lg">
      Import CSV
    </button>
  </div>
</div>
```

---

**Document Status:** Section 4 Complete ✅  
**Next Section:** [5. TTS Language & Voice Selection System](#5-tts-language-voice-selection-system)

---


## 5. TTS Language & Voice Selection System

### 5.1 System Overview

**Purpose:** Allow teachers and parents to select:

1. **Language** (11 South African official languages)
2. **Voice Persona** (Teacher, Professor, Friend, Parent, Professional)

for AI-generated audio content (lessons, homework instructions, story narrations).

**Provider:** **ElevenLabs** (best-in-class multilingual TTS with voice cloning)

---

### 5.2 Supported Languages

**South African Official Languages (11 Total):**

| Language | ISO Code | Speaker Population | Priority | Voice Availability |
|----------|----------|-------------------|----------|-------------------|
| **English** | `en-ZA` | 4.9M (9.6%) | ⭐️ High | ✅ Full support (30+ voices) |
| **Zulu** | `zu-ZA` | 12.1M (23.8%) | ⭐️ High | ✅ 5 voices |
| **Xhosa** | `xh-ZA` | 8.2M (16.0%) | ⭐️ High | ✅ 4 voices |
| **Afrikaans** | `af-ZA` | 6.9M (13.5%) | ⭐️ High | ✅ 8 voices |
| **Sepedi** | `nso-ZA` | 4.6M (9.1%) | Medium | ✅ 3 voices |
| **Setswana** | `tn-ZA` | 4.1M (8.0%) | Medium | ✅ 3 voices |
| **Sesotho** | `st-ZA` | 3.8M (7.6%) | Medium | ✅ 2 voices |
| **Tsonga** | `ts-ZA` | 2.4M (4.8%) | Low | ⚠️ 1 voice (fallback to English) |
| **Swati** | `ss-ZA` | 1.3M (2.6%) | Low | ⚠️ 1 voice (fallback to English) |
| **Venda** | `ve-ZA` | 1.2M (2.4%) | Low | ⚠️ 1 voice (fallback to English) |
| **Ndebele** | `nr-ZA` | 1.1M (2.2%) | Low | ⚠️ 1 voice (fallback to English) |

**Notes:**

- **Priority** is based on speaker population and urban school concentration
- **Phase 1 (Launch):** Focus on Big 4 languages (English, Zulu, Xhosa, Afrikaans) — 63% of population
- **Phase 2 (Month 6):** Add Sepedi, Setswana, Sesotho — 87% coverage
- **Phase 3 (Month 12):** Complete remaining 4 languages (Tsonga, Swati, Venda, Ndebele)

---

### 5.3 Voice Personas

**5 Persona Categories (Each with 2-3 Voice Options):**

#### 1. Teacher (Warm, Patient, Encouraging)

**Use Cases:** Lesson introductions, homework instructions, educational content

**Characteristics:**

- Warm tone, moderate pace (140-160 WPM)
- Clear enunciation for young learners
- Uplifting intonation (e.g., "Great job!")

**ElevenLabs Voice Mapping:**

| Language | Voice Name | Voice ID | Gender | Age |
|----------|-----------|----------|--------|-----|
| English (ZA) | Sarah (Teacher) | `pNInz6obpgDQGcFmaJgB` | Female | 30-40 |
| Zulu | Nomsa (Teacher) | `custom_001` | Female | 35-45 |
| Xhosa | Thandiwe (Teacher) | `custom_002` | Female | 30-40 |
| Afrikaans | Liezel (Teacher) | `custom_003` | Female | 30-40 |

---

#### 2. Professor (Authoritative, Knowledgeable, Formal)

**Use Cases:** Advanced lessons (high school), STEM content, exam prep

**Characteristics:**

- Confident tone, slower pace (120-140 WPM)
- Formal language, academic vocabulary
- Authoritative delivery

**ElevenLabs Voice Mapping:**

| Language | Voice Name | Voice ID | Gender | Age |
|----------|-----------|----------|--------|-----|
| English (ZA) | Dr. James (Professor) | `EXAVITQu4vr4xnSDxMaL` | Male | 45-55 |
| Afrikaans | Prof. Hendrik (Professor) | `custom_004` | Male | 50-60 |

---

#### 3. Friend (Casual, Relatable, Peer-like)

**Use Cases:** Story narrations, social-emotional learning, peer interaction simulations

**Characteristics:**

- Casual tone, natural pace (160-180 WPM)
- Conversational language, contractions (e.g., "You're gonna love this")
- Energetic delivery

**ElevenLabs Voice Mapping:**

| Language | Voice Name | Voice ID | Gender | Age |
|----------|-----------|----------|--------|-----|
| English (ZA) | Liam (Friend) | `TX3LPaxmHKxFdv7VOQHJ` | Male | 18-25 |
| Zulu | Sipho (Friend) | `custom_005` | Male | 20-30 |

---

#### 4. Parent (Nurturing, Gentle, Supportive)

**Use Cases:** Bedtime stories, calming activities, parent-child interaction content

**Characteristics:**

- Gentle tone, slow pace (100-120 WPM)
- Soothing intonation, soft delivery
- Reassuring vocabulary

**ElevenLabs Voice Mapping:**

| Language | Voice Name | Voice ID | Gender | Age |
|----------|-----------|----------|--------|-----|
| English (ZA) | Emily (Parent) | `LcfcDJNUP1GQjkzn1xUU` | Female | 35-45 |
| Xhosa | Nokuthula (Parent) | `custom_006` | Female | 40-50 |

---

#### 5. Professional (Neutral, Clear, Formal)

**Use Cases:** Announcements, admin instructions, official communications

**Characteristics:**

- Neutral tone, moderate pace (140-160 WPM)
- Clear enunciation, formal language
- Professional delivery (no emotion)

**ElevenLabs Voice Mapping:**

| Language | Voice Name | Voice ID | Gender | Age |
|----------|-----------|----------|--------|-----|
| English (ZA) | Michael (Professional) | `flq6f7yk4E4fJM5XTYuZ` | Male | 35-45 |
| Afrikaans | Pieter (Professional) | `custom_007` | Male | 40-50 |

---

### 5.4 Language Detection & Auto-Selection

#### Auto-Detection Flow

**Scenario:** User writes lesson in Zulu, system auto-selects Zulu TTS voice

```typescript
// services/LanguageDetector.ts
import { franc } from 'franc-min'; // Lightweight language detection

const SA_LANGUAGE_MAP: Record<string, string> = {
  eng: 'en-ZA',
  zul: 'zu-ZA',
  xho: 'xh-ZA',
  afr: 'af-ZA',
  nso: 'nso-ZA',
  tsn: 'tn-ZA',
  sot: 'st-ZA',
  tso: 'ts-ZA',
  ssw: 'ss-ZA',
  ven: 've-ZA',
  nbl: 'nr-ZA',
};

export function detectLanguage(text: string): string {
  const detected = franc(text, { only: Object.keys(SA_LANGUAGE_MAP) });
  
  // Franc returns ISO 639-3 codes, map to our locale codes
  return SA_LANGUAGE_MAP[detected] || 'en-ZA'; // Fallback to English
}

// Usage
const lessonText = "Namhlanje sizofunda nge-photosynthesis...";
const language = detectLanguage(lessonText); // Returns "zu-ZA" (Zulu)
```

---

#### Manual Override UI

**Location:** Lesson editor settings panel

```tsx
// components/lessons/LanguageSelector.tsx
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en-ZA', name: 'English', flag: '🇿🇦' },
  { code: 'zu-ZA', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh-ZA', name: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'nso-ZA', name: 'Sepedi', flag: '🇿🇦' },
  { code: 'tn-ZA', name: 'Setswana', flag: '🇿🇦' },
  { code: 'st-ZA', name: 'Sesotho', flag: '🇿🇦' },
  // ... other 4 languages
];

export function LanguageSelector({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [autoDetected, setAutoDetected] = useState<string | null>(null);
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Lesson Language
      </label>
      
      {autoDetected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-900">
            Auto-detected: <strong>{LANGUAGES.find((l) => l.code === autoDetected)?.name}</strong>
          </p>
          <button
            onClick={() => onChange(autoDetected)}
            className="text-blue-600 underline mt-1"
          >
            Use auto-detected language
          </button>
        </div>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

### 5.5 Voice Persona Selection UI

**Location:** Lesson audio settings panel

```tsx
// components/lessons/VoicePersonaSelector.tsx
import { useState } from 'react';

const PERSONAS = [
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Warm and encouraging',
    icon: '👩‍🏫',
    sampleUrl: '/audio/samples/teacher-sample.mp3',
  },
  {
    id: 'professor',
    name: 'Professor',
    description: 'Authoritative and formal',
    icon: '👨‍🎓',
    sampleUrl: '/audio/samples/professor-sample.mp3',
  },
  {
    id: 'friend',
    name: 'Friend',
    description: 'Casual and relatable',
    icon: '🧑‍🤝‍🧑',
    sampleUrl: '/audio/samples/friend-sample.mp3',
  },
  {
    id: 'parent',
    name: 'Parent',
    description: 'Nurturing and gentle',
    icon: '👪',
    sampleUrl: '/audio/samples/parent-sample.mp3',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Neutral and clear',
    icon: '💼',
    sampleUrl: '/audio/samples/professional-sample.mp3',
  },
];

export function VoicePersonaSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  
  const playSample = (personaId: string, sampleUrl: string) => {
    const audio = new Audio(sampleUrl);
    audio.play();
    setPlayingSample(personaId);
    audio.onended = () => setPlayingSample(null);
  };
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Voice Persona
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onChange(persona.id)}
            className={`
              border-2 rounded-lg p-4 text-left transition-all
              ${
                value === persona.id
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{persona.icon}</span>
                <span className="font-semibold text-gray-900">{persona.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playSample(persona.id, persona.sampleUrl);
                }}
                className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                disabled={playingSample === persona.id}
              >
                {playingSample === persona.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Playing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Preview
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600">{persona.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 5.6 ElevenLabs API Integration

#### Generate Audio (Server-Side Edge Function)

**Location:** `supabase/functions/generate-audio/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'\;

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;

const VOICE_MAP: Record<string, Record<string, string>> = {
  'en-ZA': {
    teacher: 'pNInz6obpgDQGcFmaJgB',
    professor: 'EXAVITQu4vr4xnSDxMaL',
    friend: 'TX3LPaxmHKxFdv7VOQHJ',
    parent: 'LcfcDJNUP1GQjkzn1xUU',
    professional: 'flq6f7yk4E4fJM5XTYuZ',
  },
  'zu-ZA': {
    teacher: 'custom_001',
    friend: 'custom_005',
    // ... other personas
  },
  // ... other languages
};

serve(async (req) => {
  try {
    const { text, language, persona } = await req.json();
    
    // Get voice ID
    const voiceId = VOICE_MAP[language]?.[persona] || VOICE_MAP['en-ZA']?.teacher;
    
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports 29 languages
          voice_settings: {
            stability: 0.75, // 0-1 (higher = more stable/consistent)
            similarity_boost: 0.75, // 0-1 (higher = closer to original voice)
            style: 0.5, // 0-1 (ElevenLabs v2 only — exaggerates style)
            use_speaker_boost: true,
          },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }
    
    // Stream audio file back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

---

#### Client-Side Usage

```typescript
// services/TTSService.ts
export async function generateAudio(
  text: string,
  language: string,
  persona: string
): Promise<Blob> {
  const response = await fetch('https://lvvvjywrmpcqrpvuptdi.supabase.co/functions/v1/generate-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ text, language, persona }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate audio');
  }
  
  return await response.blob();
}

// Usage in component
const audioBlob = await generateAudio(
  "Namhlanje sizofunda nge-photosynthesis...",
  "zu-ZA",
  "teacher"
);

const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

---

### 5.7 Cost Management & Quotas

#### ElevenLabs Pricing (As of Nov 2025)

| Tier | Characters/Month | Cost per Character | Monthly Cost (USD) | ZAR (R18.50/$1) |
|------|------------------|-------------------|-------------------|-----------------|
| **Free** | 10,000 | R0 | $0 | R0 |
| **Starter** | 30,000 | $0.30/1,000 | $9 | R166.50 |
| **Creator** | 100,000 | $0.24/1,000 | $24 | R444 |
| **Pro** | 500,000 | $0.18/1,000 | $90 | R1,665 |
| **Scale** | 2,000,000 | $0.12/1,000 | $240 | R4,440 |
| **Business** | Custom | $0.10/1,000+ | Custom | Custom |

**Average Lesson Audio:** 500 words × 6 characters/word = **3,000 characters**

**Quota Allocation by Plan:**

| EduDash Plan | Monthly TTS Characters | Lessons/Month | Cost to EduDash |
|--------------|------------------------|---------------|-----------------|
| **Free** | 10,000 (ElevenLabs Free) | 3 lessons | R0 |
| **CMS Starter** | 30,000 (ElevenLabs Starter) | 10 lessons | R166.50 |
| **CMS Pro** | 100,000 (ElevenLabs Creator) | 33 lessons | R444 |
| **CMS Enterprise** | 500,000 (ElevenLabs Pro) | 166 lessons | R1,665 |

**Cost Recovery Strategy:**

- Free tier: Subsidized (loss leader)
- CMS Starter (R249/mo): TTS cost R166.50 → **67% margin**
- CMS Pro (R699/mo): TTS cost R444 → **36% margin** (acceptable)
- CMS Enterprise (R1,749/mo): TTS cost R1,665 → **5% margin** (high usage expected)

**Mitigation:**

- Implement client-side caching (store generated audio files)
- Reuse audio for common phrases (e.g., "Good morning class")
- Monitor usage per organization, throttle if exceeding quota

---

#### Quota Enforcement

**Database Schema:**

```sql
-- Add TTS usage tracking to organizations table
ALTER TABLE organizations
ADD COLUMN tts_characters_used INT DEFAULT 0,
ADD COLUMN tts_characters_quota INT DEFAULT 10000, -- Free tier default
ADD COLUMN tts_quota_reset_date TIMESTAMPTZ DEFAULT NOW();

-- Trigger to reset quota monthly
CREATE OR REPLACE FUNCTION reset_tts_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tts_quota_reset_date < NOW() - INTERVAL '1 month' THEN
    NEW.tts_characters_used := 0;
    NEW.tts_quota_reset_date := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tts_quota_reset
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION reset_tts_quota();
```

**Quota Check (Edge Function):**

```typescript
// supabase/functions/generate-audio/index.ts (add before ElevenLabs call)
const { data: org } = await supabase
  .from('organizations')
  .select('tts_characters_used, tts_characters_quota')
  .eq('id', organizationId)
  .single();

const charactersNeeded = text.length;

if (org.tts_characters_used + charactersNeeded > org.tts_characters_quota) {
  return new Response(
    JSON.stringify({
      error: 'TTS quota exceeded',
      quota: org.tts_characters_quota,
      used: org.tts_characters_used,
      upgradeUrl: '/upgrade?feature=tts',
    }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
}

// Increment usage after successful generation
await supabase
  .from('organizations')
  .update({
    tts_characters_used: org.tts_characters_used + charactersNeeded,
  })
  .eq('id', organizationId);
```

---

### 5.8 Voice Sample Library

**Pre-Generated Sample Audio Files (for Persona Selector):**

| Persona | Language | Sample Text | File Size | URL |
|---------|----------|-------------|-----------|-----|
| Teacher | English | "Welcome to today's lesson! We're going to explore something exciting." | 42KB | `/audio/samples/teacher-en.mp3` |
| Teacher | Zulu | "Sawubona! Namhlanje sizofunda into emnandi kakhulu." | 38KB | `/audio/samples/teacher-zu.mp3` |
| Professor | English | "Today we will examine the fundamental principles of photosynthesis." | 45KB | `/audio/samples/professor-en.mp3` |
| Friend | English | "Hey! You're gonna love this activity — it's super fun!" | 35KB | `/audio/samples/friend-en.mp3` |
| Parent | English | "Once upon a time, in a faraway land..." | 30KB | `/audio/samples/parent-en.mp3` |
| Professional | English | "Attention students: The assembly will commence at 9 AM." | 40KB | `/audio/samples/professional-en.mp3` |

**Total Sample Library:** 30 files (6 personas × 5 languages) = ~1.2MB

**Storage:** Supabase Storage bucket (`audio-samples/`)

---

### 5.9 Future Enhancements (Roadmap)

#### Phase 4 (Month 18): Voice Cloning

**Feature:** Allow teachers to clone their own voice using ElevenLabs Voice Design API

**Use Case:** "I want all lesson audio to sound like my voice, not a generic AI"

**Implementation:**

1. User records 3 minutes of speech (reading provided script)
2. Upload to ElevenLabs Voice Design API
3. API returns custom `voice_id`
4. Store in `organizations.custom_voice_id` column
5. Use custom voice for all TTS requests

**Cost:** $30 USD (~R555) one-time fee per voice clone (ElevenLabs pricing)

**Pricing:** Offer as CMS Enterprise add-on (R999 one-time)

---

#### Phase 5 (Month 24): Emotion & Tone Control

**Feature:** Adjust emotional tone (happy, sad, excited, calm) dynamically

**Example:**

```typescript
voice_settings: {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.8, // Higher = more exaggerated emotion
  emotion: 'excited', // ElevenLabs v3 feature (beta)
}
```

**Use Case:** Story narrations with different character voices (happy character vs sad character)

---

**Document Status:** Section 5 Complete ✅  
**Next Sections (Remaining):**
- [6. Implementation Roadmap with Revenue Projections](#6-implementation-roadmap)
- [7. Database Schemas & API Bridges](#7-database-schemas)
- [8. Component Design System](#8-component-design-system)
- [9. Mobile-First Development Rules](#9-mobile-first-rules)
- [10. Security & Compliance](#10-security-compliance)
- [11. Testing & Quality Assurance](#11-testing-qa)
- [12. Deployment & DevOps](#12-deployment-devops)
- [13. Cost Analysis & Break-Even Projections](#13-cost-analysis)
- [14. Competitive Analysis](#14-competitive-analysis)
- [15. Appendices & Reference Materials](#15-appendices)

---


## 6. Implementation Roadmap with Revenue Projections

### 6.1 Overview: 8-Month Development Timeline

**Total Investment:** R1,598,400 (see Section 1 for detailed breakdown)

**Phases:**

1. **Month 1-2:** Foundation (Core Operations Dashboard)
2. **Month 3-4:** Premium CMS (EduSitePro)
3. **Month 5-6:** AI Features & TTS
4. **Month 7:** Launch Preparation & Marketing
5. **Month 8:** Beta Launch & Iteration

---

### 6.2 Phase 1: Foundation (Months 1-2)

#### Month 1: Database & Authentication

**Week 1-2: Database Architecture**

- [ ] Set up Supabase projects (2 instances: operations + CMS)
- [ ] Implement Database 1 schemas (organizations, students, teachers, classes)
- [ ] Implement Database 2 schemas (centres, pages, page_blocks, registrations)
- [ ] Configure Row-Level Security (RLS) policies for all tables
- [ ] Set up API bridge endpoints (`/api/sync-tenant`, `/api/sync-branding`, `/api/registrations`)
- [ ] Create database migration scripts (versioned in `supabase/migrations/`)

**Week 3-4: Authentication & User Management**

- [ ] Implement Supabase Auth with email/password
- [ ] Add role-based access control (RBAC) — Principal, Teacher, Parent
- [ ] Create user onboarding flow (organization creation wizard)
- [ ] Build user profile management UI
- [ ] Implement password reset and 2FA (optional for Principals)
- [ ] Add user invitation system (invite teachers/parents via email)

**Deliverables:**

- ✅ Two fully configured Supabase databases with RLS
- ✅ Authentication system with RBAC
- ✅ User onboarding wizard (3-step: Create org → Invite teachers → Add students)

**Team:** 2 backend developers (R80,000/mo × 2 = R160,000)

---

#### Month 2: Core Operations Dashboard

**Week 1-2: Student & Teacher Management**

- [ ] Build student listing page (table with virtualized rows)
- [ ] Create student detail view (profile, medical info, guardians)
- [ ] Implement student creation form (multi-step with validation)
- [ ] Build teacher management UI (listing + detail views)
- [ ] Add CSV import for students (bulk upload)
- [ ] Implement class assignment UI (drag-and-drop)

**Week 3-4: Dashboard & Navigation**

- [ ] Design persistent sidebar navigation (EduDashPro, Settings, Upgrade)
- [ ] Build dashboard home page (KPI cards: students, teachers, classes)
- [ ] Implement organization settings page (logo upload, branding colors)
- [ ] Add mobile-responsive navigation (hamburger menu for <768px)
- [ ] Create empty states for all pages (illustrations + CTAs)
- [ ] Implement skeleton loading states (react-loading-skeleton)

**Deliverables:**

- ✅ Fully functional operations dashboard (student/teacher management)
- ✅ Mobile-responsive UI (44px touch targets, max 3 nested divs)
- ✅ Professional design (Vercel/Linear-inspired)

**Team:** 2 frontend developers (R70,000/mo × 2 = R140,000)

**Revenue Milestone:** R0 (free tier operational)

---

### 6.3 Phase 2: Premium CMS (Months 3-4)

#### Month 3: Website Builder Foundation

**Week 1-2: Page Management System**

- [ ] Build page listing UI (EduSitePro dashboard)
- [ ] Create page editor (drag-and-drop block builder)
- [ ] Implement 12 basic CMS blocks (Hero, Gallery, Testimonials, Contact Form, etc.)
- [ ] Add page preview mode (live preview with iframe)
- [ ] Build page settings panel (SEO meta tags, slug, publish status)
- [ ] Implement page publishing workflow (draft → review → publish)

**Week 3-4: Theme Customization**

- [ ] Create theme editor UI (color pickers, font selectors)
- [ ] Build 5 pre-designed themes (Modern, Classic, Playful, Professional, Minimalist)
- [ ] Implement live theme preview (switch themes without saving)
- [ ] Add custom CSS editor (CMS Pro+)
- [ ] Build branding sync mechanism (logo/colors from EduDashPro)
- [ ] Create theme export/import feature (JSON-based)

**Deliverables:**

- ✅ Page builder with 12 basic blocks
- ✅ 5 pre-designed themes
- ✅ Branding sync between databases

**Team:** 2 frontend developers + 1 backend developer (R210,000)

---

#### Month 4: Registration Forms & Domain Setup

**Week 1-2: Registration Forms**

- [ ] Build registration form builder (multi-step forms)
- [ ] Implement form submission handler (write to DB2 `registration_requests`)
- [ ] Create form analytics dashboard (submissions per week, conversion rates)
- [ ] Add email notifications (admin alert on new registration)
- [ ] Build parent approval workflow (approve/reject requests)
- [ ] Implement early bird tracking (campaign source attribution)

**Week 3-4: Custom Domains & Deployment**

- [ ] Set up Vercel integration (deploy EduSitePro sites)
- [ ] Implement custom domain connection (DNS configuration UI)
- [ ] Add SSL certificate provisioning (Let's Encrypt via Vercel)
- [ ] Build deployment preview system (preview changes before publish)
- [ ] Create subdomain auto-generation (e.g., `youngeagles.edudashpro.co.za`)
- [ ] Add domain verification checks (CNAME/A record validation)

**Deliverables:**

- ✅ Registration form system with parent approval workflow
- ✅ Custom domain support (CMS Pro+)
- ✅ Automated deployment to Vercel

**Team:** 2 frontend developers + 1 backend developer + 1 DevOps engineer (R280,000)

**Revenue Milestone:** R26,685 MRR (Q1 target: 50 customers)

---

### 6.4 Phase 3: AI Features & TTS (Months 5-6)

#### Month 5: AI Lesson Generation

**Week 1-2: Anthropic Claude Integration**

- [ ] Set up Claude API access (Anthropic API key)
- [ ] Build lesson generation prompt templates (grade-level specific)
- [ ] Implement lesson editor UI (text editor with AI suggestions)
- [ ] Add AI quota management (track tokens per organization)
- [ ] Create lesson export feature (PDF, DOCX, HTML)
- [ ] Build lesson library (save/reuse generated lessons)

**Week 3-4: Homework & Assessment Tools**

- [ ] Implement homework generator (worksheets with answer keys)
- [ ] Build quiz builder (multiple choice, short answer, true/false)
- [ ] Add AI grading assistant (auto-grade short answers with Claude)
- [ ] Create assessment analytics dashboard (student performance trends)
- [ ] Implement parent homework portal (view assigned homework)
- [ ] Add homework submission system (file upload + comments)

**Deliverables:**

- ✅ AI lesson generation with 10 lessons/month quota (Free tier)
- ✅ Homework generator with auto-grading
- ✅ Assessment analytics dashboard

**Team:** 2 AI/backend developers + 1 frontend developer (R220,000)

---

#### Month 6: Text-to-Speech System

**Week 1-2: ElevenLabs Integration**

- [ ] Set up ElevenLabs API access (multi-language support)
- [ ] Implement voice persona selector UI (5 personas × 4 languages)
- [ ] Build audio generation service (Supabase Edge Function)
- [ ] Add TTS quota management (character count tracking)
- [ ] Create voice sample library (pre-generated audio files)
- [ ] Implement audio player UI (playback controls, download)

**Week 3-4: Language Detection & Caching**

- [ ] Implement automatic language detection (franc-min library)
- [ ] Build audio caching system (store generated files in Supabase Storage)
- [ ] Add audio reuse logic (same text = reuse cached audio)
- [ ] Create TTS usage analytics (characters used per org)
- [ ] Implement quota exceeded warnings (upgrade prompts)
- [ ] Build language selector UI (11 SA languages with flags)

**Deliverables:**

- ✅ TTS system with 11 languages + 5 voice personas
- ✅ Audio caching for cost optimization
- ✅ Quota management with upgrade prompts

**Team:** 2 backend developers + 1 frontend developer (R220,000)

**Revenue Milestone:** R106,740 MRR (Q2 target: 200 customers)

---

### 6.5 Phase 4: Launch Preparation (Month 7)

#### Week 1-2: Payment Integration & Billing

- [ ] Set up Stripe account (ZAR pricing, subscription products)
- [ ] Implement checkout flow (pricing page → Stripe Checkout)
- [ ] Build webhook handler (subscription events: created, updated, canceled)
- [ ] Add billing portal integration (customer self-service)
- [ ] Implement plan upgrade/downgrade flow (prorated billing)
- [ ] Create invoice email templates (SendGrid or Resend)

#### Week 3-4: Testing & QA

- [ ] Write unit tests for critical features (auth, payments, AI)
- [ ] Conduct end-to-end testing (Playwright or Cypress)
- [ ] Perform accessibility audit (WCAG AAA compliance)
- [ ] Run performance testing (Lighthouse scores, load times)
- [ ] Execute security audit (OWASP Top 10, penetration testing)
- [ ] Fix critical bugs (P0 and P1 issues only)

**Deliverables:**

- ✅ Stripe payment integration with webhook handling
- ✅ Comprehensive test suite (80%+ code coverage)
- ✅ Security and accessibility compliance

**Team:** 2 QA engineers + 1 security specialist + full dev team (R340,000)

---

### 6.6 Phase 5: Beta Launch & Iteration (Month 8)

#### Week 1-2: Beta Launch

- [ ] Deploy to production (Vercel + Supabase)
- [ ] Launch Early Bird campaign (50% off for 6 months)
- [ ] Onboard first 10 beta customers (manual white-glove service)
- [ ] Set up analytics tracking (PostHog, Google Analytics 4)
- [ ] Create support documentation (knowledge base, video tutorials)
- [ ] Implement live chat support (Intercom or Crisp)

#### Week 3-4: Iteration & Optimization

- [ ] Collect user feedback (surveys, interviews, usage analytics)
- [ ] Fix onboarding friction points (reduce time-to-value)
- [ ] Optimize conversion funnels (A/B test upgrade page)
- [ ] Improve performance (lazy loading, code splitting)
- [ ] Add missing features (user-requested quick wins)
- [ ] Prepare for public launch (marketing materials, press kit)

**Deliverables:**

- ✅ Live beta with 50+ paying customers
- ✅ Support infrastructure (docs, chat, email)
- ✅ Optimized onboarding and conversion funnels

**Team:** Full team + marketing specialist (R380,000)

**Revenue Milestone:** R266,850 MRR (Q3 target: 500 customers)

---

### 6.7 Revenue Projections by Phase

| Phase | Months | Focus | Customers (Cumulative) | MRR | ARR | Investment | ROI |
|-------|--------|-------|------------------------|-----|-----|------------|-----|
| **1: Foundation** | 1-2 | Operations dashboard | 0 | R0 | R0 | R300,000 | — |
| **2: Premium CMS** | 3-4 | Website builder | 50 | R26,685 | R320,220 | R490,000 | -52% |
| **3: AI & TTS** | 5-6 | AI features + TTS | 200 | R106,740 | R1,280,880 | R440,000 | +191% |
| **4: Launch Prep** | 7 | Payments + testing | 350 | R186,800 | R2,241,600 | R340,000 | +660% |
| **5: Beta Launch** | 8 | Iteration + growth | 500 | R266,850 | R3,202,200 | R380,000 | +843% |
| **Total** | 1-8 | Full platform | 500 | R266,850 | R3,202,200 | **R1,598,400** | **+200%** |

**Break-Even Point:** Month 6 (200 customers, R106,740 MRR)

**12-Month Projection:** 1,000 customers, R533,700 MRR, R6,404,400 ARR

---

### 6.8 Risk Mitigation Strategies

#### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Database sync failures** | Medium | High | Implement retry logic + event sourcing for audit trail |
| **API rate limits (Claude/ElevenLabs)** | High | Medium | Quota management + caching + fallback to cheaper models |
| **Performance issues (slow dashboards)** | Medium | Medium | Virtualized tables + lazy loading + CDN caching |
| **Security breach (data leak)** | Low | Critical | RLS policies + regular audits + bug bounty program |
| **Supabase downtime** | Low | High | Multi-region failover + local caching + status page |

---

#### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Low conversion rate (<10%)** | Medium | High | A/B test upgrade page + user interviews + freemium onboarding optimization |
| **High churn (>25%)** | Medium | High | Customer success team + proactive support + feature surveys |
| **Competitor launches similar product** | Medium | Medium | Differentiate on SA market focus + language support + pricing |
| **Payment gateway issues (Stripe)** | Low | Medium | Backup payment processor (PayFast) + manual invoicing option |
| **Regulatory changes (POPIA)** | Low | Medium | Legal review + compliance consultant + privacy-first architecture |

---

### 6.9 Team Structure & Hiring Plan

#### Months 1-2 (Foundation)

- 2× Backend Developers (R80,000/mo each)
- 2× Frontend Developers (R70,000/mo each)
- 1× Product Manager (part-time, R40,000/mo)
- **Total:** R340,000/mo

---

#### Months 3-4 (Premium CMS)

- 2× Backend Developers
- 2× Frontend Developers
- 1× DevOps Engineer (R60,000/mo)
- 1× Product Manager
- **Total:** R360,000/mo

---

#### Months 5-6 (AI & TTS)

- 2× AI/Backend Developers (R90,000/mo each — specialized)
- 2× Frontend Developers
- 1× DevOps Engineer
- 1× Product Manager
- **Total:** R380,000/mo

---

#### Month 7 (Launch Prep)

- Full dev team (6 engineers)
- 2× QA Engineers (R50,000/mo each)
- 1× Security Specialist (R70,000/mo)
- 1× Product Manager
- **Total:** R500,000/mo

---

#### Month 8 (Beta Launch)

- Full team (9 people)
- 1× Marketing Specialist (R60,000/mo)
- 1× Customer Success Manager (R50,000/mo)
- **Total:** R550,000/mo

---

**Total Team Cost (8 months):** R1,184,000 (dev salaries only)

**Additional Costs:** R414,400 (infrastructure, APIs, marketing)

**Grand Total:** R1,598,400

---

### 6.10 Success Metrics & KPIs

#### Product Metrics

| Metric | Target (Month 8) | Measurement |
|--------|-----------------|-------------|
| **Active Organizations** | 500 | Database count (`organizations WHERE is_active = true`) |
| **Daily Active Users (DAU)** | 2,000 | PostHog unique sessions per day |
| **Time to First Value** | <10 minutes | PostHog funnel: signup → first student added |
| **Feature Adoption Rate** | >70% | % of orgs using AI lessons or TTS |
| **Page Load Time (p95)** | <2 seconds | Vercel Analytics |

---

#### Revenue Metrics

| Metric | Target (Month 8) | Measurement |
|--------|-----------------|-------------|
| **MRR** | R266,850 | Stripe MRR dashboard |
| **ARR** | R3,202,200 | MRR × 12 |
| **ARPU (Avg Revenue Per User)** | R534/mo | MRR / active customers |
| **Free → Paid Conversion** | 15% | Stripe subscription count / total signups |
| **Churn Rate** | <10%/mo | Canceled subscriptions / total active |

---

#### Customer Success Metrics

| Metric | Target (Month 8) | Measurement |
|--------|-----------------|-------------|
| **NPS (Net Promoter Score)** | >50 | Quarterly survey |
| **Customer Support Response Time** | <2 hours | Intercom/Crisp metrics |
| **Support Ticket Resolution Rate** | >95% | Tickets closed / tickets opened |
| **User Satisfaction (CSAT)** | >4.5/5 | Post-interaction survey |

---

**Document Status:** Section 6 Complete ✅  
**Next Section:** [7. Database Schemas & API Bridges](#7-database-schemas-api-bridges)

---


## 7. Database Schemas & API Bridges

### 7.1 Database 1 Complete Schema (Operations)

**Supabase Project:** `lvvvjywrmpcqrpvuptdi`

#### Organizations (Tenants)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  school_code VARCHAR(20) UNIQUE, -- For parent registration
  
  -- Organization Type
  organization_type VARCHAR(50) DEFAULT 'preschool', 
  -- preschool, primary, high-school, university
  
  -- Subscription
  plan_tier VARCHAR(20) DEFAULT 'free',
  -- free, cms_starter, cms_pro, cms_enterprise
  subscription_status VARCHAR(20) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Limits
  max_students INT DEFAULT 50,
  max_teachers INT DEFAULT 5,
  max_admins INT DEFAULT 1,
  
  -- Contact
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'ZA',
  
  -- Branding (synced FROM EduSitePro DB2)
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#7c3aed',
  secondary_color VARCHAR(7) DEFAULT '#4f46e5',
  font_family VARCHAR(100) DEFAULT 'Inter',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_sync_from_cms TIMESTAMPTZ, -- Track DB2 sync
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_tenant_isolation"
  ON organizations FOR ALL
  USING (id = current_setting('app.current_organization_id', true)::uuid);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_school_code ON organizations(school_code);
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id);
```

#### Profiles (Users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  preschool_id UUID REFERENCES preschools(id),
  
  -- Personal Info
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  
  -- Role
  role VARCHAR(20) DEFAULT 'parent',
  -- superadmin, principal, teacher, parent
  
  -- Preferences
  language VARCHAR(10) DEFAULT 'en-ZA',
  timezone VARCHAR(50) DEFAULT 'Africa/Johannesburg',
  avatar_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_record"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_same_org"
  ON profiles FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

#### Students

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  preschool_id UUID REFERENCES preschools(id),
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  id_number VARCHAR(50), -- SA ID number
  
  -- Enrollment
  enrollment_date DATE DEFAULT CURRENT_DATE,
  grade_level VARCHAR(20),
  class_id UUID REFERENCES classes(id),
  student_status VARCHAR(20) DEFAULT 'active',
  -- active, graduated, withdrawn, suspended
  
  -- Medical
  allergies TEXT[],
  medical_conditions TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(50),
  
  -- Parent Links
  parent_id UUID REFERENCES profiles(id),
  secondary_parent_id UUID REFERENCES profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  photo_url TEXT
);

-- RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_org_isolation"
  ON students FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- Parent access to own children
CREATE POLICY "students_parent_access"
  ON students FOR SELECT
  USING (parent_id = auth.uid() OR secondary_parent_id = auth.uid());

-- Indexes
CREATE INDEX idx_students_org ON students(organization_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_class ON students(class_id);
```

#### Classes

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  preschool_id UUID REFERENCES preschools(id),
  
  name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(20),
  academic_year INT,
  
  -- Teacher Assignment
  primary_teacher_id UUID REFERENCES profiles(id),
  assistant_teacher_id UUID REFERENCES profiles(id),
  
  -- Capacity
  max_students INT DEFAULT 25,
  current_student_count INT DEFAULT 0,
  
  -- Schedule
  start_time TIME,
  end_time TIME,
  days_of_week VARCHAR(50)[], -- ['Monday', 'Tuesday', ...]
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_org_isolation"
  ON classes FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

---

### 7.2 Database 2 Complete Schema (CMS)

**Supabase Project:** `bppuzibjlxgfwrujz` (to be created)

#### Centres (Public Website Metadata)

```sql
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to DB1 (operations)
  organization_id UUID NOT NULL, -- Foreign key to DB1.organizations.id
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Website Settings
  site_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  description TEXT,
  
  -- Custom Domain
  custom_domain VARCHAR(255),
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_token VARCHAR(255),
  
  -- Deployment
  vercel_project_id VARCHAR(255),
  vercel_deployment_url TEXT,
  deployment_status VARCHAR(20) DEFAULT 'draft',
  -- draft, building, deployed, error
  last_deployed_at TIMESTAMPTZ,
  
  -- Branding (MASTER - synced TO DB1)
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#7c3aed',
  secondary_color VARCHAR(7) DEFAULT '#4f46e5',
  font_family VARCHAR(100) DEFAULT 'Inter',
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Social Links
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  
  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  google_maps_embed TEXT,
  
  -- Features
  show_registration_form BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_gallery BOOLEAN DEFAULT true,
  
  -- Analytics
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_to_operations TIMESTAMPTZ, -- Track DB1 sync
  is_active BOOLEAN DEFAULT true
);

-- RLS (no tenant isolation needed - each centre manages own data)
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "centres_own_data"
  ON centres FOR ALL
  USING (organization_id::text = current_setting('app.current_organization_id', true));

-- Indexes
CREATE INDEX idx_centres_org ON centres(organization_id);
CREATE INDEX idx_centres_slug ON centres(slug);
CREATE INDEX idx_centres_domain ON centres(custom_domain);
```

#### Pages

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  
  -- Page Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  page_type VARCHAR(50) DEFAULT 'standard',
  -- standard, home, about, contact, gallery
  
  -- Content
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Publishing
  status VARCHAR(20) DEFAULT 'draft',
  -- draft, published, archived
  published_at TIMESTAMPTZ,
  
  -- Layout
  template VARCHAR(50) DEFAULT 'default',
  -- default, full-width, sidebar-left, sidebar-right
  
  -- Order
  sort_order INT DEFAULT 0,
  show_in_navigation BOOLEAN DEFAULT true,
  parent_page_id UUID REFERENCES pages(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- References DB1.profiles.id
  updated_by UUID,
  
  UNIQUE(centre_id, slug)
);

-- RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_centre_isolation"
  ON pages FOR ALL
  USING (centre_id IN (
    SELECT id FROM centres 
    WHERE organization_id::text = current_setting('app.current_organization_id', true)
  ));

-- Indexes
CREATE INDEX idx_pages_centre ON pages(centre_id);
CREATE INDEX idx_pages_slug ON pages(centre_id, slug);
CREATE INDEX idx_pages_status ON pages(status);
```

#### Page Blocks (CMS Content)

```sql
CREATE TABLE page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Block Info
  block_type VARCHAR(50) NOT NULL,
  -- hero, text, image, gallery, testimonials, cta, contact_form, 
  -- pricing, faq, team, video, spacer, divider, stats, features
  
  -- Content (JSON)
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Styling
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  padding VARCHAR(50) DEFAULT 'medium', -- none, small, medium, large
  margin VARCHAR(50) DEFAULT 'none',
  
  -- Layout
  sort_order INT DEFAULT 0,
  container_width VARCHAR(20) DEFAULT 'wide', -- narrow, normal, wide, full
  
  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_via_pages"
  ON page_blocks FOR ALL
  USING (page_id IN (
    SELECT p.id FROM pages p
    JOIN centres c ON p.centre_id = c.id
    WHERE c.organization_id::text = current_setting('app.current_organization_id', true)
  ));

-- Indexes
CREATE INDEX idx_blocks_page ON page_blocks(page_id);
CREATE INDEX idx_blocks_type ON page_blocks(block_type);
CREATE INDEX idx_blocks_order ON page_blocks(page_id, sort_order);
```

#### Example Block Content Structures

```json
// Hero Block
{
  "heading": "Welcome to Little Stars Preschool",
  "subheading": "Where every child shines bright",
  "cta_text": "Register Now",
  "cta_link": "/register",
  "background_image": "https://cdn.edudashpro.co.za/hero-bg.jpg",
  "overlay_opacity": 0.4
}

// Gallery Block
{
  "images": [
    {
      "url": "https://cdn.edudashpro.co.za/photo1.jpg",
      "caption": "Outdoor play area",
      "alt": "Children playing outside"
    },
    {
      "url": "https://cdn.edudashpro.co.za/photo2.jpg",
      "caption": "Art class",
      "alt": "Kids doing arts and crafts"
    }
  ],
  "columns": 3,
  "lightbox_enabled": true
}

// Contact Form Block
{
  "form_title": "Get In Touch",
  "submit_to_email": "info@littlestars.co.za",
  "fields": [
    { "name": "name", "label": "Full Name", "type": "text", "required": true },
    { "name": "email", "label": "Email", "type": "email", "required": true },
    { "name": "phone", "label": "Phone", "type": "tel", "required": false },
    { "name": "message", "label": "Message", "type": "textarea", "required": true }
  ],
  "submit_button_text": "Send Message",
  "success_message": "Thank you! We'll be in touch soon."
}
```

#### Registration Requests

```sql
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  
  -- Parent Info
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50),
  
  -- Child Info
  child_first_name VARCHAR(100) NOT NULL,
  child_last_name VARCHAR(100) NOT NULL,
  child_date_of_birth DATE,
  child_gender VARCHAR(20),
  
  -- Additional Info
  preferred_start_date DATE,
  program_interest VARCHAR(100), -- Morning program, Full day, etc.
  message TEXT,
  
  -- Tracking
  source VARCHAR(50), -- website, facebook, google, referral
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  -- pending, contacted, accepted, declined
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_operations BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "registrations_centre_isolation"
  ON registration_requests FOR ALL
  USING (centre_id IN (
    SELECT id FROM centres 
    WHERE organization_id::text = current_setting('app.current_organization_id', true)
  ));

-- Indexes
CREATE INDEX idx_registrations_centre ON registration_requests(centre_id);
CREATE INDEX idx_registrations_status ON registration_requests(status);
CREATE INDEX idx_registrations_sync ON registration_requests(synced_to_operations);
```

---

### 7.3 API Bridge Layer

The API bridge handles cross-database communication and syncing.

#### Bridge Endpoints

**Location:** `/api/bridge/*` (Next.js API routes in EduDashPro)

```typescript
// /api/bridge/sync-tenant.ts
/**
 * Sync organization from DB1 to DB2
 * Triggered when organization is created/updated in operations
 */
export async function POST(req: Request) {
  const { organizationId } = await req.json();
  
  // 1. Get organization from DB1
  const db1 = createClient(SUPABASE_URL_DB1, SUPABASE_KEY_DB1);
  const { data: org } = await db1
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single();
  
  // 2. Upsert to DB2 centres table
  const db2 = createClient(SUPABASE_URL_DB2, SUPABASE_KEY_DB2);
  await db2.from('centres').upsert({
    organization_id: org.id,
    slug: org.slug,
    site_name: org.name,
    contact_email: org.primary_contact_email,
    contact_phone: org.phone,
    // ... other fields
  });
  
  return Response.json({ success: true });
}
```

```typescript
// /api/bridge/sync-branding.ts
/**
 * Sync branding FROM DB2 TO DB1
 * Triggered when centre updates logo/colors in website builder
 */
export async function POST(req: Request) {
  const { centreId } = await req.json();
  
  // 1. Get branding from DB2
  const db2 = createClient(SUPABASE_URL_DB2, SUPABASE_KEY_DB2);
  const { data: centre } = await db2
    .from('centres')
    .select('organization_id, logo_url, primary_color, secondary_color, font_family')
    .eq('id', centreId)
    .single();
  
  // 2. Update DB1 organization
  const db1 = createClient(SUPABASE_URL_DB1, SUPABASE_KEY_DB1);
  await db1.from('organizations').update({
    logo_url: centre.logo_url,
    primary_color: centre.primary_color,
    secondary_color: centre.secondary_color,
    font_family: centre.font_family,
    last_sync_from_cms: new Date().toISOString()
  }).eq('id', centre.organization_id);
  
  return Response.json({ success: true });
}
```

```typescript
// /api/bridge/registrations.ts
/**
 * Sync registration requests FROM DB2 TO DB1
 * Runs every 5 minutes via cron (or triggered by webhook)
 */
export async function GET(req: Request) {
  const db2 = createClient(SUPABASE_URL_DB2, SUPABASE_KEY_DB2);
  const db1 = createClient(SUPABASE_URL_DB1, SUPABASE_KEY_DB1);
  
  // 1. Get unsynced registrations from DB2
  const { data: registrations } = await db2
    .from('registration_requests')
    .select('*')
    .eq('synced_to_operations', false)
    .eq('status', 'accepted');
  
  for (const reg of registrations) {
    // 2. Create student in DB1
    const { data: student } = await db1.from('students').insert({
      organization_id: reg.centre_id, // Maps to DB1 org
      first_name: reg.child_first_name,
      last_name: reg.child_last_name,
      date_of_birth: reg.child_date_of_birth,
      gender: reg.child_gender,
      enrollment_date: reg.preferred_start_date,
      student_status: 'pending_approval'
    }).select().single();
    
    // 3. Mark as synced in DB2
    await db2.from('registration_requests').update({
      synced_to_operations: true,
      synced_at: new Date().toISOString(),
      notes: `Created student ID: ${student.id}`
    }).eq('id', reg.id);
  }
  
  return Response.json({ synced: registrations.length });
}
```

---

**Document Status:** Section 7 Complete ✅  
**Next Section:** [8. Component Design System](#8-component-design-system)


## 8. Component Design System

### 8.1 Design Principles

**EduDash Pro follows Vercel/Linear-inspired minimalism:**

1. **Clarity Over Decoration** - Every pixel serves a purpose
2. **Speed Over Complexity** - Fast interactions, instant feedback
3. **Consistency Over Innovation** - Predictable patterns across all screens
4. **Accessibility First** - WCAG AAA compliance, not an afterthought

---

### 8.2 Color System

#### Primary Palette

```typescript
// colors.ts
export const colors = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  success: {
    DEFAULT: '#10b981',
    light: '#d1fae5',
    dark: '#065f46',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fef3c7',
    dark: '#92400e',
  },
  error: {
    DEFAULT: '#ef4444',
    light: '#fee2e2',
    dark: '#991b1b',
  },
};
```

#### Usage Rules

- **Primary (Purple)**: CTAs, active states, brand elements
- **Secondary (Blue)**: Links, informational elements
- **Neutral**: Text, borders, backgrounds (90% of UI)
- **Semantic Colors**: Success (green), Warning (amber), Error (red)

**Anti-patterns:**
- ❌ Don't use primary color for every button
- ❌ Don't mix semantic colors (green for errors, red for success)
- ❌ Don't use more than 3 colors on one screen

---

### 8.3 Typography System

#### Font Families

```typescript
// fonts.ts
export const fonts = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'JetBrains Mono, "Fira Code", Consolas, monospace',
};
```

#### Type Scale

```typescript
export const typography = {
  h1: {
    fontSize: '2.5rem',    // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',      // 32px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,
    lineHeight: 1.4,
    color: 'var(--text-muted)',
  },
};
```

#### Responsive Typography

```css
/* Mobile: 14px base */
@media (max-width: 767px) {
  :root {
    font-size: 14px;
  }
}

/* Tablet/Desktop: 16px base */
@media (min-width: 768px) {
  :root {
    font-size: 16px;
  }
}
```

---

### 8.4 Spacing System

**8px Grid System** - All spacing increments of 8px

```typescript
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px  ← Base unit
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};
```

**Usage Examples:**

```tsx
// Card padding: 24px
<div className="p-6">...</div>

// Button padding: 12px vertical, 20px horizontal
<button className="py-3 px-5">...</button>

// Section margin: 48px
<section className="mb-12">...</section>
```

---

### 8.5 Core Components

#### Button Component

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-400',
        outline: 'border-2 border-neutral-300 bg-transparent hover:bg-neutral-50 focus:ring-neutral-400',
        ghost: 'bg-transparent hover:bg-neutral-100 focus:ring-neutral-400',
        danger: 'bg-error text-white hover:bg-error-dark focus:ring-error',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
```

**Usage:**

```tsx
<Button variant="primary" size="lg">Create Student</Button>
<Button variant="outline" size="sm" loading>Saving...</Button>
<Button variant="danger" fullWidth onClick={handleDelete}>Delete</Button>
```

---

#### Input Component

```tsx
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-semibold text-neutral-700">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg border transition-all
            ${error 
              ? 'border-error focus:ring-error focus:border-error' 
              : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
            }
            focus:outline-none focus:ring-2
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {helperText && !error && <p className="text-sm text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);
```

**Usage:**

```tsx
<Input 
  label="Student Name" 
  placeholder="Enter full name"
  required
  error={errors.name}
/>
<Input 
  label="Email"
  type="email"
  helperText="We'll never share your email"
/>
```

---

#### Card Component

```tsx
// components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-neutral-200
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-lg hover:border-neutral-300 transition-all cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

---

### 8.6 Layout Components

#### Page Container

```tsx
// components/layout/PageContainer.tsx
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
```

#### Grid System

```tsx
// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

### 8.7 Dashboard-Specific Components

#### Metric Card

```tsx
// components/dashboard/MetricCard.tsx
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; trend: 'up' | 'down' };
  icon?: ReactNode;
}

export function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.trend === 'up' ? 'text-success' : 'text-error'}`}>
              {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-primary-500 text-4xl">{icon}</div>}
      </div>
    </Card>
  );
}
```

**Usage:**

```tsx
<MetricCard 
  label="Total Students" 
  value={247} 
  change={{ value: 12, trend: 'up' }}
  icon={<Users />}
/>
```

---

**Document Status:** Section 8 Complete ✅  
**Next Section:** Section 9

---

## 9. Mobile-First Development Rules

### 9.1 Core Principles

**Mobile-first means:**
1. Design for 375px (iPhone SE) FIRST
2. Enhance for larger screens SECOND
3. Never assume mouse/keyboard exists
4. Touch targets ≥ 44px (WCAG AAA)

---

### 9.2 Touch Target Sizing

#### Minimum Sizes

```typescript
export const touchTargets = {
  minimum: 44,      // WCAG AAA standard (44x44px)
  comfortable: 48,  // Recommended for primary actions
  spacious: 56,     // For large CTAs
};
```

**Examples:**

```tsx
// ✅ CORRECT - 48px height
<button className="h-12 px-6">Submit</button>

// ❌ WRONG - 32px height (too small for touch)
<button className="h-8 px-4">Submit</button>

// ✅ CORRECT - Icon buttons with adequate spacing
<button className="h-12 w-12 flex items-center justify-center">
  <Icon size={20} />
</button>
```

---

### 9.3 Responsive Breakpoints

```typescript
export const breakpoints = {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
};
```

**Mobile-First Media Queries:**

```css
/* Base styles: Mobile (375px+) */
.container {
  padding: 1rem;
  font-size: 14px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    font-size: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

---

### 9.4 Navigation Patterns

#### Mobile Navigation (< 768px)

```tsx
// Hamburger menu with bottom tab bar
export function MobileNav() {
  return (
    <>
      {/* Top Bar */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4">
        <button className="h-10 w-10" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
        <h1 className="font-bold">EduDash Pro</h1>
        <button className="h-10 w-10">
          <User size={24} />
        </button>
      </header>

      {/* Bottom Tab Bar (fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex justify-around items-center safe-area-inset-bottom">
        <NavButton icon={<Home />} label="Home" />
        <NavButton icon={<Users />} label="Students" />
        <NavButton icon={<Calendar />} label="Schedule" />
        <NavButton icon={<Settings />} label="Settings" />
      </nav>
    </>
  );
}
```

#### Desktop Navigation (≥ 768px)

```tsx
// Persistent sidebar
export function DesktopNav() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">EduDash Pro</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <NavLink href="/dashboard" icon={<Home />}>Dashboard</NavLink>
        <NavLink href="/students" icon={<Users />}>Students</NavLink>
        <NavLink href="/teachers" icon={<School />}>Teachers</NavLink>
        {/* ... */}
      </nav>
    </aside>
  );
}
```

---

### 9.5 Form Layouts

#### Mobile-Optimized Forms

```tsx
export function StudentForm() {
  return (
    <form className="space-y-4">
      {/* Full-width inputs on mobile */}
      <Input 
        label="First Name" 
        className="w-full"
        autoComplete="given-name"
        inputMode="text"
      />
      
      <Input 
        label="Last Name" 
        className="w-full"
        autoComplete="family-name"
      />

      {/* Two-column on tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date of Birth" type="date" />
        <Input label="Grade" />
      </div>

      {/* Full-width textarea */}
      <Textarea 
        label="Medical Notes" 
        rows={4}
        className="resize-none"
      />

      {/* Sticky submit button on mobile */}
      <div className="fixed md:static bottom-0 left-0 right-0 p-4 md:p-0 bg-white md:bg-transparent border-t md:border-0">
        <Button fullWidth size="lg">Save Student</Button>
      </div>
    </form>
  );
}
```

---

### 9.6 Table Patterns

#### Mobile-Responsive Tables

```tsx
// Desktop: Traditional table
// Mobile: Card-based list

export function StudentTable({ students }: { students: Student[] }) {
  return (
    <>
      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Grade</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b hover:bg-neutral-50">
                <td className="p-4">{student.name}</td>
                <td className="p-4">{student.grade}</td>
                <td className="p-4">
                  <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                    {student.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (shown only on mobile) */}
      <div className="md:hidden space-y-3">
        {students.map(student => (
          <Card key={student.id} padding="md" hover>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-sm text-neutral-600">Grade {student.grade}</p>
              </div>
              <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                {student.status}
              </Badge>
            </div>
            <Button variant="outline" size="sm" fullWidth className="mt-3">
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
```

---

### 9.7 Performance Rules

#### Code Splitting

```tsx
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const CalendarView = lazy(() => import('./CalendarView'));
const ReportGenerator = lazy(() => import('./ReportGenerator'));

export function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CalendarView />
    </Suspense>
  );
}
```

#### Image Optimization

```tsx
import Image from 'next/image';

// ✅ CORRECT - Optimized with Next.js Image
<Image 
  src="/student-photo.jpg"
  alt="Student profile"
  width={120}
  height={120}
  className="rounded-full"
  loading="lazy"
  placeholder="blur"
/>

// ❌ WRONG - Unoptimized, slow on mobile
<img src="/student-photo.jpg" />
```

---

### 9.8 Offline Support (PWA)

#### Service Worker Registration

```typescript
// public/sw.js
const CACHE_NAME = 'edudash-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/offline',
  '/styles/main.css',
  '/scripts/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

**Document Status:** Section 9 Complete ✅  
**Next Section:** Section 10

---

## 10. Security & Compliance

### 10.1 POPIA Compliance (South Africa)

**Protection of Personal Information Act (POPIA)** - South Africa's data protection law (equivalent to GDPR).

#### Data Classification

| Category | Examples | Storage | Encryption | Retention |
|----------|----------|---------|------------|-----------|
| **Personal Info** | Names, emails, phone numbers | DB1 `profiles`, `students` | At rest (AES-256) | Until account deletion |
| **Special Personal Info** | Medical conditions, SA ID numbers | DB1 `students.medical_conditions` | At rest + in transit (TLS 1.3) | 7 years after withdrawal |
| **Anonymous Data** | Usage analytics, page views | PostHog (anonymized) | N/A | Indefinitely |
| **Public Data** | Website content, testimonials | DB2 `pages`, `page_blocks` | Optional | Until deleted by user |

---

### 10.2 Row-Level Security (RLS)

**Every table MUST have RLS enabled.**

#### Example RLS Policies

```sql
-- Students: Only accessible by same organization
CREATE POLICY "students_org_isolation"
  ON students FOR ALL
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);

-- Parents can only see their own children
CREATE POLICY "students_parent_access"
  ON students FOR SELECT
  USING (parent_id = auth.uid() OR secondary_parent_id = auth.uid());

-- Teachers can see students in their classes
CREATE POLICY "students_teacher_access"
  ON students FOR SELECT
  USING (
    class_id IN (
      SELECT id FROM classes 
      WHERE primary_teacher_id = auth.uid() OR assistant_teacher_id = auth.uid()
    )
  );

-- Principals can see all students in their organization
CREATE POLICY "students_principal_access"
  ON students FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'principal'
    )
  );
```

---

### 10.3 Authentication & Authorization

#### Supabase Auth Configuration

```typescript
// lib/supabase/auth-config.ts
export const authConfig = {
  // Email/Password (default)
  enableEmailAuth: true,
  requireEmailVerification: true,
  
  // Password Requirements
  passwordMinLength: 12,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  
  // Session Management
  sessionTimeout: 7 * 24 * 60 * 60, // 7 days
  refreshTokenRotation: true,
  
  // Multi-Factor Authentication (Optional for Principals)
  enable2FA: true,
  require2FAForRole: ['principal', 'superadmin'],
  
  // OAuth Providers (Future)
  enableGoogleAuth: false, // Phase 2
  enableMicrosoftAuth: false, // For schools using Office 365
};
```

#### JWT Claims Structure

```json
{
  "sub": "uuid-user-id",
  "email": "teacher@school.co.za",
  "role": "teacher",
  "organization_id": "uuid-org-id",
  "preschool_id": "uuid-preschool-id",
  "iat": 1699999999,
  "exp": 1700086399
}
```

---

### 10.4 Data Encryption

#### At Rest (Database)

- Supabase PostgreSQL: **AES-256 encryption** (automatic)
- Backups: Encrypted with same key
- File Storage (Supabase Storage): **AES-256**

#### In Transit

```typescript
// All API calls use HTTPS (TLS 1.3)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // https://...supabase.co
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      },
    },
  }
);
```

---

### 10.5 Input Validation & Sanitization

#### Server-Side Validation (Zod)

```typescript
import { z } from 'zod';

const studentSchema = z.object({
  first_name: z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/),
  last_name: z.string().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 0 && age <= 18;
  }, { message: 'Student must be between 0-18 years old' }),
  id_number: z.string().regex(/^\d{13}$/).optional(), // SA ID: 13 digits
  email: z.string().email().optional(),
});

// Usage in API route
export async function POST(req: Request) {
  const body = await req.json();
  const validatedData = studentSchema.parse(body); // Throws if invalid
  
  // Proceed with validated data
}
```

#### XSS Protection

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user-generated content before rendering
function SafeHTML({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

### 10.6 Rate Limiting

#### API Rate Limits

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Different limits per endpoint
export const rateLimiters = {
  // Authentication: 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
  }),
  
  // AI Generation: 10 requests per hour (free tier)
  aiGeneration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
  }),
  
  // General API: 100 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
};

// Middleware usage
export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, remaining } = await rateLimiters.general.limit(ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  return NextResponse.next();
}
```

---

### 10.7 Audit Logging

#### Track All Sensitive Actions

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  
  -- Action Details
  action VARCHAR(50) NOT NULL, -- create, update, delete, export, login, logout
  resource_type VARCHAR(50) NOT NULL, -- student, teacher, organization, payment
  resource_id UUID,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  
  -- Changes (for update/delete)
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see their own org's logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_org_isolation"
  ON audit_logs FOR SELECT
  USING (organization_id = current_setting('app.current_organization_id', true)::uuid);
```

**Usage Example:**

```typescript
async function updateStudent(studentId: string, updates: Partial<Student>) {
  const { data: oldStudent } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
  
  const { data: newStudent } = await supabase
    .from('students')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single();
  
  // Log the change
  await supabase.from('audit_logs').insert({
    organization_id: newStudent.organization_id,
    user_id: session.user.id,
    action: 'update',
    resource_type: 'student',
    resource_id: studentId,
    old_values: oldStudent,
    new_values: newStudent,
    ip_address: req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
  });
}
```

---

### 10.8 Security Checklist (Pre-Launch)

- [ ] All Supabase tables have RLS enabled
- [ ] All API routes validate JWT tokens
- [ ] All user inputs are validated with Zod schemas
- [ ] All user-generated HTML is sanitized with DOMPurify
- [ ] Rate limiting enabled on auth and AI endpoints
- [ ] HTTPS enforced (HSTS headers)
- [ ] Sensitive data encrypted at rest (AES-256)
- [ ] Database backups automated (daily)
- [ ] Audit logs track all sensitive actions
- [ ] Password requirements meet POPIA standards (12+ chars, complexity)
- [ ] 2FA available for principals and super admins
- [ ] Session timeout configured (7 days max)
- [ ] CORS configured to allow only production domains
- [ ] Environment variables stored in Vercel secrets (never in code)
- [ ] Dependency security scan (npm audit) passes
- [ ] Penetration testing completed (external security firm)

---

**Document Status:** Sections 8, 9, 10 Complete ✅  
**Next Sections:** 11 (Testing), 12 (Deployment), 13 (Cost Analysis), 14 (Competitive Analysis), 15 (Appendices)


## 11. Testing & Quality Assurance

### 11.1 Testing Strategy

**Four-Layer Testing Pyramid:**

```
                 ▲
                / \
               /   \
              / E2E \          ← 5% (Critical user flows)
             /_______\
            /         \
           /Integration\       ← 15% (API + DB interactions)
          /_____________\
         /               \
        /  Unit Tests     \    ← 60% (Business logic, utils)
       /_________________  \
      /                     \
     /   Type Safety (TSC)   \ ← 20% (Compile-time checks)
    /_________________________\
```

---

### 11.2 Unit Testing (Jest + React Testing Library)

#### Configuration

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Example Unit Tests

```typescript
// __tests__/lib/utils/quota-calculator.test.ts
import { calculateRemainingQuota, isWithinQuota } from '@/lib/utils/quota-calculator';

describe('Quota Calculator', () => {
  describe('calculateRemainingQuota', () => {
    it('should return correct remaining quota for free tier', () => {
      const result = calculateRemainingQuota({
        tier: 'free',
        usedThisMonth: 50,
        limits: { free: 100, basic: 500, pro: 2000 },
      });
      
      expect(result.remaining).toBe(50);
      expect(result.percentage).toBe(50);
    });

    it('should handle unlimited quota for platform orgs', () => {
      const result = calculateRemainingQuota({
        tier: 'unlimited',
        usedThisMonth: 999999,
        organizationId: '00000000-0000-0000-0000-000000000001',
      });
      
      expect(result.remaining).toBe(Infinity);
      expect(result.isUnlimited).toBe(true);
    });

    it('should return 0 when quota exceeded', () => {
      const result = calculateRemainingQuota({
        tier: 'free',
        usedThisMonth: 150,
        limits: { free: 100 },
      });
      
      expect(result.remaining).toBe(0);
      expect(result.isExceeded).toBe(true);
    });
  });

  describe('isWithinQuota', () => {
    it('should return true when under limit', () => {
      expect(isWithinQuota(50, 100)).toBe(true);
    });

    it('should return false when over limit', () => {
      expect(isWithinQuota(150, 100)).toBe(false);
    });

    it('should always return true for unlimited tier', () => {
      expect(isWithinQuota(999999, Infinity)).toBe(true);
    });
  });
});
```

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { container } = render(<Button variant="primary">Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('shows loading spinner when loading prop is true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

### 11.3 Integration Testing (API Routes)

```typescript
// __tests__/api/students/create.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/students/route';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('POST /api/students', () => {
  it('should create a student with valid data', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id: 'uuid-123', first_name: 'John', last_name: 'Doe' }],
        error: null,
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { req } = createMocks({
      method: 'POST',
      body: {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '2020-01-01',
        organization_id: 'org-uuid',
      },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe('uuid-123');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      first_name: 'John',
      last_name: 'Doe',
    }));
  });

  it('should return 400 for invalid data', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        first_name: 'J', // Too short (min 2 chars)
        last_name: '',
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it('should enforce RLS and reject cross-org creation', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { code: '42501', message: 'permission denied for table students' },
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    const { req } = createMocks({
      method: 'POST',
      body: {
        first_name: 'Jane',
        last_name: 'Smith',
        organization_id: 'different-org-uuid', // User not in this org
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(403);
  });
});
```

---

### 11.4 End-to-End Testing (Playwright)

#### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
```

#### Example E2E Tests

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login as principal and access dashboard', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'principal@school.co.za');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard/principal');

    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText('Principal Dashboard');
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Active Teachers')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'principal@school.co.za');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard/principal');

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // Verify redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
```

```typescript
// e2e/students/create-student.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Student Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as principal
    await page.goto('/login');
    await page.fill('input[name="email"]', 'principal@school.co.za');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard/principal');
  });

  test('should create a new student successfully', async ({ page }) => {
    // Navigate to students page
    await page.click('text=Students');
    await page.waitForURL('/dashboard/principal/students');

    // Click "Add Student" button
    await page.click('text=Add Student');

    // Fill student form
    await page.fill('input[name="first_name"]', 'Sarah');
    await page.fill('input[name="last_name"]', 'Johnson');
    await page.fill('input[name="date_of_birth"]', '2020-03-15');
    await page.selectOption('select[name="grade"]', 'Grade R');
    await page.fill('input[name="parent_email"]', 'parent@email.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('text=Student created successfully')).toBeVisible();

    // Verify student appears in list
    await expect(page.locator('text=Sarah Johnson')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('text=Students');
    await page.click('text=Add Student');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should handle mobile upload of student photo', async ({ page }) => {
    // Use mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.click('text=Students');
    await page.click('text=Add Student');

    // Upload photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('fixtures/student-photo.jpg');

    // Verify preview
    await expect(page.locator('img[alt="Student photo preview"]')).toBeVisible();
  });
});
```

---

### 11.5 Accessibility Testing

```typescript
// __tests__/a11y/dashboard.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '@/app/dashboard/principal/page';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations on principal dashboard', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels on interactive elements', () => {
    const { getByRole } = render(<Dashboard />);
    
    expect(getByRole('button', { name: /add student/i })).toBeInTheDocument();
    expect(getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const { getByRole } = render(<Dashboard />);
    const addButton = getByRole('button', { name: /add student/i });
    
    addButton.focus();
    expect(addButton).toHaveFocus();
  });
});
```

---

### 11.6 Performance Testing

```typescript
// __tests__/performance/page-load.test.ts
import { chromium } from 'playwright';

describe('Performance Metrics', () => {
  it('should load dashboard in under 2 seconds', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/dashboard/principal');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(2000);
    
    await browser.close();
  });

  it('should have good Core Web Vitals', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/dashboard/principal');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find((e) => e.entryType === 'largest-contentful-paint');
          resolve({
            lcp: lcp ? lcp.startTime : 0,
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect((metrics as any).lcp).toBeLessThan(2500); // LCP < 2.5s = Good
    
    await browser.close();
  });
});
```

---

### 11.7 Database Testing

```sql
-- tests/sql/rls-policies.test.sql
BEGIN;

-- Create test organization and users
INSERT INTO organizations (id, name, tier) VALUES 
  ('org-test-1', 'Test School A', 'basic'),
  ('org-test-2', 'Test School B', 'pro');

INSERT INTO profiles (id, organization_id, email, role) VALUES
  ('user-principal-1', 'org-test-1', 'principal1@test.com', 'principal'),
  ('user-teacher-1', 'org-test-1', 'teacher1@test.com', 'teacher'),
  ('user-teacher-2', 'org-test-2', 'teacher2@test.com', 'teacher');

-- Test: Teachers should only see students in their org
SET LOCAL app.current_user_id = 'user-teacher-1';
SET LOCAL app.current_organization_id = 'org-test-1';

SELECT COUNT(*) FROM students WHERE organization_id = 'org-test-2';
-- Expected: 0 (should be blocked by RLS)

-- Test: Principals can create students in their org
SET LOCAL app.current_user_id = 'user-principal-1';
INSERT INTO students (first_name, last_name, organization_id) 
VALUES ('Test', 'Student', 'org-test-1');
-- Expected: Success

-- Test: Cannot create student in different org
INSERT INTO students (first_name, last_name, organization_id) 
VALUES ('Test', 'Student', 'org-test-2');
-- Expected: Error (RLS violation)

ROLLBACK;
```

---

### 11.8 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ secrets.STAGING_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
```

---

### 11.9 QA Checklist (Pre-Release)

#### Functional Testing
- [ ] All user roles can login successfully
- [ ] RLS policies prevent cross-org data access
- [ ] CRUD operations work for students, teachers, classes
- [ ] File uploads (photos, documents) work correctly
- [ ] Payment processing (Stripe) completes successfully
- [ ] Email notifications are sent correctly

#### UI/UX Testing
- [ ] Mobile navigation works on iOS Safari and Android Chrome
- [ ] Touch targets are ≥ 44px
- [ ] Forms validate inputs correctly
- [ ] Loading states display for async operations
- [ ] Error messages are user-friendly

#### Performance Testing
- [ ] Dashboard loads in < 2 seconds on 3G
- [ ] Images are optimized (WebP, lazy loading)
- [ ] Core Web Vitals are "Good" (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Database queries use indexes (no full table scans)

#### Security Testing
- [ ] XSS protection works (DOMPurify sanitization)
- [ ] CSRF tokens validated on all POST requests
- [ ] Rate limiting prevents brute force attacks
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Audit logs track all critical actions

#### Accessibility Testing
- [ ] WCAG 2.1 AAA compliance verified with axe-core
- [ ] Keyboard navigation works for all features
- [ ] Screen reader compatibility tested (NVDA, JAWS, VoiceOver)
- [ ] Color contrast ratios meet AAA standards (7:1)

---

**Document Status:** Section 11 Complete ✅  
**Next Section:** Section 12

---

## 12. Deployment & DevOps

### 12.1 Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │   Vercel     │◄──────►│   Supabase   │                   │
│  │  (Frontend)  │        │  (Database)  │                   │
│  │              │        │              │                   │
│  │ - Next.js    │        │ - PostgreSQL │                   │
│  │ - Edge Fns   │        │ - Auth       │                   │
│  │ - CDN        │        │ - Storage    │                   │
│  └──────────────┘        └──────────────┘                   │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │   Stripe     │        │  PostHog     │                   │
│  │  (Payments)  │        │ (Analytics)  │                   │
│  └──────────────┘        └──────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 12.2 Environment Configuration

#### Production Environment Variables

```bash
# .env.production (Vercel Secrets)

# Supabase (Database 1 - Operations)
NEXT_PUBLIC_SUPABASE_URL=https://lvvvjywrmpcqrpvuptdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SECRET

# Supabase (Database 2 - CMS) - Phase 2
NEXT_PUBLIC_CMS_SUPABASE_URL=https://bppuzibjlxgfwrujz.supabase.co
NEXT_PUBLIC_CMS_SUPABASE_ANON_KEY=...
CMS_SUPABASE_SERVICE_ROLE_KEY=... # SECRET

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_... # SECRET
STRIPE_WEBHOOK_SECRET=whsec_... # SECRET

# TTS (ElevenLabs)
ELEVENLABS_API_KEY=... # SECRET
ELEVENLABS_VOICE_ID_EN=... # English voice
ELEVENLABS_VOICE_ID_ZU=... # Zulu voice
ELEVENLABS_VOICE_ID_XH=... # Xhosa voice

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email (Resend)
RESEND_API_KEY=re_... # SECRET
RESEND_FROM_EMAIL=noreply@edudashpro.org.za

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=... # SECRET

# Security
NEXTAUTH_SECRET=... # SECRET (32+ random chars)
NEXTAUTH_URL=https://app.edudashpro.org.za

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_TTS=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

---

### 12.3 Deployment Pipeline

#### Vercel Deployment (Next.js)

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["cdg1"], // Paris (closest to South Africa)
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
      "STRIPE_SECRET_KEY": "@stripe-secret-key"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

#### Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:all
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run E2E smoke tests
        run: npm run test:e2e:smoke
        env:
          PLAYWRIGHT_TEST_BASE_URL: https://app.edudashpro.org.za
      
      - name: Notify team on Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Deployment successful: https://app.edudashpro.org.za"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 12.4 Database Migrations

#### Supabase Migration Strategy

```bash
# Run migrations on production (via Supabase CLI)
supabase db push --db-url postgresql://postgres:[PASSWORD]@db.lvvvjywrmpcqrpvuptdi.supabase.co:5432/postgres

# Create new migration
supabase migration new add_subscription_tiers

# Rollback if needed
supabase db reset
```

#### Migration Template

```sql
-- migrations/20240115_add_subscription_tiers.sql

BEGIN;

-- Add new column
ALTER TABLE organizations 
ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';

-- Add check constraint
ALTER TABLE organizations
ADD CONSTRAINT valid_subscription_tier 
CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise'));

-- Backfill existing data
UPDATE organizations 
SET subscription_tier = 'basic' 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Create index
CREATE INDEX idx_organizations_subscription_tier 
ON organizations(subscription_tier);

COMMIT;
```

---

### 12.5 Monitoring & Observability

#### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  tracesSampleRate: 0.1, // 10% of transactions
  
  beforeSend(event, hint) {
    // Don't send errors from bots
    if (event.request?.headers?.['user-agent']?.includes('bot')) {
      return null;
    }
    
    // Scrub sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    
    return event;
  },
});
```

#### Uptime Monitoring (Vercel Analytics)

```typescript
// web/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);
  const url = '/api/analytics';
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

### 12.6 Backup & Disaster Recovery

#### Database Backups

**Supabase Automatic Backups:**
- Daily backups (retained for 7 days on Free/Pro plans)
- Point-in-time recovery (Pro plan: up to 7 days)

**Custom Backup Script:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

pg_dump postgresql://postgres:${SUPABASE_PASSWORD}@db.lvvvjywrmpcqrpvuptdi.supabase.co:5432/postgres \
  > /backups/${BACKUP_FILE}

# Upload to S3
aws s3 cp /backups/${BACKUP_FILE} s3://edudash-backups/db/

# Retain only last 30 days
find /backups -name "backup_*.sql" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

**Cron Job:**

```bash
# Run daily at 2 AM UTC
0 2 * * * /scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

---

### 12.7 Rollback Strategy

#### Steps to Rollback Production Deployment

1. **Identify Issue:**
   - Check Sentry for error spikes
   - Review Vercel deployment logs
   - Verify database migration status

2. **Rollback Frontend (Vercel):**
   ```bash
   # List recent deployments
   vercel ls
   
   # Promote previous deployment to production
   vercel promote <deployment-url>
   ```

3. **Rollback Database Migration:**
   ```sql
   -- If migration added columns, remove them
   ALTER TABLE students DROP COLUMN new_column;
   
   -- If migration changed data, restore from backup
   psql -U postgres -h db.lvvvjywrmpcqrpvuptdi.supabase.co \
     -d postgres < backup_20240115_020000.sql
   ```

4. **Notify Users:**
   - Send status update via dashboard banner
   - Post on status page (status.edudashpro.org.za)
   - Email affected users if data loss occurred

---

### 12.8 Performance Optimization

#### CDN Configuration (Vercel Edge Network)

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['lvvvjywrmpcqrpvuptdi.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize fonts
  optimizeFonts: true,
};
```

#### Database Connection Pooling

```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

// Use Supavisor (Supabase connection pooler)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      'x-connection-pool': 'transaction', // Use transaction-level pooling
    },
  },
});
```

---

**Document Status:** Section 12 Complete ✅  
**Next Section:** Section 13

---

## 13. Cost Analysis & Break-Even Projection

### 13.1 Monthly Operating Costs

#### Fixed Costs (Infrastructure)

| Service | Plan | Cost (USD) | Cost (ZAR) | Notes |
|---------|------|------------|------------|-------|
| **Supabase DB1** (Operations) | Pro | $25 | R470 | 8GB database, 100GB bandwidth |
| **Supabase DB2** (CMS) | Pro | $25 | R470 | Phase 2 (website builder) |
| **Vercel** | Pro | $20 | R376 | Next.js hosting, Edge Functions |
| **Stripe** | Pay-as-you-go | $0 base | R0 | 2.9% + R1.50 per transaction |
| **Sentry** (Error Tracking) | Team | $26 | R489 | 50k events/month |
| **PostHog** (Analytics) | Free | $0 | R0 | Up to 1M events/month |
| **Upstash** (Redis) | Pay-as-you-go | ~$5 | R94 | Rate limiting |
| **Resend** (Email) | Free | $0 | R0 | 3k emails/month (then $20/mo) |
| **Domain** (edudashpro.org.za) | Annual | ~$2 | R38 | R450/year ÷ 12 |
| **SSL Certificate** | Free | $0 | R0 | Let's Encrypt via Vercel |
| **Backups** (S3) | Pay-as-you-go | ~$3 | R56 | 100GB storage |
| **TOTAL FIXED** |  | **$106** | **R1,993/month** | ~R24k/year |

**Exchange Rate:** 1 USD = 18.80 ZAR (as of Nov 2024)

---

#### Variable Costs (Per User/Transaction)

| Service | Unit | Cost | Notes |
|---------|------|------|-------|
| **AI API** (Anthropic Claude) | 1M tokens | $3 input, $15 output | Lesson generation, grading |
| **TTS API** (ElevenLabs) | 1k characters | $0.30 | Story narration |
| **Stripe** | Transaction | 2.9% + R1.50 | Payment processing |
| **Database Storage** | 1GB | ~$0.125/month | Auto-scales on Supabase |

**Example AI Usage:**
- Lesson generation: ~5k tokens (R0.95 per lesson)
- Grading 20 students: ~10k tokens (R1.90 per class)
- TTS story (500 words): ~3k characters (R5.64 per story)

---

### 13.2 Revenue Model

#### Subscription Tiers (Monthly Pricing)

| Tier | Price (ZAR/month) | Features | Target Market |
|------|-------------------|----------|---------------|
| **Free** | R0 | 5 students, 10 AI lessons/month, ads | Individual parents, demo users |
| **Basic** | R299 | 30 students, 100 AI lessons/month, no ads | Small preschools (1-2 teachers) |
| **Pro** | R799 | 100 students, 500 AI lessons/month, WhatsApp, analytics | Medium preschools (3-5 teachers) |
| **Enterprise** | R1,999 | Unlimited students/teachers, unlimited AI, white-label | Large schools (10+ teachers) |

#### Additional Revenue Streams

1. **Website Builder (EduSitePro):** R99/month per school (DB2 CMS)
2. **Premium Templates:** R49 one-time per template
3. **Custom AI Voices:** R199/month (school-branded TTS voice)
4. **API Access:** R499/month (for third-party integrations)
5. **Professional Services:** R1,500/hour (onboarding, training, customization)

---

### 13.3 Customer Acquisition Assumptions

#### Year 1 Projections (Conservative)

| Month | Free | Basic | Pro | Enterprise | Total Paying | MRR (ZAR) |
|-------|------|-------|-----|------------|--------------|-----------|
| 1 | 50 | 5 | 1 | 0 | 6 | R2,294 |
| 3 | 150 | 15 | 3 | 0 | 18 | R6,882 |
| 6 | 300 | 30 | 8 | 1 | 39 | R17,287 |
| 9 | 500 | 50 | 15 | 2 | 67 | R31,944 |
| 12 | 800 | 80 | 25 | 5 | 110 | R54,920 |

**Assumptions:**
- 20% of free users convert to Basic within 3 months
- 10% of Basic users upgrade to Pro within 6 months
- 5% of Pro users upgrade to Enterprise within 12 months
- 5% monthly churn rate

**Calculations (Month 12):**
- Basic: 80 × R299 = R23,920
- Pro: 25 × R799 = R19,975
- Enterprise: 5 × R1,999 = R9,995
- **Total MRR:** R53,890
- **Annual Recurring Revenue (ARR):** R646,680

---

### 13.4 Break-Even Analysis

#### Fixed Costs (Annual)

```
Infrastructure: R24,000/year
Salaries (2 devs part-time): R240,000/year (R10k/month each)
Marketing (Google Ads, FB): R36,000/year (R3k/month)
Legal/Accounting: R12,000/year
Misc (conferences, tools): R8,000/year

TOTAL FIXED: R320,000/year
```

#### Break-Even Calculation

```
Monthly Fixed Costs: R26,667
Average Revenue Per User (ARPU): R499 (blended across tiers)

Break-Even Point: R26,667 ÷ R499 = 53 paying customers

Timeline to Break-Even: Month 9 (67 paying customers)
```

---

### 13.5 3-Year Financial Projection

| Year | Paying Customers | MRR (End of Year) | ARR | Total Costs | Net Profit |
|------|------------------|-------------------|-----|-------------|------------|
| **Year 1** | 110 | R54,920 | R659k | R320k | **R339k** |
| **Year 2** | 350 | R174,650 | R2.1M | R480k* | **R1.6M** |
| **Year 3** | 800 | R399,200 | R4.8M | R720k** | **R4.1M** |

**Notes:**
- *Year 2 costs include hiring 1 full-time support staff (R15k/month)
- **Year 3 costs include additional dev (R20k/month) + increased marketing (R10k/month)

---

### 13.6 Unit Economics (Per Customer)

#### Customer Lifetime Value (LTV)

```
Average Customer Lifespan: 24 months (preschool stays active for 2 years)
Average Monthly Revenue: R499 (blended ARPU)
Gross Margin: 70% (after AI/infrastructure costs)

LTV = 24 months × R499 × 70% = R8,384
```

#### Customer Acquisition Cost (CAC)

```
Monthly Marketing Spend: R3,000
Monthly New Customers: 10 (average)

CAC = R3,000 ÷ 10 = R300 per customer
```

#### LTV:CAC Ratio

```
R8,384 ÷ R300 = 28:1

✅ Healthy ratio (>3:1 is good, 28:1 is exceptional)
```

---

### 13.7 Pricing Sensitivity Analysis

#### Scenario: Increase Pro Tier by 20% (R799 → R959)

**Impact:**
- 10% of Pro users downgrade to Basic
- 15% of Pro prospects choose Basic instead
- Revenue change: +12% overall

**Recommendation:** Keep current pricing, focus on feature differentiation

---

#### Scenario: Add "Starter" Tier at R149

**Features:**
- 15 students
- 50 AI lessons/month
- No ads

**Impact:**
- Convert 30% of free users (currently 0%)
- Cannibalize 20% of Basic users
- Revenue change: +8% overall

**Recommendation:** Launch in Month 6 if free-to-Basic conversion is <15%

---

### 13.8 Risk Mitigation Strategies

#### Revenue Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| High churn (>10%) | Medium | High | Improve onboarding, add success manager for Enterprise |
| Low free-to-paid conversion (<10%) | Medium | High | Limit free tier to 3 students, add trial period for Basic |
| Competitor undercuts pricing | Low | Medium | Differentiate on AI quality, add white-label features |
| AI API costs spike (2x) | Medium | Medium | Implement aggressive caching, pre-generate content |

#### Cost Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase scales to $100/month | High | Low | Migrate to self-hosted Postgres if >500 customers |
| AI usage exceeds quota | High | Medium | Enforce hard limits per tier, upsell overages |
| Unexpected legal costs (POPIA compliance) | Low | Medium | Budget R20k for legal review in Year 1 |

---

### 13.9 Investment Requirements

#### Bootstrap (Minimum Viable Product)

- **Capital Needed:** R50,000
- **Timeline:** 3 months
- **Scope:** Core features only (students, teachers, basic AI lessons)
- **Team:** 1 full-stack dev + 1 designer (contract)

#### Funded (Full Vision)

- **Capital Needed:** R500,000
- **Timeline:** 8 months
- **Scope:** All features (DB2 CMS, WhatsApp, TTS, premium templates)
- **Team:** 2 full-time devs + 1 designer + 1 marketer

**Recommendation:** Bootstrap first, raise funding after Month 6 if ARR > R200k

---

### 13.10 Exit Scenarios (5-Year Outlook)

#### Scenario 1: Acquisition by EdTech Company

- **Valuation Multiple:** 5x ARR (typical for SaaS)
- **Year 3 ARR:** R4.8M
- **Exit Value:** R24M (~$1.28M USD)
- **Likelihood:** Medium (if strong product-market fit in SA market)

#### Scenario 2: Expand to Other African Markets

- **Target Markets:** Nigeria, Kenya, Ghana (English-speaking)
- **Potential ARR (Year 5):** R15M (3x South Africa)
- **Exit Value:** R75M (~$4M USD)
- **Likelihood:** High (if proven model in SA)

#### Scenario 3: IPO/Long-Term Independence

- **Year 10 ARR Target:** R50M
- **Net Margin:** 40% (mature SaaS)
- **Annual Profit:** R20M
- **Likelihood:** Low (requires significant scale)

---

**Document Status:** Sections 11, 12, 13 Complete ✅  
**Remaining Sections:** 14 (Competitive Analysis), 15 (Appendices)


## 14. Competitive Analysis

### 14.1 South African EdTech Landscape

#### Direct Competitors

| Company | Product | Target Market | Pricing | Strengths | Weaknesses |
|---------|---------|---------------|---------|-----------|------------|
| **Curro** | Curro Online | K-12 schools | Not public | Established brand, physical infrastructure | No AI features, expensive, not preschool-focused |
| **d6 Communicator** | School communication app | K-12 schools | ~R50/student/month | Strong in SA market, communication focus | No AI, no curriculum tools, basic analytics |
| **Smartschool** | School management | Preschools & primary | R199-R499/month | Local support, established | Outdated UI, no AI, limited mobile experience |
| **Parent24** | Parent community | Parents | Free (ad-supported) | Large user base | Not a school tool, no admin features |

#### Indirect Competitors (International)

| Company | Product | Target Market | Pricing | Strengths | Weaknesses |
|---------|---------|---------------|---------|-----------|------------|
| **ClassDojo** | Classroom communication | K-6 teachers | Free (premium $10/year) | Global scale, 50M+ users | No AI lesson generation, not SA-localized |
| **Brightwheel** | Preschool management | US preschools | $50-$150/month | Comprehensive features | US-only payment methods, no SA support |
| **Kangarootime** | Childcare software | US daycare centers | $99/month + $4/child | All-in-one solution | Expensive for SA market, US-centric |
| **Procare** | Childcare management | US childcare | $79-$199/month | Mature product, 37k+ customers | Legacy UI, no AI, not mobile-first |

---

### 14.2 Competitive Differentiation Matrix

| Feature | EduDash Pro | d6 Communicator | Smartschool | ClassDojo | Brightwheel |
|---------|-------------|-----------------|-------------|-----------|-------------|
| **AI Lesson Generation** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AI Grading** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Multi-Language TTS** | ✅ (EN/ZU/XH/AF) | ❌ | ❌ | ❌ | ❌ |
| **Website Builder** | ✅ (DB2 CMS) | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp Integration** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mobile-First Design** | ✅ | ⚠️ Partial | ❌ | ✅ | ✅ |
| **South African Payment Methods** | ✅ (Stripe + local) | ✅ | ✅ | ❌ | ❌ |
| **POPIA Compliance** | ✅ | ✅ | ✅ | ⚠️ GDPR only | ⚠️ US laws only |
| **Free Tier** | ✅ (5 students) | ❌ | ❌ | ✅ | ❌ |
| **Pricing (Basic)** | R299/month | ~R1,500/month | R499/month | Free | ~R940/month ($50) |
| **Local Support (SA)** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Parent Portal** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Analytics Dashboard** | ✅ (PostHog) | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ✅ |
| **Custom Branding** | ✅ (Enterprise) | ❌ | ❌ | ❌ | ⚠️ Add-on |

**Legend:** ✅ Fully supported | ⚠️ Partial support | ❌ Not available

---

### 14.3 Unique Value Propositions (UVPs)

#### 1. **AI-Powered Curriculum Generation**

**EduDash Pro Advantage:**
- Generate CAPS-aligned (South African Curriculum) lesson plans in seconds
- AI grading saves teachers 5+ hours/week
- Personalized learning paths for each student

**Competitor Gap:** No competitor offers AI lesson generation tailored to South African curriculum standards.

---

#### 2. **Multi-Language Support with TTS**

**EduDash Pro Advantage:**
- Stories and lessons narrated in English, Zulu, Xhosa, Afrikaans
- Promotes mother-tongue education (UNESCO recommendation)
- Accessibility for non-English speaking parents

**Competitor Gap:** All competitors are English-only or have poor multilingual support.

---

#### 3. **Dual-Database Ecosystem (Operations + CMS)**

**EduDash Pro Advantage:**
- DB1: School operations (students, teachers, attendance)
- DB2: Public website builder (drag-and-drop CMS)
- Single platform for internal + external needs

**Competitor Gap:** Competitors require separate tools for school management and website hosting.

---

#### 4. **WhatsApp-First Communication**

**EduDash Pro Advantage:**
- 90%+ of SA parents use WhatsApp daily
- Native WhatsApp Business API integration
- Automated parent notifications via WhatsApp

**Competitor Gap:** Competitors use email/SMS (low engagement in SA market).

---

#### 5. **Affordable Pricing for SA Market**

**EduDash Pro Advantage:**
- Basic tier: R299/month (vs. R1,500+ for d6 Communicator)
- Free tier for individual parents (trial-to-conversion funnel)
- No setup fees or per-student charges

**Competitor Gap:** International competitors priced in USD ($50-$150/month = R940-R2,820).

---

### 14.4 Market Positioning

```
                    High Price
                        │
                        │
    Curro Online ●      │      ● Brightwheel (US)
                        │
    d6 Communicator ●   │
                        │
    Smartschool ●       │
                        │
────────────────────────┼────────────────────────
    Low Features        │        High Features
                        │
                        │   ● EduDash Pro
                        │     (AI-powered, affordable)
                        │
    Parent24 ●          │      ● ClassDojo
    (Free, basic)       │        (Free, global)
                        │
                    Low Price
```

**EduDash Pro Position:** High Features, Mid-to-Low Price (Value Leader)

---

### 14.5 Barriers to Entry (Defensibility)

#### Technical Moats

1. **Dual-Database Architecture**
   - Complex to replicate (requires API Bridge Layer expertise)
   - Data synchronization challenges
   - Estimated replication time: 6-8 months for competitors

2. **AI Training on SA Curriculum**
   - Custom-trained models on CAPS (Curriculum and Assessment Policy Statement)
   - Proprietary prompt engineering for Afrikaans/Zulu/Xhosa
   - Data advantage: unique dataset of SA preschool activities

3. **WhatsApp Business API Integration**
   - Requires Meta partnership approval (3-6 month process)
   - Compliance with WhatsApp Business policies
   - Technical complexity of message templates + interactive buttons

---

#### Operational Moats

1. **Local Market Knowledge**
   - Deep understanding of POPIA compliance requirements
   - Relationships with SA preschool associations
   - Culturally-relevant content (Heritage Day lessons, SA holidays)

2. **Network Effects**
   - Parent referrals within communities
   - Teachers sharing AI-generated lessons (viral loop)
   - School-to-school referrals (principals recommend to peers)

3. **Brand Trust**
   - POPIA-compliant data handling (critical in SA post-POPI Act)
   - Local customer support (Johannesburg/Cape Town offices)
   - Case studies from pilot schools (Young Eagles, etc.)

---

### 14.6 Competitive Response Scenarios

#### Scenario 1: d6 Communicator Adds AI Features

**Likelihood:** Medium (12-18 months)  
**Impact:** High (direct feature parity)

**EduDash Pro Response:**
- Double down on curriculum quality (hire SA teachers as AI trainers)
- Launch "AI Lesson Marketplace" (teachers sell/share lessons)
- Expand to primary schools (Grades 1-3) before d6 does

---

#### Scenario 2: International Player Enters SA Market

**Likelihood:** High (Brightwheel or ClassDojo could localize)  
**Impact:** High (brand recognition, capital advantage)

**EduDash Pro Response:**
- Emphasize local support and POPIA compliance
- Partner with SA government for public preschool contracts
- Build community loyalty (teacher conferences, free training)

---

#### Scenario 3: Free/Open-Source Alternative Emerges

**Likelihood:** Low (complex tech stack)  
**Impact:** Medium (price competition for budget schools)

**EduDash Pro Response:**
- Maintain free tier to compete with open-source
- Focus on support, reliability, and ease-of-use (vs. DIY complexity)
- Offer white-label Enterprise tier (upsell from open-source)

---

### 14.7 Go-to-Market Strategy

#### Phase 1: Early Adopters (Months 1-6)

**Target:** Progressive preschools with 30-100 students

**Tactics:**
- Launch beta with 10 pilot schools (50% discount, feedback loop)
- Content marketing (blog posts on "AI in South African Education")
- Facebook/Instagram ads targeting principals in Gauteng/Western Cape
- Partnerships with preschool franchise networks (e.g., Kool Kidz, Dibidogs)

**Goal:** 39 paying customers, R17k MRR

---

#### Phase 2: Early Majority (Months 7-12)

**Target:** Mainstream preschools, individual parents (free tier)

**Tactics:**
- Google Ads (keywords: "preschool management software South Africa")
- Teacher referral program (R500 credit per referral)
- Case studies + video testimonials from pilot schools
- Attend SA Preschool Association conferences

**Goal:** 110 paying customers, R55k MRR

---

#### Phase 3: Scale (Year 2)

**Target:** National expansion, primary schools (Grades 1-3)

**Tactics:**
- TV/radio ads in Afrikaans (SABC, RSG)
- Government tenders (public preschool contracts)
- Launch website builder (EduSitePro) as separate revenue stream
- Expand to Namibia, Botswana, Zimbabwe

**Goal:** 350 paying customers, R175k MRR

---

### 14.8 SWOT Analysis

#### Strengths
- ✅ AI-powered features (unique in SA market)
- ✅ Mobile-first design (90% of SA users on mobile)
- ✅ Affordable pricing (R299 vs. R1,500+ competitors)
- ✅ Multi-language support (4 official SA languages)
- ✅ POPIA-compliant (critical for SA schools)
- ✅ WhatsApp integration (high engagement)

#### Weaknesses
- ⚠️ New brand (no market recognition vs. d6 Communicator)
- ⚠️ Limited sales team (bootstrap phase)
- ⚠️ Dependency on Anthropic API (vendor lock-in risk)
- ⚠️ No offline mode (requires internet connection)

#### Opportunities
- 🚀 SA government investing in early childhood development (ECD)
- 🚀 Post-COVID shift to digital school management
- 🚀 Growing middle class in SA (more preschool enrollment)
- 🚀 Expansion to other African markets (Nigeria, Kenya)
- 🚀 AI regulation creates barriers for international competitors

#### Threats
- ⚠️ d6 Communicator could acquire smaller competitor and add AI
- ⚠️ Economic downturn in SA (schools cut software budgets)
- ⚠️ AI API costs increase 2x (margin compression)
- ⚠️ Data breach / POPIA violation (reputational damage)
- ⚠️ Load shedding disrupts internet access (South Africa power crisis)

---

### 14.9 Competitive Intelligence Sources

**Monitor Competitors:**
- **Product:** Sign up for competitor trials (d6, Smartschool, ClassDojo)
- **Pricing:** Track pricing changes via WayBack Machine + competitor websites
- **Funding:** Monitor Crunchbase, Tech in Africa, Ventureburn for SA EdTech deals
- **Hiring:** LinkedIn job postings (signals product roadmap)

**Customer Feedback:**
- **Reviews:** Monitor Google Reviews, Facebook reviews of competitors
- **Forums:** SA teacher Facebook groups, Reddit r/southafrica
- **Surveys:** Quarterly surveys to churned customers (why did they leave?)

**Market Trends:**
- **Reports:** Omidyar Network EdTech reports, UNICEF SA education data
- **Events:** Attend EduWeek SA, SAOU (South African Teachers Union) conferences
- **Government:** Monitor DBE (Department of Basic Education) policy changes

---

**Document Status:** Section 14 Complete ✅  
**Next Section:** Section 15 (Final Section)

---

## 15. Appendices

### 15.1 Glossary

| Term | Definition |
|------|------------|
| **API Bridge** | Custom Next.js endpoints that sync data between DB1 (Operations) and DB2 (CMS) |
| **CAPS** | Curriculum and Assessment Policy Statement - South Africa's national curriculum framework |
| **ECD** | Early Childhood Development - education for ages 0-6 years |
| **LTV** | Lifetime Value - total revenue from a customer over their entire relationship |
| **MRR** | Monthly Recurring Revenue - predictable revenue from subscriptions |
| **POPIA** | Protection of Personal Information Act - South Africa's data protection law (similar to GDPR) |
| **RLS** | Row-Level Security - Postgres feature that filters database rows based on user permissions |
| **TTS** | Text-to-Speech - AI technology that converts written text to spoken audio |
| **WCAG** | Web Content Accessibility Guidelines - international accessibility standards |

---

### 15.2 Database Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE 1 (OPERATIONS)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                  ┌──────────────┐            │
│  │organizations │                  │  preschools  │            │
│  │──────────────│                  │──────────────│            │
│  │ id (PK)      │──────────────────│ organization_id (FK) │    │
│  │ name         │                  │ id (PK)      │            │
│  │ tier         │                  │ name         │            │
│  │ created_at   │                  │ address      │            │
│  └──────────────┘                  └──────────────┘            │
│         │                                  │                     │
│         │                                  │                     │
│         ▼                                  ▼                     │
│  ┌──────────────┐                  ┌──────────────┐            │
│  │   profiles   │                  │   students   │            │
│  │──────────────│                  │──────────────│            │
│  │ id (PK)      │                  │ id (PK)      │            │
│  │ organization_id (FK)             │ organization_id (FK)│     │
│  │ preschool_id (FK)│               │ first_name   │            │
│  │ email        │                  │ last_name    │            │
│  │ role         │                  │ date_of_birth│            │
│  └──────────────┘                  │ parent_id (FK)│           │
│         │                           └──────────────┘            │
│         │                                  │                     │
│         │                                  │                     │
│         ▼                                  ▼                     │
│  ┌──────────────┐                  ┌──────────────┐            │
│  │   classes    │                  │  assignments │            │
│  │──────────────│                  │──────────────│            │
│  │ id (PK)      │                  │ id (PK)      │            │
│  │ preschool_id (FK)│               │ class_id (FK)│            │
│  │ teacher_id (FK)  │               │ title        │            │
│  │ grade        │                  │ ai_generated │            │
│  └──────────────┘                  └──────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE 2 (CMS)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                  ┌──────────────┐            │
│  │   centres    │                  │    pages     │            │
│  │──────────────│                  │──────────────│            │
│  │ id (PK)      │──────────────────│ centre_id (FK)│           │
│  │ organization_id (sync from DB1)  │ id (PK)      │           │
│  │ slug         │                  │ slug         │            │
│  │ name         │                  │ title        │            │
│  └──────────────┘                  │ published    │            │
│                                     └──────────────┘            │
│                                            │                     │
│                                            ▼                     │
│                                     ┌──────────────┐            │
│                                     │ page_blocks  │            │
│                                     │──────────────│            │
│                                     │ id (PK)      │            │
│                                     │ page_id (FK) │            │
│                                     │ type         │            │
│                                     │ content (JSON)│           │
│                                     │ order        │            │
│                                     └──────────────┘            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 15.3 API Reference

#### DB1 Operations API

**Base URL:** `https://app.edudashpro.org.za/api`

##### Students

```typescript
// GET /api/students
// List all students in user's organization
Response: {
  students: [
    {
      id: "uuid",
      first_name: "Sarah",
      last_name: "Johnson",
      date_of_birth: "2020-03-15",
      grade: "Grade R",
      parent_id: "uuid",
      photo_url: "https://...",
    }
  ]
}

// POST /api/students
// Create new student
Request: {
  first_name: "Sarah",
  last_name: "Johnson",
  date_of_birth: "2020-03-15",
  grade: "Grade R",
  parent_email: "parent@email.com"
}
Response: { id: "uuid", ... }

// PATCH /api/students/:id
// Update student
Request: { grade: "Grade 1" }
Response: { id: "uuid", ... }

// DELETE /api/students/:id
// Soft delete student (archive)
Response: { success: true }
```

##### AI Lessons

```typescript
// POST /api/ai/generate-lesson
// Generate CAPS-aligned lesson plan
Request: {
  topic: "Shapes and Colors",
  grade: "Grade R",
  duration: 30, // minutes
  language: "en" // or "zu", "xh", "af"
}
Response: {
  lesson: {
    title: "Exploring Shapes and Colors in Nature",
    objectives: ["Identify basic shapes", "Name primary colors"],
    activities: [
      {
        name: "Shape Hunt",
        duration: 10,
        instructions: "...",
        materials: ["paper", "crayons"]
      }
    ],
    assessment: "Observe students identifying shapes during outdoor activity"
  },
  tokens_used: 5234
}

// POST /api/ai/grade-assignment
// AI-powered grading
Request: {
  assignment_id: "uuid",
  student_submissions: [
    { student_id: "uuid", answer: "A circle has no corners" }
  ]
}
Response: {
  grades: [
    {
      student_id: "uuid",
      score: 8,
      max_score: 10,
      feedback: "Good understanding! Try to mention 'round shape' next time."
    }
  ]
}
```

---

#### DB2 CMS API (EduSitePro)

**Base URL:** `https://cms.edudashpro.org.za/api`

##### Pages

```typescript
// GET /api/centres/:slug/pages
// List all pages for a school's website
Response: {
  pages: [
    { id: "uuid", slug: "home", title: "Home", published: true },
    { id: "uuid", slug: "about", title: "About Us", published: true }
  ]
}

// POST /api/pages
// Create new page
Request: {
  centre_id: "uuid",
  slug: "contact",
  title: "Contact Us",
  blocks: [
    { type: "hero", content: { heading: "Get in Touch", image_url: "..." } },
    { type: "form", content: { fields: ["name", "email", "message"] } }
  ]
}
Response: { id: "uuid", ... }
```

---

### 15.4 Sample SQL Queries

#### Find All Students in a Preschool

```sql
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.date_of_birth,
  s.grade,
  p.email AS parent_email,
  c.name AS class_name
FROM students s
LEFT JOIN profiles p ON s.parent_id = p.id
LEFT JOIN classes c ON s.class_id = c.id
WHERE s.preschool_id = 'your-preschool-uuid'
  AND s.deleted_at IS NULL
ORDER BY s.last_name, s.first_name;
```

#### Calculate AI Usage by Organization (Current Month)

```sql
SELECT 
  o.name AS organization_name,
  o.tier,
  COUNT(ai.id) AS total_ai_requests,
  SUM(ai.tokens_used) AS total_tokens,
  SUM(ai.tokens_used) * 0.000003 AS estimated_cost_usd
FROM organizations o
LEFT JOIN ai_usage ai ON o.id = ai.organization_id
WHERE ai.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY o.id, o.name, o.tier
ORDER BY total_tokens DESC;
```

#### Audit Trail: Track Who Modified a Student Record

```sql
SELECT 
  al.action,
  al.created_at,
  p.email AS user_email,
  al.old_values->>'first_name' AS old_first_name,
  al.new_values->>'first_name' AS new_first_name
FROM audit_logs al
JOIN profiles p ON al.user_id = p.id
WHERE al.resource_type = 'student'
  AND al.resource_id = 'student-uuid'
ORDER BY al.created_at DESC;
```

---

### 15.5 Environment Setup Checklist

#### Development Environment

```bash
# 1. Clone repository
git clone https://github.com/edudashpro/edudash-pro.git
cd edudash-pro

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Configure Supabase
supabase login
supabase link --project-ref lvvvjywrmpcqrpvuptdi

# 5. Run database migrations
supabase db push

# 6. Start development server
npm run dev

# 7. Open browser
open http://localhost:3000
```

#### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lvvvjywrmpcqrpvuptdi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # SECRET

# Stripe (use test keys in development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# TTS (optional for development)
ELEVENLABS_API_KEY=your_key_here
```

---

### 15.6 Troubleshooting Guide

#### Issue: RLS Policy Blocks Query

**Symptom:** `permission denied for table students`

**Solution:**
```sql
-- Check current RLS policies
SELECT * FROM pg_policies WHERE tablename = 'students';

-- Verify user's organization_id is set
SELECT current_setting('app.current_organization_id', true);

-- Fix: Set organization context before query
SET LOCAL app.current_organization_id = 'your-org-uuid';
```

---

#### Issue: AI Quota Exceeded

**Symptom:** API returns `429 Too Many Requests`

**Solution:**
```typescript
// Check user's quota
const { data: quota } = await supabase
  .from('ai_usage_summary')
  .select('total_used, tier_limit')
  .eq('organization_id', orgId)
  .eq('month', currentMonth)
  .single();

if (quota.total_used >= quota.tier_limit) {
  // Prompt user to upgrade tier
  router.push('/settings/billing');
}
```

---

#### Issue: Deployment Fails on Vercel

**Symptom:** Build error: `Module not found: Can't resolve '@/components/...'`

**Solution:**
```json
// tsconfig.json - Verify paths are correct
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### 15.7 Roadmap (Next 12 Months)

#### Q1 2025 (Jan-Mar)
- ✅ Launch MVP with 10 pilot schools
- ✅ Core features: Students, Teachers, Classes, Basic AI lessons
- ✅ Mobile-responsive dashboard
- 🎯 Goal: 20 paying customers, R10k MRR

#### Q2 2025 (Apr-Jun)
- 🚀 Launch AI grading (auto-grade assignments)
- 🚀 WhatsApp integration (parent notifications)
- 🚀 Analytics dashboard (PostHog)
- 🚀 Payment integration (Stripe + local methods)
- 🎯 Goal: 50 paying customers, R25k MRR

#### Q3 2025 (Jul-Sep)
- 🚀 Launch DB2 CMS (EduSitePro website builder)
- 🚀 Multi-language TTS (Zulu, Xhosa, Afrikaans)
- 🚀 Parent mobile app (React Native)
- 🚀 Advanced reporting (attendance, progress tracking)
- 🎯 Goal: 100 paying customers, R50k MRR

#### Q4 2025 (Oct-Dec)
- 🚀 White-label Enterprise tier
- 🚀 API access for third-party integrations
- 🚀 Expand to primary schools (Grades 1-3)
- 🚀 Launch in Namibia, Botswana
- 🎯 Goal: 200 paying customers, R100k MRR

---

### 15.8 Success Metrics (KPIs)

| Metric | Target (Month 12) | Measurement |
|--------|-------------------|-------------|
| **Paying Customers** | 110 | Stripe active subscriptions |
| **MRR** | R55k | Monthly recurring revenue |
| **Churn Rate** | <5% | Customers canceling per month |
| **Free-to-Paid Conversion** | >20% | Free users upgrading within 90 days |
| **NPS (Net Promoter Score)** | >50 | Quarterly user surveys |
| **AI Usage** | 500 lessons/month | AI generation API calls |
| **Website Uptime** | 99.9% | Vercel status page |
| **Page Load Time** | <2 seconds | Vercel Analytics |
| **Mobile Traffic** | >70% | PostHog analytics |
| **Support Tickets** | <20/month | Intercom or Zendesk |

---

### 15.9 Team & Roles

#### Bootstrap Phase (Months 1-6)

| Role | Responsibilities | Time Commitment |
|------|------------------|-----------------|
| **Founder/CEO** | Product vision, fundraising, sales | Full-time |
| **Lead Developer** | Frontend + backend, DevOps | Full-time |
| **Designer** | UI/UX, branding, marketing assets | Part-time (20h/week) |
| **QA Tester** | Manual testing, bug reports | Contract (10h/week) |

**Total Team Size:** 2 full-time, 2 part-time

---

#### Growth Phase (Months 7-12)

| Role | Responsibilities | Time Commitment |
|------|------------------|-----------------|
| **Founder/CEO** | Strategy, partnerships, enterprise sales | Full-time |
| **Lead Developer** | Architecture, code review, mentoring | Full-time |
| **Frontend Developer** | React/Next.js features | Full-time (new hire) |
| **Designer** | Product design, marketing | Full-time (convert from part-time) |
| **Customer Success** | Onboarding, support, retention | Full-time (new hire) |
| **Marketing Manager** | Content, ads, SEO | Part-time (20h/week) |

**Total Team Size:** 5 full-time, 1 part-time

---

### 15.10 Legal & Compliance

#### Required Legal Documents

- [x] **Privacy Policy** - POPIA-compliant data handling disclosures
- [x] **Terms of Service** - User agreements, liability limitations
- [x] **Acceptable Use Policy** - Content moderation rules
- [ ] **Data Processing Agreement (DPA)** - For Enterprise customers (POPIA requirement)
- [ ] **Service Level Agreement (SLA)** - Uptime guarantees for Pro/Enterprise
- [ ] **Employee Contracts** - IP assignment, non-compete clauses
- [ ] **Vendor Agreements** - Supabase, Vercel, Stripe, ElevenLabs

#### Regulatory Compliance

| Regulation | Applicability | Actions Required |
|------------|---------------|------------------|
| **POPIA** (SA) | All users in South Africa | RLS policies, data encryption, consent forms, data export tools |
| **GDPR** (EU) | If any EU users | Cookie consent, right to be forgotten, data portability |
| **COPPA** (US) | If targeting children <13 in US | Parental consent, restricted data collection |
| **DBE Regulations** | SA schools | CAPS alignment, safe content filters |

---

### 15.11 Contact & Support

#### EduDash Pro Team

- **Website:** https://edudashpro.org.za
- **Email:** support@edudashpro.org.za
- **WhatsApp:** +27 XX XXX XXXX (Business Account)
- **Twitter/X:** @EduDashPro
- **LinkedIn:** linkedin.com/company/edudash-pro

#### Developer Resources

- **Documentation:** https://docs.edudashpro.org.za
- **API Reference:** https://docs.edudashpro.org.za/api
- **GitHub:** https://github.com/edudashpro/edudash-pro
- **Status Page:** https://status.edudashpro.org.za
- **Community Forum:** https://community.edudashpro.org.za

---

### 15.12 Acknowledgments

**Contributors:**
- AI Architecture: Claude 3.5 Sonnet (Anthropic)
- Database Design: Supabase Community
- UI Inspiration: Vercel, Linear, Tailwind UI
- SA Curriculum Guidance: Young Eagles Preschool

**Technologies:**
- Next.js (Vercel)
- Supabase (PostgreSQL, Auth, Storage)
- Stripe (Payments)
- ElevenLabs (TTS)
- PostHog (Analytics)
- Tailwind CSS (Styling)

---

### 15.13 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-11-20 | Initial architecture document (15 sections) |
| 1.1 | TBD | Update after pilot school feedback |
| 2.0 | TBD | Add DB2 CMS architecture (Phase 2) |

---

### 15.14 License

**EduDash Pro Architecture Document**

Copyright © 2024 EduDash Pro

This document is confidential and proprietary. All rights reserved.

Unauthorized copying, distribution, or use of this document, via any medium, is strictly prohibited without written permission from EduDash Pro.

---

## END OF DOCUMENT

**Total Sections:** 15/15 ✅  
**Total Pages:** ~150 (estimated)  
**Word Count:** ~45,000 words  
**Last Updated:** November 20, 2024

**Status:** COMPLETE - Ready for Implementation

---

**Next Steps:**
1. Review document with stakeholders
2. Create Jira/Linear project board from roadmap
3. Set up development environment (Section 15.5)
4. Begin Phase 1 implementation (Core MVP)
5. Schedule weekly progress reviews

**Document Owner:** Founder/CEO  
**Technical Lead:** Lead Developer  
**Last Reviewed:** 2024-11-20


Can we also initiate promo code feature for our content creaters and marketers for the 50% of on the edudashpro app and a structure on how they are going to get insentives for every subscription taken - and a way on the super admin dashboard to manage this - we also need the look and feel of the admin dashboard to look like the current principal dashboard - the styling and theme - it shouldn't be too different - And our registration form on the Edudash Pro app should detect the child's age and render the correct UI - we should have different UI/UX for different age groups - and render appropriate content - 
