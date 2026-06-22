import Stripe from "stripe";

import { clientEnv, isPlaceholderEnv, serverEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  const secretKey = serverEnv.STRIPE_SECRET_KEY;
  const publishableKey = clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return Boolean(
    secretKey &&
      publishableKey &&
      !isPlaceholderEnv(secretKey) &&
      !isPlaceholderEnv(publishableKey),
  );
}

export function getStripeClient() {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(serverEnv.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}
