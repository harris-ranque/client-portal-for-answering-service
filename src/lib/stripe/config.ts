import { isPlaceholderEnv, serverEnv } from "@/lib/env";

export function getStripeWebhookSecret() {
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || isPlaceholderEnv(webhookSecret)) {
    throw new Error("Stripe webhook secret is not configured.");
  }

  return webhookSecret;
}

export function isStripeWebhookConfigured() {
  const secretKey = serverEnv.STRIPE_SECRET_KEY;
  const webhookSecret = serverEnv.STRIPE_WEBHOOK_SECRET;

  return Boolean(
    secretKey &&
      webhookSecret &&
      !isPlaceholderEnv(secretKey) &&
      !isPlaceholderEnv(webhookSecret),
  );
}
