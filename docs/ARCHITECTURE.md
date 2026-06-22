# Architecture

## Overview

The Client Portal is a Next.js 15 application using the App Router with a feature-based module layout. Server Components load company-scoped data from Supabase; Route Handlers expose a typed REST API; integrations sync external systems into PostgreSQL with Row Level Security (RLS).

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js (Vercel) │────▶│ Supabase Cloud  │
│  React 19   │     │  App Router + API │     │ Postgres + Auth │
└─────────────┘     └────────┬─────────┘     └─────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         JustCall API    Stripe API    HubSpot API
```

## Feature modules

Each domain lives under `src/features/<name>/`:

| Module | Responsibility |
| ------ | -------------- |
| `auth` | Login, session, route guards, middleware integration |
| `dashboard` | Client overview, stats, recent calls |
| `calls` | Call log listing, filters, CSV export |
| `usage` | Monthly usage charts, history, and call-log aggregation pipeline |
| `billing` | Subscriptions, invoices, Stripe portal |
| `profile` | Company profile and contacts |
| `admin` | Clients, users, cross-company views |
| `justcall` | JustCall sync jobs and admin UI |
| `hubspot` | HubSpot sync jobs and admin UI |
| `stripe` | Stripe webhooks, sync jobs, admin UI |
| `onboarding` | Onboarding status, client progress page, admin management |

Typical module layout:

```
features/<name>/
  components/     # UI (client or server)
  lib/            # Repositories, services, formatters
  schemas/        # Zod validation
  types/          # Feature-specific types
  actions/        # Server actions (where used)
  index.ts        # Barrel exports
```

Shared integration clients live in `src/lib/<service>/` (e.g. `justcall`, `hubspot`, `stripe`). Feature modules orchestrate sync logic and persistence.

## Request flow

### Authenticated page (Server Component)

1. Middleware (`src/middleware.ts`) refreshes the Supabase session cookie.
2. Page calls `requireAuth()` or `requireAdmin()`.
3. Repository functions use `createClient()` (request-cached) to query Supabase.
4. RLS policies enforce company scope for client users; admins bypass via `is_admin()`.

### API route

1. `requireApiAuth({ role? })` validates the session from cookies.
2. Zod schemas validate query/body input.
3. Repository or service layer performs the operation.
4. Response uses `{ success: true, data }` or `{ success: false, error: { code, message } }`.

### Integration sync / webhook

1. Admin sync: authenticated admin POST → secret-key Supabase writes.
2. Stripe webhook: signature verification → idempotent `stripe_sync` record → upsert billing data.

## Data model (high level)

```
companies ──┬── company_members ── users
            ├── call_logs
            ├── usage_metrics
            ├── subscriptions
            ├── billing_records
            ├── company_contacts
            ├── onboarding
            └── (external IDs: stripe_customer_id, hubspot_company_id, justcall_account_id)

justcall_sync / hubspot_sync / stripe_sync — integration job history
audit_logs — admin audit trail
```

## Supabase clients

| Client | File | When to use |
| ------ | ---- | ----------- |
| Browser | `src/lib/supabase/client.ts` | Client Components |
| Server | `src/lib/supabase/server.ts` | Server Components, Route Handlers (RLS applies) |
| Admin | `src/lib/supabase/admin.ts` | Secret-key writes (sync, invites) — never expose to client |
| Middleware | `src/lib/supabase/middleware.ts` | Session refresh on navigation |

## Security model

- **Authentication:** Supabase Auth with HTTP-only cookies via `@supabase/ssr`.
- **Authorization:** System Admin (`admin` role) vs Client User (`client` role). System admins use `/admin/*` only; client users use the client portal routes only.
- **Data isolation:** PostgreSQL RLS on all client-company tables; client users restricted to `user_company_ids()`.
- **Secrets:** Supabase secret key, Stripe, JustCall, and HubSpot keys are server-only (`src/lib/env.ts`).
- **Webhooks:** Stripe events verified with `STRIPE_WEBHOOK_SECRET` before processing.
- **CSRF posture:** Cookie-authenticated mutating Route Handlers validate `Origin` / `Referer` against `getAppUrl()` (plus localhost and `VERCEL_URL` in preview). Server Actions inherit Next.js CSRF protections; no double-submit token is required for JSON APIs when origin validation passes.

## Usage metrics pipeline

`usage_metrics` rows are aggregated from `call_logs` by `aggregateUsageForCompany()`:

- Triggered automatically after JustCall call sync for affected companies
- Can be recalculated manually from **Admin → Metrics → Recalculate usage**
- Upserts on `(company_id, period_start, period_end)` via the Supabase secret key

Metrics include minutes used, answered/missed call counts, and average duration for the billing period.

## Audit logging

Administrative mutations write to `audit_logs` via `writeAuditLog()` (secret-key insert):

- Client create/update/deactivate
- User invite, password reset link generation, activate/deactivate
- Admin onboarding updates

Admins can review recent entries at **Admin → Audit Log**.

## Client onboarding

Clients view read-only onboarding progress at `/onboarding` (status, checklist, current step, notes). Admins manage records at `/admin/onboarding` with inline edits and audit trail entries.

## Performance patterns

- React `cache()` on `createClient()` — one Supabase client per request.
- Batched admin queries — subscriptions/invoices/usage fetched in bulk.
- Lazy-loaded Recharts via `next/dynamic` in `src/components/charts/lazy-charts.tsx`.
- `loading.tsx` route fallbacks for streaming UI.
- Composite DB indexes on hot lookup paths (see `20250622150000_performance_indexes.sql`).

## Environment resolution

- **Client bundle:** `NEXT_PUBLIC_*` variables validated in `src/lib/env.ts`.
- **Server redirects:** `getAppUrl()` and `getRequestOrigin()` in `src/lib/env/app-url.ts` support Vercel deployments.
