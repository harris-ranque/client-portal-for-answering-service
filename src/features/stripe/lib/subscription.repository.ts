import type Stripe from "stripe";

import { mapStripeSubscription } from "@/features/stripe/lib/mappers";
import { ensureCompanyStripeCustomerId } from "@/features/stripe/lib/company.repository";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertSubscriptionFromStripe(
  companyId: string,
  subscription: Stripe.Subscription,
) {
  const supabase = createAdminClient();
  const mapped = mapStripeSubscription(subscription);

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const payload = {
    company_id: companyId,
    ...mapped,
  };

  if (existing) {
    const { error } = await supabase.from("subscriptions").update(payload).eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("subscriptions").insert(payload);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (mapped.stripe_customer_id) {
    await ensureCompanyStripeCustomerId(companyId, mapped.stripe_customer_id);
  }
}

export async function markSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: subscription.ended_at
        ? new Date(subscription.ended_at * 1000).toISOString()
        : new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(error.message);
  }
}
