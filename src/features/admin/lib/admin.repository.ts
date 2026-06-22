import type {
  AdminBillingRow,
  AdminOnboardingRow,
  AdminOverviewMetrics,
  AdminUsageCompanyRow,
} from "@/features/admin/types/admin.types";
import { indexByCompanyId, indexLatestByCompanyId } from "@/lib/performance";
import { createClient } from "@/lib/supabase/server";

const SUBSCRIPTION_COLUMNS =
  "id, company_id, stripe_subscription_id, stripe_customer_id, plan_name, status, minutes_included, current_period_start, current_period_end, created_at, updated_at";

const INVOICE_COLUMNS =
  "id, company_id, stripe_invoice_id, amount_cents, currency, status, invoice_url, paid_at, period_start, period_end, created_at, updated_at";

const USAGE_COLUMNS =
  "id, company_id, period_start, period_end, minutes_used, calls_answered, calls_missed, average_duration_seconds, created_at, updated_at";

function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthBounds();
  const monthStartIso = new Date(`${start}T00:00:00.000Z`).toISOString();

  const [
    companiesResult,
    usersResult,
    callsResult,
    callsMonthResult,
    usageResult,
    onboardingResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabase.from("companies").select("id, is_active", { count: "exact" }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("call_logs").select("id", { count: "exact", head: true }),
    supabase
      .from("call_logs")
      .select("id", { count: "exact", head: true })
      .gte("call_date", monthStartIso),
    supabase
      .from("usage_metrics")
      .select("minutes_used")
      .eq("period_start", start)
      .eq("period_end", end),
    supabase
      .from("onboarding")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),
  ]);

  const companies = companiesResult.data ?? [];
  const activeCompanies = companies.filter((company) => company.is_active).length;
  const totalMinutesThisMonth = (usageResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.minutes_used),
    0,
  );

  return {
    totalCompanies: companiesResult.count ?? companies.length,
    activeCompanies,
    totalUsers: usersResult.count ?? 0,
    totalCalls: callsResult.count ?? 0,
    callsThisMonth: callsMonthResult.count ?? 0,
    totalMinutesThisMonth,
    onboardingInProgress: onboardingResult.count ?? 0,
    activeSubscriptions: subscriptionsResult.count ?? 0,
  };
}

export async function getAdminBillingRows(): Promise<AdminBillingRow[]> {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select(
      "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (companies ?? []).map((company) => company.id);

  if (companyIds.length === 0) {
    return [];
  }

  const [subscriptionsResult, invoicesResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS)
      .in("company_id", companyIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_records")
      .select(INVOICE_COLUMNS)
      .in("company_id", companyIds)
      .order("created_at", { ascending: false }),
  ]);

  if (subscriptionsResult.error) {
    throw new Error(subscriptionsResult.error.message);
  }

  if (invoicesResult.error) {
    throw new Error(invoicesResult.error.message);
  }

  const subscriptionByCompany = indexLatestByCompanyId(subscriptionsResult.data ?? []);
  const invoiceByCompany = indexLatestByCompanyId(invoicesResult.data ?? []);

  return (companies ?? []).map((company) => ({
    company,
    subscription: subscriptionByCompany.get(company.id) ?? null,
    latestInvoice: invoiceByCompany.get(company.id) ?? null,
  }));
}

export async function getAdminOnboardingRows(): Promise<AdminOnboardingRow[]> {
  const supabase = await createClient();

  const { data: onboardingRows, error } = await supabase
    .from("onboarding")
    .select(
      "id, company_id, status, current_step, completed_steps, hubspot_deal_id, notes, completed_at, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = [...new Set((onboardingRows ?? []).map((row) => row.company_id))];
  const { data: companies } =
    companyIds.length > 0
      ? await supabase
          .from("companies")
          .select(
            "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at",
          )
          .in("id", companyIds)
      : { data: [] as AdminOnboardingRow["company"][] };

  const companyById = Object.fromEntries((companies ?? []).map((company) => [company.id, company]));

  return (onboardingRows ?? [])
    .map((onboarding) => {
      const company = companyById[onboarding.company_id];

      if (!company) {
        return null;
      }

      return { onboarding, company };
    })
    .filter((row): row is AdminOnboardingRow => row !== null);
}

export async function getAdminUsageRows(): Promise<AdminUsageCompanyRow[]> {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthBounds();

  const { data: companies, error } = await supabase
    .from("companies")
    .select(
      "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at",
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (companies ?? []).map((company) => company.id);

  if (companyIds.length === 0) {
    return [];
  }

  const [usageResult, subscriptionsResult] = await Promise.all([
    supabase
      .from("usage_metrics")
      .select(USAGE_COLUMNS)
      .in("company_id", companyIds)
      .eq("period_start", start)
      .eq("period_end", end),
    supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_COLUMNS)
      .in("company_id", companyIds)
      .order("created_at", { ascending: false }),
  ]);

  if (usageResult.error) {
    throw new Error(usageResult.error.message);
  }

  if (subscriptionsResult.error) {
    throw new Error(subscriptionsResult.error.message);
  }

  const usageByCompany = indexByCompanyId(usageResult.data ?? []);
  const subscriptionByCompany = indexLatestByCompanyId(subscriptionsResult.data ?? []);

  return (companies ?? []).map((company) => ({
    company,
    currentUsage: usageByCompany.get(company.id) ?? null,
    subscription: subscriptionByCompany.get(company.id) ?? null,
  }));
}

export async function getAdminCompanyOptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, is_active, justcall_account_id, hubspot_company_id, stripe_customer_id")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
