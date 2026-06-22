import type { Tables } from "@/types/database";

export type UsageMetricRecord = Tables<"usage_metrics">;
export type UsageSubscription = Tables<"subscriptions">;

export interface UsageSummary {
  minutesUsed: number;
  minutesIncluded: number | null;
  minutesRemaining: number | null;
  usagePercent: number | null;
  callsAnswered: number;
  callsMissed: number;
  totalCalls: number;
  averageDurationSeconds: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface UsageMinutesChartPoint {
  label: string;
  minutes: number;
  periodStart: string;
}

export interface UsageCallsChartPoint {
  label: string;
  answered: number;
  missed: number;
  periodStart: string;
}

export interface UsageData {
  companyId: string;
  subscription: UsageSubscription | null;
  currentUsage: UsageMetricRecord | null;
  history: UsageMetricRecord[];
  summary: UsageSummary;
  minutesChart: UsageMinutesChartPoint[];
  callsChart: UsageCallsChartPoint[];
}
