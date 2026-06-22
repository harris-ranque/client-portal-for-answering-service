import type Stripe from "stripe";

import {
  ensureCompanyStripeCustomerId,
  resolveCompanyByStripeCustomerId,
} from "@/features/stripe/lib/company.repository";
import { upsertInvoiceFromStripe } from "@/features/stripe/lib/invoice.repository";
import {
  markSubscriptionCanceled,
  upsertSubscriptionFromStripe,
} from "@/features/stripe/lib/subscription.repository";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncSubscriptionsOptions {
  companyId?: string | null;
}

async function listMappedCompanies(companyId?: string | null) {
  const supabase = createAdminClient();

  let query = supabase
    .from("companies")
    .select("id, stripe_customer_id")
    .not("stripe_customer_id", "is", null);

  if (companyId) {
    query = query.eq("id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function syncStripeSubscriptions(options: SyncSubscriptionsOptions = {}) {
  const stripe = getStripeClient();
  const subscriptions: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;

  do {
    const page = await stripe.subscriptions.list({
      limit: 100,
      starting_after: startingAfter,
      status: "all",
      expand: ["data.items.data.price.product"],
    });

    subscriptions.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);

  let processed = 0;

  for (const subscription of subscriptions) {
    const stripeCustomerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

    if (!stripeCustomerId) {
      continue;
    }

    const companyId = await resolveCompanyByStripeCustomerId(stripeCustomerId);

    if (!companyId) {
      continue;
    }

    if (options.companyId && companyId !== options.companyId) {
      continue;
    }

    if (subscription.status === "canceled") {
      await markSubscriptionCanceled(subscription);
    } else {
      await upsertSubscriptionFromStripe(companyId, subscription);
    }

    processed += 1;
  }

  return {
    fetched: subscriptions.length,
    processed,
  };
}

export async function syncStripeInvoices(options: SyncSubscriptionsOptions = {}) {
  const stripe = getStripeClient();
  const companies = await listMappedCompanies(options.companyId);
  let processed = 0;
  let fetched = 0;

  for (const company of companies) {
    if (!company.stripe_customer_id) {
      continue;
    }

    let startingAfter: string | undefined;

    do {
      const page = await stripe.invoices.list({
        customer: company.stripe_customer_id,
        limit: 100,
        starting_after: startingAfter,
      });

      fetched += page.data.length;

      for (const invoice of page.data) {
        await upsertInvoiceFromStripe(company.id, invoice);
        processed += 1;
      }

      startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
    } while (startingAfter);

    await ensureCompanyStripeCustomerId(company.id, company.stripe_customer_id);
  }

  return {
    fetched,
    processed,
  };
}
