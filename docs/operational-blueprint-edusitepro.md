# EduSitePro Operational Blueprint

Last updated: 2025-10-27
Owner: Platform Admin (EduSitePro)

Purpose: A concise, code‑grounded blueprint describing who does what, day‑to‑day operations, flows from lead to live site, notification routing, admin capabilities, code/DB/env mappings, and the prioritized backlog.


## 1) Overview

EduSitePro is a multi‑tenant SaaS for South African ECD centres to launch professional, NCF‑aligned websites and act as a funnel to EduDash Pro. Architecture: Next.js App Router + Supabase (RLS) + Tailwind. Multi‑tenancy is enforced by centre‑scoped queries and RLS; blocks are Zod‑validated; admin operations use service‑role APIs only.

Key references in repo:
- Tenancy + middleware: `src/lib/tenancy.ts`, `src/middleware.ts`
- Block system + validation: `src/lib/blocks.ts`
- Pages APIs: `src/app/api/pages/*`
- Centres Admin UI: `src/app/admin/centres/*`
- Organizations Admin UI: `src/app/admin/organizations/*`
- Lead handling: form `src/components/forms/BulkQuoteForm.tsx`, Edge Function `supabase/functions/submit-lead/index.ts`, server route `src/app/api/lead/route.ts`
- Database schema (reference): `supabase/schema.sql`
- Organizations migration: `supabase/migrations/20251026102900_organizations.sql`


## 2) Personas, Roles, and RACI

Roles (planned RBAC):
- platform_admin (super_admin): Full platform control across centres and orgs
- centre_admin: Owns one or more centres (via org membership); can publish content
- editor: Can edit blocks/pages; publish per policy
- viewer: Read‑only admin access
- sales/CS: Manages leads, statuses, assignments, notes (CRM‑lite)
- ops/devops: Domain verification, deploy hooks, incident response

RACI (R=Responsible, A=Accountable, C=Consulted, I=Informed):
- Lead intake: R(sales), A(sales lead), C(platform_admin), I(ops)
- Lead qualification: R(sales), A(sales lead)
- Centre provisioning: R(platform_admin), A(platform_admin), C(ops)
- Content build: R(editor/centre_admin), A(centre_admin), C(platform_admin)
- Domain verification: R(ops), A(ops), C(platform_admin)
- Publish: R(centre_admin/editor per policy), A(centre_admin)
- Incident response: R(ops), A(platform_admin)

Team sizing:
- MVP (3–5): platform_admin/PM, full‑stack dev, sales/CS; optional ops or contract content editor
- Scale (6–10+): add FE, designer/content, DevOps, QA; optional data/analytics


## 3) Detailed Flows

### Flow 1 — Solo Centre Onboarding

Mermaid
flowchart TD
    A[Lead submitted] -->|Email + DB insert| B[Sales qualifies]
    B -->|Approved| C[Provision centre]
    C --> D[Seed pages/templates]
    D --> E[Content build in Admin]
    E --> F[Domain request/verify]
    F --> G[Publish + cache revalidate]
    G --> H[Handover to centre_admin]

Steps (with code/DB/env):
1. Lead capture
   - UI: `src/components/forms/BulkQuoteForm.tsx`
   - Preferred: Supabase Edge Function `supabase/functions/submit-lead/index.ts` (hCaptcha → insert `leads` → email via Resend)
   - Alternative: Next.js route `src/app/api/lead/route.ts`
   - DB: `leads`, `lead_notes` (see `supabase/schema.sql`)
   - Env: `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`, `RESEND_API_KEY`, `MARKETING_LEADS_EMAIL_TO`
2. Qualification (Sales)
   - Admin Leads UI (to add): list/filter, assign owner, update status
   - DB status transitions: `new` → `contacted` → `qualified` → `converted`/`lost`
3. Provision centre
   - API: `POST /api/admin/centres` → `src/app/api/admin/centres/route.ts` (temporary guard `INTERNAL_ADMIN_TOKEN`)
   - DB: insert `centres`; upsert `centre_domains` default subdomain `{slug}.sites.edusitepro.co.za`
4. Seed content
   - Option A: seed API `src/app/api/admin/seed/route.ts` (creates showcase page + blocks)
   - Option B: instantiate templates from `src/lib/templates/registry.ts`
   - DB: `pages`, `page_blocks`
5. Content build
   - UI: `src/app/admin/pages/page.tsx` (builder)
   - Validation: `src/lib/blocks.ts` enforces Zod schemas before writes (server re‑validates)
6. Domain verify
   - DB: `centre_domains.verification_status` tracks pending/verified/failed
   - Job/API (to add): DNS check or Vercel Domains API
7. Publish & cache
   - API: `PUT /api/pages/[id]/publish` (revalidatePath)
   - Optional: call `vercel_deploy_hook_url` if set on centre
8. Handover
   - Create centre_admin user (RBAC), send access email

Acceptance: Lead notified/stored; centre provisioned with default subdomain; at least one published page visible; domain verification tracked or complete.


### Flow 2 — Multi‑Centre Organization Onboarding

Mermaid
flowchart TD
    A[Bulk lead] --> B[Scope + proposal]
    B --> C[Create organization]
    C --> D[Bulk provision centres]
    D --> E[Centre limit enforcement]
    E --> F[Content rollout]
    F --> G[Go live in waves]

Steps:
1. Create organization
   - UI: `src/app/admin/organizations/new/page.tsx`
   - DB: `organizations` (migration `20251026102900_organizations.sql`)
2. Enforce limits
   - DB trigger `check_centre_limit` on `centres` blocks inserts when exceeding `organizations.max_centres` (except enterprise/unlimited)
3. Bulk provision centres
   - Extend `/api/admin/centres` to accept batch or add bulk route; set `centres.organization_id`
4. Rollout content per centre
   - Seed baseline pages; track progress per centre
5. Go live in waves
   - Domain verify and publish per centre; summary notifications to sales/ops


### Flow 3 — Ongoing Site Management (Builder → Validate → Publish)

- UI: `src/app/admin/pages/page.tsx`
- APIs: `src/app/api/pages/*` (GET list, GET by id, PUT update with blocks, DELETE), `publish` route
- Validation: Zod schemas in `src/lib/blocks.ts`; server validates on save
- Caching: `revalidatePath` on publish; optional deploy hook per centre
- Security: service‑role only in API routes; maintain RLS elsewhere


### Flow 4 — Lead Capture and Follow‑up (CRM‑lite)

- Intake: Edge Function `submit-lead` (preferred) or `POST /api/lead`
- Store: `leads`, optional `lead_notes` (notes, follow‑ups)
- Notify: Resend email to sales; Slack to `#edusitepro-sales` (to add)
- Admin: Leads UI (to add) for assignment, status transitions, notes; SLA 24h first response


### Flow 5 — Custom Domain Verification Lifecycle

States: requested → pending → verified/failed → notify → escalate
- DB: `centre_domains` (domain, is_primary, verification_status, created_at, [optional] last_checked_at, failure_reason)
- Job/API: `/api/admin/domains/verify` (service role) checks DNS or uses Vercel API
- Notify: email centre_admin, Slack ops; if failed >48h, escalate to platform_admin


## 4) Notification Matrix

| Event | Channel(s) | Recipients | When | Env/Config |
|---|---|---|---|---|
| new_lead | Email (Resend), Slack | MARKETING_LEADS_EMAIL_TO, #edusitepro-sales | On submission | RESEND_API_KEY, SLACK_WEBHOOK_SALES |
| lead_overdue_24h | Slack | #edusitepro-sales | Daily check | SLACK_WEBHOOK_SALES |
| centre_created | Slack, Email | #edusitepro-ops, platform_admin | On create | SLACK_WEBHOOK_OPS |
| org_created | Slack | #edusitepro-ops | On create | SLACK_WEBHOOK_OPS |
| page_published | Slack (info) | #edusitepro-ops | On publish | SLACK_WEBHOOK_OPS |
| domain_status_changed | Slack, Email | #edusitepro-ops, centre_admin | On verify/fail | SLACK_WEBHOOK_OPS |
| media_quota_threshold | Slack, Email | #edusitepro-ops, centre_admin | 80%/100% | SLACK_WEBHOOK_OPS |
| system_error | Slack, Sentry | #edusitepro-ops | On error | NEXT_PUBLIC_SENTRY_DSN |

Implementation:
- Add `src/lib/notifications.ts` with `sendEmail`, `sendSlack`, `sendWebhook`, `dispatchEvent`
- Optional outbound webhooks: add `centres.webhook_url`, `organizations.webhook_url`


## 5) Main Admin Capability Matrix (Current vs Gap)

| Capability | UI | API/Server | DB | Status |
|---|---|---|---|---|
| Dashboard | `/admin` | – | – | Ready |
| Centres (list/create/edit) | `/admin/centres/*` | `/api/admin/centres` | `centres`, `centre_domains` | Ready |
| Pages & Builder | `/admin/pages` | `/api/pages/*` | `pages`, `page_blocks` | Ready |
| Publish | Builder/list | `/api/pages/[id]/publish` | `pages.is_published` | Ready |
| Navigation | `/admin/navigation` | `/api/navigation/*` | `navigation_menus` | Present |
| Themes | `/admin/themes` | `/api/themes/*` | `themes` | In progress |
| Media | `/admin/media` | `/api/media/*` | Supabase Storage | Present |
| Settings | `/admin/settings` | – | `centres` (deploy hook fields) | Present |
| Organizations | `/admin/organizations/*` | server actions | `organizations`, `centres.organization_id` | Ready |
| Leads CRM | `/admin/leads` | `/api/leads/*` | `leads`, `lead_notes` | Gap |
| Users/Roles | `/admin/users` | – | `cms_users`, `memberships` | Gap |
| Domains verify UI | centre edit | `/api/admin/domains/verify` | `centre_domains` | Gap |
| Notifications | – | `src/lib/notifications.ts` | – | Gap |
| Audit log | – | – | `audit_log` | Gap |


## 6) Code / DB / Env Mapping by Action

- Create centre
  - UI: `/admin/centres/new`
  - API: `POST /api/admin/centres` (service role; temporary `INTERNAL_ADMIN_TOKEN`)
  - DB: `centres`, `centre_domains`
  - Env: `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_ADMIN_TOKEN`
- List pages
  - UI: `/admin/pages`
  - API: `GET /api/pages?centre_id=...`
  - DB: `pages`
- Save page with blocks
  - UI: builder
  - API: `PUT /api/pages/[id]` (validates with `validateBlockProps`)
  - DB: `pages`, `page_blocks`
- Publish page
  - UI: builder toggle or list bulk action
  - API: `PUT /api/pages/[id]/publish`
  - DB: `pages.is_published`; cache revalidation; optional deploy hook
- Lead submit
  - UI: Bulk quote form `/bulk`
  - API: Edge Function `submit-lead` or `/api/lead`
  - DB: `leads`, `lead_notes`
  - Env: `RESEND_API_KEY`, `HCAPTCHA_SECRET_KEY`, `MARKETING_LEADS_EMAIL_TO`
- Domain verify (proposed)
  - UI: centre edit (status chip)
  - API: `/api/admin/domains/verify`
  - DB: `centre_domains`
  - Env: `VERCEL_TOKEN` (if using Vercel API)

Security invariants:
- Service role only server‑side; never in client
- Always centre‑scope queries and maintain RLS
- Validate block props with Zod before DB writes
- All schema changes via Supabase migrations


## 7) SLAs and Escalations

- Lead first response: within 24h on business days (sales)
- Domain verification: check every 12–24h until verified; escalate after 48h failure
- P0 incident response: within 2h during business hours (ops → platform_admin)

Escalation paths:
- Sales → Sales Lead → Platform Admin
- Ops → DevOps → Platform Admin

Runbooks:
- Domain verification failures
- Publish failures (revalidation/deploy hook)
- Data/RLS violations (audit + rollback)


## 8) Prioritized Backlog (Engineering)

P0 (Now):
- Replace `INTERNAL_ADMIN_TOKEN` with Supabase Auth RBAC; implement `cms_users` + `memberships`; protect admin routes; RLS
- Leads CRM: tables confirmed + Admin screens + status transitions + assignment
- Notifications module: Slack/webhooks `dispatchEvent`; wire new_lead, publish, domain_status_changed

P1 (Next):
- Domain verification automation (job/API + UI)
- Provisioning automation: `vercel_deploy_hook_url` on publish; bulk centre provisioning endpoint
- Error monitoring + analytics: Sentry, PostHog
- Audit logging for admin actions

P2 (Later):
- Storage/usage limits per centre with threshold alerts
- Outbound webhooks per centre/org with signing secret

Each item: include DRI/owner, estimate, risks, dependencies (migrations, envs).


## 9) Acceptance Criteria (for this blueprint)

- Flows documented end‑to‑end with concrete code/DB references
- RACI and staffing guidance included
- Notification matrix covers core events with envs
- Capability matrix lists current vs gaps
- Action → code/DB/env mapping provided
- Backlog prioritized P0/P1/P2
- Aligns with multi‑tenant + RLS + Zod + migration rules


## 10) Assumptions and Open Decisions

Assumptions (to confirm):
- Notifications: email + Slack with channels `#edusitepro-sales` and `#edusitepro-ops`
- Lead SLA: 24h first response
- Org‑level admins will manage multiple centres (future memberships needed)
- Publish triggers revalidation and optional deploy hook; no full redeploy required for every change

Open decisions:
- CRM source of truth (in‑app vs external)
- DNS verification method (Vercel Domains API vs DNS TXT lookup)
- Final RBAC permissions per screen/action


## 11) Environment and Secrets

- Client: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`
- Server/secure: `SUPABASE_SERVICE_ROLE_KEY`, `HCAPTCHA_SECRET_KEY`, `RESEND_API_KEY`, `MARKETING_LEADS_EMAIL_TO`
- Notifications (to add): `SLACK_WEBHOOK_DEFAULT`, `SLACK_WEBHOOK_SALES`, `SLACK_WEBHOOK_OPS`, `WEBHOOK_SIGNING_SECRET`
- Optional: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `VERCEL_TOKEN`

Manage via Vercel project settings (no secrets in client). Keep `.env.example` updated.


## 12) API Summary

- Leads
  - POST: Supabase Edge Function `submit-lead` (preferred) → inserts `leads` and emails via Resend
  - Alt POST: `/api/lead`
- Centres
  - POST `/api/admin/centres` (service role) → upsert centre + primary domain row
  - PATCH `/api/admin/centres` → updates
- Pages
  - GET `/api/pages?centre_id=...` → list
  - POST `/api/pages` → create
  - GET `/api/pages/[id]` → fetch with blocks
  - PUT `/api/pages/[id]` → update metadata + blocks (atomic)
  - DELETE `/api/pages/[id]` → delete
  - PUT `/api/pages/[id]/publish` → toggle publish + revalidate
- Seed (dev/tooling)
  - POST `/api/admin/seed` → create showcase page with blocks

Notes:
- Service role only server‑side; keep RLS strict elsewhere
- Always include `centre_id` in queries where applicable
- Validate blocks with `validateBlockProps` before writes
