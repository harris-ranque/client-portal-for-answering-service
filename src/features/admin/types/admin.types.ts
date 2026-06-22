import type { Tables } from "@/types/database";
import type { PaginatedResponse } from "@/types";

export type AdminCompany = Tables<"companies">;
export type AdminUser = Tables<"users">;
export type AdminOnboarding = Tables<"onboarding">;
export type AdminBillingRecord = Tables<"billing_records">;
export type AdminSubscription = Tables<"subscriptions">;
export type AdminUsageMetric = Tables<"usage_metrics">;

export interface AdminUserRecord extends AdminUser {
  companyId: string | null;
  companyName: string | null;
}

export interface AdminCompanyListItem extends AdminCompany {
  memberCount: number;
  onboardingStatus: AdminOnboarding["status"] | null;
}

export interface AdminOverviewMetrics {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalCalls: number;
  callsThisMonth: number;
  totalMinutesThisMonth: number;
  onboardingInProgress: number;
  activeSubscriptions: number;
}

export interface AdminBillingRow {
  company: AdminCompany;
  subscription: AdminSubscription | null;
  latestInvoice: AdminBillingRecord | null;
}

export interface AdminOnboardingRow {
  company: AdminCompany;
  onboarding: AdminOnboarding;
}

export interface AdminUsageCompanyRow {
  company: AdminCompany;
  currentUsage: AdminUsageMetric | null;
  subscription: AdminSubscription | null;
}

export type AdminClientsResult = PaginatedResponse<AdminCompanyListItem>;
export type AdminUsersResult = PaginatedResponse<AdminUserRecord>;
