import {
  formatPeriodLabel,
  getCurrentMonthBounds,
} from "@/features/usage/lib/periods";
import type {
  UsageCallsChartPoint,
  UsageData,
  UsageMetricRecord,
  UsageMinutesChartPoint,
  UsageSubscription,
  UsageSummary,
} from "@/features/usage/types/usage.types";
import { findMetricForPeriod } from "@/lib/performance";
import { createClient } from "@/lib/supabase/server";

function buildSummary(
  currentUsage: UsageMetricRecord | null,
  subscription: UsageSubscription | null,
): UsageSummary {
  const minutesUsed = Number(currentUsage?.minutes_used ?? 0);
  const minutesIncluded = subscription?.minutes_included ?? null;
  const minutesRemaining =
    minutesIncluded === null ? null : Math.max(0, minutesIncluded - minutesUsed);
  const usagePercent =
    minutesIncluded && minutesIncluded > 0
      ? Math.min(100, Math.round((minutesUsed / minutesIncluded) * 100))
      : null;
  const callsAnswered = currentUsage?.calls_answered ?? 0;
  const callsMissed = currentUsage?.calls_missed ?? 0;

  return {
    minutesUsed,
    minutesIncluded,
    minutesRemaining,
    usagePercent,
    callsAnswered,
    callsMissed,
    totalCalls: callsAnswered + callsMissed,
    averageDurationSeconds: currentUsage?.average_duration_seconds ?? 0,
    periodStart: currentUsage?.period_start ?? null,
    periodEnd: currentUsage?.period_end ?? null,
  };
}

function buildMinutesChart(history: UsageMetricRecord[]): UsageMinutesChartPoint[] {
  return [...history]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map((metric) => ({
      label: formatPeriodLabel(metric.period_start),
      minutes: Number(metric.minutes_used),
      periodStart: metric.period_start,
    }));
}

function buildCallsChart(history: UsageMetricRecord[]): UsageCallsChartPoint[] {
  return [...history]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map((metric) => ({
      label: formatPeriodLabel(metric.period_start),
      answered: metric.calls_answered,
      missed: metric.calls_missed,
      periodStart: metric.period_start,
    }));
}


export async function getUsageData(companyId: string, months = 12): Promise<UsageData | null> {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthBounds();

  const [subscriptionResult, historyResult] = await Promise.all([
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
      .limit(months),
  ]);

  const history = historyResult.data ?? [];
  const currentUsage = findMetricForPeriod(history, start, end);

  if (!currentUsage && history.length === 0 && !subscriptionResult.data) {
    return {
      companyId,
      subscription: subscriptionResult.data,
      currentUsage,
      history,
      summary: buildSummary(currentUsage, subscriptionResult.data),
      minutesChart: [],
      callsChart: [],
    };
  }

  return {
    companyId,
    subscription: subscriptionResult.data,
    currentUsage,
    history,
    summary: buildSummary(currentUsage, subscriptionResult.data),
    minutesChart: buildMinutesChart(history),
    callsChart: buildCallsChart(history),
  };
}
