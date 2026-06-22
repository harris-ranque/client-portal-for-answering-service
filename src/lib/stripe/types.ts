export const STRIPE_SYNC_TYPES = ["subscriptions", "invoices", "all"] as const;

export type StripeSyncType = (typeof STRIPE_SYNC_TYPES)[number];

export const STRIPE_WEBHOOK_EVENT_TYPES = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.created",
  "invoice.updated",
  "invoice.finalized",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

export type StripeWebhookEventType = (typeof STRIPE_WEBHOOK_EVENT_TYPES)[number];
