# API Reference

All authenticated endpoints require a valid Supabase session cookie. Admin endpoints require the `admin` role.

## Response format

**Success:**

```json
{
  "success": true,
  "data": { }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

The health and Stripe webhook endpoints use simpler payloads (see below).

---

## Public

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/health` | None | Service status and configuration flags |

**Health response:**

```json
{
  "status": "ok",
  "app": "Client Portal",
  "timestamp": "2025-06-22T12:00:00.000Z",
  "services": {
    "supabase": {
      "configured": true,
      "adminConfigured": true
    }
  }
}
```

---

## Authentication

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/auth/session` | Session | Current user session |
| `POST` | `/api/auth/logout` | Session | Sign out |

---

## Client (company-scoped)

| Method | Path | Auth | Query / body | Description |
| ------ | ---- | ---- | ------------ | ----------- |
| `GET` | `/api/calls` | Client | `page`, `pageSize`, `sortBy`, `sortOrder`, `search`, `from`, `to`, `status`, `direction` | Paginated call logs |
| `GET` | `/api/calls/export` | Client | Same filters as `/api/calls` | CSV download |
| `GET` | `/api/usage` | Client | `months` (6, 12, or 24) | Usage summary and chart data |
| `GET` | `/api/billing` | Client | `page`, `pageSize` | Billing summary and invoices |
| `POST` | `/api/billing/portal` | Client | `{ "returnUrl"?: string }` | Create Stripe Customer Portal session |
| `GET` | `/api/profile` | Client | — | Company profile and contacts |

Client endpoints return `403` when the user has no `company_id` assigned.

---

## Admin

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/admin/metrics` | Admin | Platform overview metrics |

### JustCall integration

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/admin/integrations/justcall` | — | Sync job history |
| `POST` | `/api/admin/integrations/justcall/sync` | `{ "syncType": "calls" \| "contacts" \| "agents" \| "all", "companyId"?: uuid }` | Run sync |
| `POST` | `/api/admin/integrations/justcall/retry` | `{ "syncId": uuid }` | Retry failed job |

### HubSpot integration

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/admin/integrations/hubspot` | — | Sync job history |
| `POST` | `/api/admin/integrations/hubspot/sync` | `{ "syncType": "companies" \| "contacts" \| "onboarding" \| "all", "companyId"?: uuid }` | Run sync |
| `POST` | `/api/admin/integrations/hubspot/retry` | `{ "syncId": uuid }` | Retry failed job |

### Stripe integration

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/api/admin/integrations/stripe` | — | Sync / webhook job history |
| `POST` | `/api/admin/integrations/stripe/sync` | `{ "syncType": "subscriptions" \| "invoices" \| "all", "companyId"?: uuid }` | Manual backfill |
| `POST` | `/api/admin/integrations/stripe/retry` | `{ "syncId": uuid }` | Retry failed manual sync |

Admin integration sync endpoints require `SUPABASE_SERVICE_ROLE_KEY` and the relevant third-party credentials.

---

## Webhooks

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/api/webhooks/stripe` | Stripe signature (`Stripe-Signature` header) | Process subscription and invoice events |

Configure in Stripe Dashboard:

```text
https://<your-domain>/api/webhooks/stripe
```

Recommended events: `customer.subscription.*`, `invoice.created`, `invoice.updated`, `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`.

---

## Client-side API usage

Use `apiClient` from `src/lib/api/client.ts` with route constants from `src/lib/constants` (`API_ROUTES`). Errors throw `ApiClientError` with `code`, `status`, and optional `details`.
