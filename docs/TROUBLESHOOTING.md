# Troubleshooting

## Authentication

### Redirect loop or immediate logout

- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your Supabase project.
- In Supabase **Authentication → URL Configuration**, set Site URL and Redirect URLs to match `NEXT_PUBLIC_APP_URL` (include `/auth/callback`).
- On Vercel, ensure `NEXT_PUBLIC_APP_URL` is the canonical production URL, not `localhost`.

### "No company assigned" after login

- Client users need a `company_members` row linking their user ID to a company.
- Verify `app_metadata.company_id` on the auth user matches the intended company.
- Re-run seed locally: `npm run supabase:reset`.

### Admin cannot access `/admin`

- User `role` must be `admin` in `users` table and/or `app_metadata.role`.
- Sign out and back in after role changes.

## Supabase

### Build works but data pages are empty

- Placeholder env values (`placeholder_*`) are ignored — replace with real Supabase credentials.
- Check `/api/health` — `supabase.configured` should be `true`.

### RLS permission errors

- Client writes to company data require membership and matching RLS policies.
- Admin-only operations (sync, invites) need `SUPABASE_SERVICE_ROLE_KEY` on the server.

### Migrations out of sync

```bash
npm run supabase:reset          # local
npm run supabase:push           # cloud (after supabase link)
npm run supabase:types          # regenerate TypeScript types
```

## Integrations

### JustCall / HubSpot sync returns 503

- Verify API credentials in environment variables.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set (required for sync writes).
- Map companies via `justcall_account_id` or `hubspot_company_id` before expecting records to link.

### Stripe webhooks fail with 400

- `STRIPE_WEBHOOK_SECRET` must match the endpoint signing secret in Stripe Dashboard.
- Webhook URL must be the production URL: `https://<domain>/api/webhooks/stripe`.
- For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### Stripe Customer Portal unavailable

- Requires `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and a `stripe_customer_id` on the company or subscription.

## Vercel deployment

### Build fails on `npm install`

- Project uses `.npmrc` with `legacy-peer-deps=true` for consistent installs.

### Auth redirects go to wrong domain

- Set `NEXT_PUBLIC_APP_URL` in Vercel environment variables.
- Server-side fallbacks use `VERCEL_URL` when the public URL is unset (preview deployments).

### Environment variables not applied

- `NEXT_PUBLIC_*` variables are inlined at build time — redeploy after changing them.
- Server-only secrets do not need the `NEXT_PUBLIC_` prefix.

## Development

### Type errors after schema changes

```bash
npm run supabase:types
npm run typecheck
```

### Tests fail locally

```bash
npm test
```

Vitest does not require a running Supabase instance for unit and component tests.

### Pre-deploy verification

```bash
npm run deploy:check
```

Runs typecheck, lint, tests, and production build.
