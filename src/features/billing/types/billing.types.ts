import type { PaginatedResponse } from "@/types";
import type { Tables } from "@/types/database";

export type BillingCompany = Tables<"companies">;
export type BillingSubscription = Tables<"subscriptions">;
export type BillingInvoice = Tables<"billing_records">;
export type BillingUsageMetric = Tables<"usage_metrics">;

export interface BillingUsageSummary {
  minutesUsed: number;
  minutesIncluded: number | null;
  minutesRemaining: number | null;
  usagePercent: number | null;
  callsAnswered: number;
  callsMissed: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface BillingData {
  company: BillingCompany;
  subscription: BillingSubscription | null;
  usage: BillingUsageSummary;
  invoices: PaginatedResponse<BillingInvoice>;
  stripeCustomerId: string | null;
  portalAvailable: boolean;
}

export interface BillingPortalSession {
  url: string;
}
