import type Stripe from "stripe";

import { getInvoiceCustomerId } from "@/features/stripe/lib/mappers";
import { resolveCompanyByStripeCustomerId } from "@/features/stripe/lib/company.repository";
import { upsertInvoiceFromStripe } from "@/features/stripe/lib/invoice.repository";
import {
  markSubscriptionCanceled,
  upsertSubscriptionFromStripe,
} from "@/features/stripe/lib/subscription.repository";
import type { StripeWebhookEventType } from "@/lib/stripe/types";

export async function handleStripeSubscriptionEvent(
  eventType: StripeWebhookEventType,
  subscription: Stripe.Subscription,
) {
  const stripeCustomerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (!stripeCustomerId) {
    throw new Error("Stripe subscription event is missing customer id.");
  }

  const companyId = await resolveCompanyByStripeCustomerId(stripeCustomerId);

  if (!companyId) {
    return {
      skipped: true,
      reason: `No company mapped to Stripe customer ${stripeCustomerId}.`,
    };
  }

  if (eventType === "customer.subscription.deleted" || subscription.status === "canceled") {
    await markSubscriptionCanceled(subscription);
  } else {
    await upsertSubscriptionFromStripe(companyId, subscription);
  }

  return {
    skipped: false,
    companyId,
    subscriptionId: subscription.id,
  };
}

export async function handleStripeInvoiceEvent(invoice: Stripe.Invoice) {
  const stripeCustomerId = getInvoiceCustomerId(invoice);

  if (!stripeCustomerId) {
    throw new Error("Stripe invoice event is missing customer id.");
  }

  const companyId = await resolveCompanyByStripeCustomerId(stripeCustomerId);

  if (!companyId) {
    return {
      skipped: true,
      reason: `No company mapped to Stripe customer ${stripeCustomerId}.`,
    };
  }

  await upsertInvoiceFromStripe(companyId, invoice);

  return {
    skipped: false,
    companyId,
    invoiceId: invoice.id,
  };
}
