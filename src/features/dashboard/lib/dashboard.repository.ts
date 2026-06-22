import type {
  DashboardBillingRecord,
  DashboardChartPoint,
  DashboardData,
  DashboardSubscription,
  DashboardSummary,
  DashboardUsageMetric,
} from "@/features/dashboard/types/dashboard.types";
import { findMetricForPeriod } from "@/lib/performance";
import { createClient } from "@/lib/supabase/server";

function buildSummary(
  currentUsage: DashboardUsageMetric | null,
  subscription: DashboardSubscription | null,
): DashboardSummary {
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
  };
}

function buildChartData(usageHistory: DashboardUsageMetric[]): DashboardChartPoint[] {
  return [...usageHistory]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map((metric) => ({
      label: new Date(metric.period_start).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      minutes: Number(metric.minutes_used),
      periodStart: metric.period_start,
    }));
}

function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function getCurrentUsage(
  companyId: string,
  periodStart: string,
  periodEnd: string,
): Promise<DashboardUsageMetric | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("usage_metrics")
    .select(
      "id, company_id, period_start, period_end, minutes_used, calls_answered, calls_missed, average_duration_seconds, created_at, updated_at",
    )
    .eq("company_id", companyId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  return data;
}

export async function getDashboardData(companyId: string): Promise<DashboardData | null> {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthBounds();

  const [
    companyResult,
    subscriptionResult,
    usageHistoryResult,
    recentCallsResult,
    onboardingResult,
    billingResult,
  ] = await Promise.all([
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
    supabase
      .from("usage_metrics")
      .select(
        "id, company_id, period_start, period_end, minutes_used, calls_answered, calls_missed, average_duration_seconds, created_at, updated_at",
      )
      .eq("company_id", companyId)
      .order("period_start", { ascending: false })
      .limit(6),
    supabase
      .from("call_logs")
      .select(
        "id, company_id, external_id, call_date, caller_name, caller_number, direction, duration_seconds, agent_name, status, recording_url, notes, created_at, updated_at",
      )
      .eq("company_id", companyId)
      .order("call_date", { ascending: false })
      .limit(5),
    supabase
      .from("onboarding")
      .select(
        "id, company_id, status, current_step, completed_steps, hubspot_deal_id, notes, completed_at, created_at, updated_at",
      )
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("billing_records")
      .select(
        "id, company_id, stripe_invoice_id, amount_cents, currency, status, invoice_url, paid_at, period_start, period_end, created_at, updated_at",
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!companyResult.data) {
    return null;
  }

  const usageHistory = usageHistoryResult.data ?? [];
  const currentUsage =
    findMetricForPeriod(usageHistory, start, end) ??
    (await getCurrentUsage(companyId, start, end));
  const subscription = subscriptionResult.data;
  const summary = buildSummary(currentUsage, subscription);

  return {
    company: companyResult.data,
    subscription,
    currentUsage,
    usageHistory,
    recentCalls: recentCallsResult.data ?? [],
    onboarding: onboardingResult.data,
    latestBilling: billingResult.data as DashboardBillingRecord | null,
    summary,
    chartData: buildChartData(usageHistory),
  };
}
