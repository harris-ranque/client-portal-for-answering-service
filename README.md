# Client Portal

Production-ready client portal for an answering service business. Customers view calls, usage, billing, and profile data. Administrators manage clients, integrations, and platform configuration.

## Documentation

| Guide | Description |
| ----- | ----------- |
| [Architecture](docs/ARCHITECTURE.md) | System design, feature modules, security, data flow |
| [API Reference](docs/API.md) | REST endpoints, auth requirements, request/response format |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues for auth, Supabase, integrations, and Vercel |

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Route Handlers, Supabase, PostgreSQL with Row Level Security
- **Auth:** Supabase Auth with role-based access control
- **Integrations:** JustCall, Stripe Billing Portal, HubSpot
- **Deployment:** Vercel

## Prerequisites

- Node.js 20+
- npm 10+
- [Docker](https://docs.docker.com/get-docker/) (for local Supabase via Supabase CLI)
- Supabase project (cloud) or local Supabase stack

## Getting Started

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. **Option A — Local Supabase (recommended for development)**

```bash
npm run supabase:start
npm run supabase:status
```

Update `.env.local` with the local API URL and keys from `supabase status`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key-from-supabase-status>
SUPABASE_SECRET_KEY=<secret-key-from-supabase-status>
```

Use the `PUBLISHABLE_KEY` and `SECRET_KEY` values from `supabase status` (or `npm run supabase:status`). Legacy JWT `ANON_KEY` / `SERVICE_ROLE_KEY` env names are still accepted as fallbacks.

4. **Option B — Supabase Cloud**

Create a project at [supabase.com](https://supabase.com), then set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
SUPABASE_SECRET_KEY=<your-secret-key>
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

Check integration status at [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Environment variables

Copy `.env.example` to `.env.local` for local development. See [Deployment (Vercel)](#deployment-vercel) for production values.

| Variable | Scope | Required | Description |
| -------- | ----- | -------- | ----------- |
| `NEXT_PUBLIC_APP_URL` | Client | Yes | Canonical app URL |
| `NEXT_PUBLIC_APP_NAME` | Client | Yes | Display name in UI and metadata |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Yes* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client | Yes* | Supabase publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Server | Yes* | Admin invites, integration sync writes (`sb_secret_...`) |
| `STRIPE_SECRET_KEY` | Server | Billing | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Server | Billing | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Billing | Stripe publishable key |
| `JUSTCALL_API_KEY` | Server | JustCall | JustCall API key |
| `JUSTCALL_API_SECRET` | Server | JustCall | JustCall API secret |
| `HUBSPOT_ACCESS_TOKEN` | Server | HubSpot | HubSpot private app token |

\*Required for auth and database features. Placeholder values allow build-only mode without a live Supabase project.

## Scripts

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `npm run dev`             | Start development server                |
| `npm run build`           | Production build                        |
| `npm run start`           | Start production server                 |
| `npm run lint`            | Run ESLint                              |
| `npm run lint:fix`        | Fix ESLint issues                       |
| `npm run typecheck`       | Run TypeScript compiler                 |
| `npm run format`          | Format code with Prettier               |
| `npm run format:check`    | Check code formatting                   |
| `npm run supabase:start`  | Start local Supabase stack              |
| `npm run supabase:stop`   | Stop local Supabase stack               |
| `npm run supabase:status` | Show local Supabase URLs and keys       |
| `npm run supabase:reset`  | Reset local database                    |
| `npm run supabase:push`   | Push migrations to linked Supabase cloud project |
| `npm run supabase:types`  | Generate TypeScript types from local DB |
| `npm test`                | Run Vitest test suite                   |
| `npm run deploy:check`    | Typecheck, lint, test, and build        |

## Project Structure

Feature-based architecture:

```
src/
  app/              # Next.js App Router pages and API routes
  features/
    admin/          # Admin panel
    auth/           # Authentication
    billing/        # Billing and subscriptions
    calls/          # Call logs
    dashboard/      # Client dashboard
    hubspot/        # HubSpot sync
    justcall/       # JustCall sync
    onboarding/     # Onboarding status
    profile/        # Company profile and contacts
    stripe/         # Stripe webhooks and sync
    usage/          # Usage tracking
  components/
    charts/         # Lazy-loaded chart wrappers
    feedback/       # Loading, empty, and error states
    layout/         # Portal shell, sidebar, header, page primitives
    ui/             # shadcn/ui components
  hooks/            # Shared React hooks
  lib/
    api/            # API client and response helpers
    constants/      # Routes, roles, and app constants
    database/       # Database repositories and query helpers
    env/            # App URL helpers for production
    env.ts          # Environment variable validation
    performance/    # Query batching helpers
    supabase/       # Supabase browser, server, admin, and middleware clients
    justcall/       # JustCall API client
    hubspot/        # HubSpot API client
    stripe/         # Stripe SDK client
    utils.ts        # Utility functions
  providers/        # React context providers
  schemas/          # Zod validation schemas
  services/         # External service integrations
  types/            # Shared TypeScript types (incl. generated database types)
supabase/
  config.toml       # Local Supabase configuration
  migrations/       # SQL migrations
```

## Supabase

The app uses `@supabase/ssr` for cookie-based auth sessions across Server Components, Route Handlers, and Middleware.

| Client     | Location                | Use case                             |
| ---------- | ----------------------- | ------------------------------------ |
| Browser    | `createBrowserClient()` | Client Components                    |
| Server     | `createServerClient()`  | Server Components, Route Handlers    |
| Admin      | `createAdminClient()`   | Server-only privileged operations    |
| Middleware | `updateSession()`       | Refresh auth session on each request |

Placeholder credentials in `.env` allow the app to build and run without a live Supabase project. Real credentials are required before auth or database features will work.

## Authentication

Email/password authentication is powered by Supabase Auth.

| Route               | Description                         |
| ------------------- | ----------------------------------- |
| `/login`            | Sign in page                        |
| `/dashboard`        | Protected client area               |
| `/admin`            | Admin-only area                     |
| `/auth/callback`    | OAuth / email confirmation callback |
| `/api/auth/session` | Current session (GET)               |
| `/api/auth/logout`  | Sign out (POST)                     |

### Roles

Roles are stored on the `users` table and synced from Supabase `app_metadata` on sign-in:

```json
{
  "role": "admin",
  "company_id": "uuid"
}
```

Create users in the Supabase dashboard (Authentication → Users) and set `app_metadata` for role assignment during development. When using local seed data (`npm run supabase:reset`), these test accounts are available:

| Email                      | Password       | Role                            |
| -------------------------- | -------------- | ------------------------------- |
| `admin@clientportal.local` | `Password123!` | admin                           |
| `client@acme.example.com`  | `Password123!` | client (Acme Answering Clients) |

## Database

PostgreSQL schema is managed with Supabase migrations in `supabase/migrations/`.

### Tables

| Table             | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `users`           | Application profiles linked to `auth.users` |
| `companies`       | Client organizations                        |
| `company_members` | User-to-company membership and roles        |
| `company_contacts`| Company contact directory for clients       |
| `call_logs`       | Call history synced from JustCall           |
| `usage_metrics`   | Monthly usage aggregates per company        |
| `subscriptions`   | Stripe subscription state                   |
| `billing_records` | Invoice and payment records                 |
| `onboarding`      | Client onboarding progress                  |
| `hubspot_sync`    | HubSpot sync mappings and status            |
| `justcall_sync`   | JustCall sync job history                   |
| `stripe_sync`     | Stripe webhook and sync job history         |
| `audit_logs`      | Administrative audit trail                  |

### Row Level Security

- **Admins** can access all records.
- **Clients** can only read data for companies they belong to.
- **Clients** can update their company profile and manage contacts for their company.
- Integration tables (`hubspot_sync`, `justcall_sync`, `stripe_sync`) and most write operations are admin-only.

### Local database commands

```bash
npm run supabase:start    # Start local stack
npm run supabase:reset    # Apply migrations + seed data
npm run supabase:types    # Regenerate src/types/database.ts
```

## UI Layout

Authenticated routes use a shared portal shell with:

- Collapsible sidebar (desktop) and slide-out sheet (mobile)
- Role-aware navigation — clients see portal sections; admins also see administration tools
- Header with page title, theme toggle, and user menu
- Dark mode via `next-themes`

## Dashboard

The client dashboard (`/dashboard`) loads company-scoped data from Supabase:

- Greeting and company details
- Minutes used, remaining, and usage progress
- Current subscription and billing status
- Monthly usage bar chart (last 6 periods)
- Recent calls table with quick link to full call logs

## Call Logs

The call logs page (`/calls`) supports:

- Search across caller name, number, agent, and notes
- Date range, status, and direction filters
- Sortable columns with URL-based state
- Pagination (25 per page by default)
- CSV export via `GET /api/calls/export`

## Usage

The usage page (`/usage`) displays:

- Current month: minutes, calls answered, missed calls, average duration
- Plan allowance with usage progress bar
- Minutes trend chart (configurable 6/12/24 months)
- Call volume chart (answered vs missed)
- Monthly history table
- API: `GET /api/usage?months=12`

## Billing

The billing page (`/billing`) displays:

- Current plan with subscription status and billing period
- Payment status from the latest invoice
- Current usage summary with link to `/usage`
- Paginated invoice history with amounts, status, and invoice links
- **Manage billing** button opens the Stripe Customer Portal (when Stripe is configured and a customer is linked)
- API: `GET /api/billing`, `POST /api/billing/portal`

## Profile

The profile page (`/profile`) supports:

- Account name updates (sign-in email is read-only)
- Company profile: business name, email, phone, address
- Contact management: add, edit, delete, and mark primary contact
- API: `GET /api/profile`

Profile updates use server actions with RLS-scoped Supabase writes.

## Admin Panel

The admin area (`/admin`) is restricted to users with the `admin` role.

| Route | Purpose |
| ----- | ------- |
| `/admin` | Overview metrics dashboard |
| `/admin/clients` | Create, edit, and deactivate client companies |
| `/admin/users` | Invite users, reset passwords, activate/deactivate accounts |
| `/admin/calls` | Cross-company call logs with company filter |
| `/admin/billing` | Subscriptions and invoice status by company |
| `/admin/onboarding` | Onboarding progress across clients |
| `/admin/metrics` | Platform-wide usage for the current period |
| `/admin/integrations` | Connection status for Supabase, Stripe, JustCall, HubSpot |

API: `GET /api/admin/metrics`

User invites and password resets require `SUPABASE_SECRET_KEY`.

## JustCall Integration

Reusable service layer in `src/lib/justcall/` and sync workflows in `src/features/justcall/`.

- API client with pagination and automatic retry on HTTP 429
- Sync types: `calls`, `contacts`, `agents`, `all`
- Calls upserted into `call_logs` by `(company_id, external_id)`
- Contacts upserted into `company_contacts`
- Agent metadata captured in sync job metadata
- Sync history stored in `justcall_sync` with retry support for failed jobs
- Admin UI: `/admin/integrations`
- Map companies using `companies.justcall_account_id` (JustCall line number)
- API:
  - `GET /api/admin/integrations/justcall`
  - `POST /api/admin/integrations/justcall/sync`
  - `POST /api/admin/integrations/justcall/retry`

Requires `JUSTCALL_API_KEY`, `JUSTCALL_API_SECRET`, and `SUPABASE_SECRET_KEY`.

## HubSpot Integration

Reusable service layer in `src/lib/hubspot/` and sync workflows in `src/features/hubspot/`.

- API client with cursor pagination and retry on HTTP 429
- Sync types: `companies`, `contacts`, `onboarding`, `all`
- Companies upserted with `hubspot_company_id` mapping
- Contacts synced to `company_contacts` via HubSpot company associations
- Deals update `onboarding` status, step, and `hubspot_deal_id`
- Entity mappings and sync job history stored in `hubspot_sync`
- Admin UI: `/admin/integrations`
- API:
  - `GET /api/admin/integrations/hubspot`
  - `POST /api/admin/integrations/hubspot/sync`
  - `POST /api/admin/integrations/hubspot/retry`

Requires `HUBSPOT_ACCESS_TOKEN` and `SUPABASE_SECRET_KEY`.

## Stripe Integration

Webhook processing and manual sync workflows in `src/features/stripe/`.

- Webhook endpoint with signature verification at `POST /api/webhooks/stripe`
- Handled events: subscription created/updated/deleted, invoice created/updated/finalized/paid/payment_failed
- Subscriptions upserted into `subscriptions` by `stripe_subscription_id`
- Invoices upserted into `billing_records` by `stripe_invoice_id`
- Companies mapped via `companies.stripe_customer_id`
- Sync job and webhook history stored in `stripe_sync` with idempotent `stripe_event_id`
- Admin UI: `/admin/integrations`
- Manual sync types: `subscriptions`, `invoices`, `all`
- API:
  - `GET /api/admin/integrations/stripe`
  - `POST /api/admin/integrations/stripe/sync`
  - `POST /api/admin/integrations/stripe/retry`

Requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Testing

Vitest powers unit, integration, and component tests.

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # coverage report in coverage/
```

### Test layout

| Type | Examples |
| ---- | -------- |
| Unit | route guards, formatters, CSV export, Stripe/HubSpot mappers, Zod schemas |
| Integration | `GET /api/health`, Stripe webhook handlers with mocked repositories |
| Component | billing plan card and invoice link rendering |

Tests live next to source files as `*.test.ts` / `*.test.tsx` under `src/`.

## Performance

Optimizations applied across data fetching, bundling, and rendering:

- **Batched admin queries** — billing and usage admin views fetch subscriptions, invoices, and usage metrics in bulk instead of per-company N+1 loops
- **Request-scoped Supabase client** — `createClient()` is wrapped with React `cache()` to dedupe clients per request
- **Derived usage metrics** — dashboard and usage pages reuse history rows for the current billing period when available
- **Lazy chart bundles** — Recharts components load on demand via `next/dynamic` with skeleton fallbacks
- **Package import optimization** — `lucide-react` and `recharts` tree-shaking via `optimizePackageImports`
- **Route loading UI** — `loading.tsx` for dashboard, usage, calls, and admin routes
- **Database indexes** — composite indexes on billing, subscriptions, and usage period lookups
- **Health endpoint caching** — `Cache-Control` with short CDN TTL for `/api/health`

Apply the performance migration with `npm run supabase:reset` or by running migrations locally.

## Deployment (Vercel)

The app is configured for [Vercel](https://vercel.com) deployment with `vercel.json`, production URL helpers, and a pre-deploy check script.

### 1. Prepare Supabase Cloud

1. Create a project at [supabase.com](https://supabase.com).
2. Link and push migrations from your machine:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run supabase:push
```

3. In **Supabase → Authentication → URL Configuration**, set:
   - **Site URL:** `https://<your-vercel-domain>`
   - **Redirect URLs:** `https://<your-vercel-domain>/auth/callback`

4. Copy the project **URL**, **publishable key**, and **secret key** for Vercel environment variables.

### 2. Deploy to Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com/new), import the repository.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables for **Production** (and Preview if needed):

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL, e.g. `https://portal.example.com` |
| `NEXT_PUBLIC_APP_NAME` | Yes | Display name |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Yes | Server-only; required for admin invites and sync jobs |
| `STRIPE_SECRET_KEY` | If using billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | If using billing | From Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If using billing | Stripe publishable key |
| `JUSTCALL_API_KEY` | If using JustCall | Integration credentials |
| `JUSTCALL_API_SECRET` | If using JustCall | Integration credentials |
| `HUBSPOT_ACCESS_TOKEN` | If using HubSpot | Private app token |

5. Deploy. Vercel runs `npm run build` automatically.

Run locally before deploying:

```bash
npm run deploy:check
```

### 3. Post-deploy configuration

**Stripe webhooks** — In the Stripe Dashboard, add an endpoint:

```text
https://<your-vercel-domain>/api/webhooks/stripe
```

Subscribe to subscription and invoice events, then copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

**Health check** — Verify the deployment:

```text
https://<your-vercel-domain>/api/health
```

**Custom domain** — Add your domain in Vercel → Project → Settings → Domains, then update:
- `NEXT_PUBLIC_APP_URL` in Vercel env vars
- Supabase auth Site URL and redirect URLs

### Vercel notes

- `vercel.json` sets the default region to `iad1` (US East).
- `.npmrc` enables `legacy-peer-deps` for consistent installs on Vercel.
- Auth callbacks, user invites, and Stripe portal return URLs use `getAppUrl()` / `getRequestOrigin()` so redirects work behind Vercel's proxy.
- Preview deployments: set `NEXT_PUBLIC_APP_URL` per environment or rely on `VERCEL_URL` fallback for server-side redirects.

## Development Milestones

1. ~~Project initialization~~
2. ~~Folder architecture~~
3. ~~Supabase setup~~
4. ~~Authentication~~
5. ~~Database schema~~
6. ~~UI layout~~
7. ~~Dashboard~~
8. ~~Call logs~~
9. ~~Usage tracking~~
10. ~~Billing~~
11. ~~Profile~~
12. ~~Admin panel~~
13. ~~JustCall integration~~
14. ~~HubSpot integration~~
15. ~~Stripe integration~~
16. ~~Testing~~
17. ~~Performance optimization~~
18. ~~Deployment~~
19. ~~Documentation~~

## Post-launch hardening

After the core milestones, the following spec gaps were closed:

- **Usage aggregation** — `usage_metrics` is populated from `call_logs` after JustCall sync and via admin recalculate
- **Client onboarding page** — `/onboarding` shows status, checklist, and notes
- **Audit logging** — admin actions write to `audit_logs`; review at `/admin/audit`
- **Admin onboarding edits** — inline updates with audit trail
- **Origin validation** — CSRF hardening on mutating API routes
- **Error/loading UX** — route error boundaries, loading fallbacks, and `ErrorState` on key pages

## License

Private — All rights reserved.
