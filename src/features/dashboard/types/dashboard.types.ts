import type { Tables } from "@/types/database";

export type DashboardCompany = Tables<"companies">;
export type DashboardSubscription = Tables<"subscriptions">;
export type DashboardUsageMetric = Tables<"usage_metrics">;
export type DashboardCallLog = Tables<"call_logs">;
export type DashboardOnboarding = Tables<"onboarding">;
export type DashboardBillingRecord = Tables<"billing_records">;

export interface DashboardSummary {
  minutesUsed: number;
  minutesIncluded: number | null;
  minutesRemaining: number | null;
  usagePercent: number | null;
  callsAnswered: number;
  callsMissed: number;
}

export interface DashboardChartPoint {
  label: string;
  minutes: number;
  periodStart: string;
}

export interface DashboardData {
  company: DashboardCompany;
  subscription: DashboardSubscription | null;
  currentUsage: DashboardUsageMetric | null;
  usageHistory: DashboardUsageMetric[];
  recentCalls: DashboardCallLog[];
  onboarding: DashboardOnboarding | null;
  latestBilling: DashboardBillingRecord | null;
  summary: DashboardSummary;
  chartData: DashboardChartPoint[];
}
