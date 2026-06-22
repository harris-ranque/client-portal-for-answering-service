import type Stripe from "stripe";

import type { Database } from "@/types/database";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];

const SUBSCRIPTION_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "unpaid",
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  paused: "paused",
};

function toIsoDate(unixSeconds: number | null | undefined) {
  if (!unixSeconds) {
    return null;
  }

  return new Date(unixSeconds * 1000).toISOString();
}

function getStripeCustomerId(customer: Stripe.Subscription["customer"] | Stripe.Invoice["customer"]) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getPlanName(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return (
    item?.price?.nickname ??
    (typeof item?.price?.product === "object" && item?.price?.product && "name" in item.price.product
      ? item.price.product.name
      : null) ??
    "Subscription"
  );
}

function getMinutesIncluded(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  const raw =
    subscription.metadata?.minutes_included ??
    item?.price?.metadata?.minutes_included ??
    item?.metadata?.minutes_included;

  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return SUBSCRIPTION_STATUS_MAP[status] ?? "incomplete";
}

export function mapStripeSubscription(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  return {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: getStripeCustomerId(subscription.customer),
    plan_name: getPlanName(subscription),
    status: mapStripeSubscriptionStatus(subscription.status),
    minutes_included: getMinutesIncluded(subscription),
    current_period_start: toIsoDate(item?.current_period_start),
    current_period_end: toIsoDate(item?.current_period_end),
  };
}

export function mapStripeInvoice(invoice: Stripe.Invoice) {
  return {
    amount_cents: invoice.amount_due ?? invoice.total ?? 0,
    currency: invoice.currency ?? "usd",
    status: invoice.status ?? "draft",
    invoice_url: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
    paid_at: toIsoDate(invoice.status_transitions?.paid_at),
    period_start: toIsoDate(invoice.period_start),
    period_end: toIsoDate(invoice.period_end),
  };
}

export function getInvoiceCustomerId(invoice: Stripe.Invoice) {
  return getStripeCustomerId(invoice.customer);
}
