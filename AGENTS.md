<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Client Portal — Agent Guide

## Project

Production Next.js 15 client portal (App Router, React 19, TypeScript, Tailwind v4, Supabase, Vercel).

## Key docs

- [README.md](README.md) — setup, features, deployment
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — module layout, security, data flow
- [docs/API.md](docs/API.md) — REST API reference
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — common issues

## Conventions

- **Feature modules:** `src/features/<name>/` with components, lib, schemas, types
- **Integrations:** API clients in `src/lib/<service>/`, sync logic in `src/features/<service>/`
- **Supabase:** server client in Route Handlers/Server Components; admin client only for service-role writes
- **Auth:** `requireAuth()` / `requireAdmin()` in pages; `requireApiAuth()` in API routes
- **Client components importing layout:** use `@/components/layout/page-shell` directly, not the layout barrel
- **Tests:** Vitest + Testing Library; `*.test.ts(x)` next to source; run `npm test`
- **Deploy:** `npm run deploy:check` before shipping; Vercel + Supabase Cloud

## Do not

- Expose `SUPABASE_SERVICE_ROLE_KEY` or integration secrets to the client
- Import server-only code into client bundles
- Commit `.env` or real credentials
