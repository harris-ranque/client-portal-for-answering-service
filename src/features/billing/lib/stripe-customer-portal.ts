import type { BillingPortalSession } from "@/features/billing/types/billing.types";
import { getAppUrl } from "@/lib/env/app-url";
import { getStripeClient } from "@/lib/stripe/client";

interface CreateBillingPortalSessionInput {
  stripeCustomerId: string;
  returnUrl?: string;
}

export async function createBillingPortalSession({
  stripeCustomerId,
  returnUrl,
}: CreateBillingPortalSessionInput): Promise<BillingPortalSession> {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl ?? `${getAppUrl()}/billing`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a customer portal URL.");
  }

  return { url: session.url };
}
