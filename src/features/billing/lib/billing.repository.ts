import type {
  BillingData,
  BillingSubscription,
  BillingUsageMetric,
  BillingUsageSummary,
} from "@/features/billing/types/billing.types";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const INVOICE_COLUMNS =
  "id, company_id, stripe_invoice_id, amount_cents, currency, status, invoice_url, paid_at, period_start, period_end, created_at, updated_at";

function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function buildUsageSummary(
  currentUsage: BillingUsageMetric | null,
  subscription: BillingSubscription | null,
): BillingUsageSummary {
  const minutesUsed = Number(currentUsage?.minutes_used ?? 0);
  const minutesIncluded = subscription?.minutes_included ?? null;
  const minutesRemaining =
    minutesIncluded === null ? null : Math.max(0, minutesIncluded - minutesUsed);
  const usagePercent =
    minutesIncluded && minutesIncluded > 0
      ? Math.min(100, Math.round((minutesUsed / minutesIncluded) * 100))
      : null;

  return {
    minutesUsed,
    minutesIncluded,
    minutesRemaining,
    usagePercent,
    callsAnswered: currentUsage?.calls_answered ?? 0,
    callsMissed: currentUsage?.calls_missed ?? 0,
    periodStart: currentUsage?.period_start ?? null,
    periodEnd: currentUsage?.period_end ?? null,
  };
}

async function getCurrentUsage(companyId: string): Promise<BillingUsageMetric | null> {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthBounds();

  const { data } = await supabase
    .from("usage_metrics")
    .select(
      "id, company_id, period_start, period_end, minutes_used, calls_answered, calls_missed, average_duration_seconds, created_at, updated_at",
    )
    .eq("company_id", companyId)
    .eq("period_start", start)
    .eq("period_end", end)
    .maybeSingle();

  return data;
}

function resolveStripeCustomerId(
  companyStripeCustomerId: string | null,
  subscriptionStripeCustomerId: string | null,
) {
  return subscriptionStripeCustomerId ?? companyStripeCustomerId ?? null;
}

export async function getBillingData(
  companyId: string,
  page = 1,
  pageSize = 10,
): Promise<BillingData | null> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [companyResult, subscriptionResult, currentUsage, invoicesResult] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at",
      )
      .eq("id", companyId)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select(
        "id, company_id, stripe_subscription_id, stripe_customer_id, plan_name, status, minutes_included, current_period_start, current_period_end, created_at, updated_at",
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getCurrentUsage(companyId),
    supabase
      .from("billing_records")
      .select(INVOICE_COLUMNS, { count: "exact" })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  if (!companyResult.data) {
    return null;
  }

  if (invoicesResult.error) {
    throw new Error(invoicesResult.error.message);
  }

  const subscription = subscriptionResult.data;
  const total = invoicesResult.count ?? 0;
  const stripeCustomerId = resolveStripeCustomerId(
    companyResult.data.stripe_customer_id,
    subscription?.stripe_customer_id ?? null,
  );

  return {
    company: companyResult.data,
    subscription,
    usage: buildUsageSummary(currentUsage, subscription),
    invoices: {
      data: invoicesResult.data ?? [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
    stripeCustomerId,
    portalAvailable: isStripeConfigured() && Boolean(stripeCustomerId),
  };
}
