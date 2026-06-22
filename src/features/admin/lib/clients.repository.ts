import type { ClientsQueryInput } from "@/features/admin/schemas/client.schema";
import type { AdminClientsResult, AdminCompany } from "@/features/admin/types/admin.types";
import { createClient } from "@/lib/supabase/server";

const COMPANY_COLUMNS =
  "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at";

export async function getAdminClients(query: ClientsQueryInput): Promise<AdminClientsResult> {
  const supabase = await createClient();
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let builder = supabase.from("companies").select(COMPANY_COLUMNS, { count: "exact" });

  if (query.status === "active") {
    builder = builder.eq("is_active", true);
  } else if (query.status === "inactive") {
    builder = builder.eq("is_active", false);
  }

  if (query.search) {
    const term = `%${query.search}%`;
    builder = builder.or(`name.ilike.${term},email.ilike.${term}`);
  }

  const { data, count, error } = await builder.order("name", { ascending: true }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (data ?? []).map((company) => company.id);

  const [membersResult, onboardingResult] = await Promise.all([
    companyIds.length > 0
      ? supabase.from("company_members").select("company_id").in("company_id", companyIds)
      : Promise.resolve({ data: [] as { company_id: string }[] }),
    companyIds.length > 0
      ? supabase.from("onboarding").select("company_id, status").in("company_id", companyIds)
      : Promise.resolve({ data: [] as { company_id: string; status: string }[] }),
  ]);

  const memberCounts = (membersResult.data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.company_id] = (acc[row.company_id] ?? 0) + 1;
    return acc;
  }, {});

  const onboardingByCompany = Object.fromEntries(
    (onboardingResult.data ?? []).map((row) => [row.company_id, row.status]),
  );

  const total = count ?? 0;

  return {
    data: (data ?? []).map((company) => ({
      ...company,
      memberCount: memberCounts[company.id] ?? 0,
      onboardingStatus: (onboardingByCompany[company.id] as AdminClientsResult["data"][number]["onboardingStatus"]) ?? null,
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getAdminClient(clientId: string): Promise<AdminCompany | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select(COMPANY_COLUMNS)
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createAdminClient(input: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  stripeCustomerId?: string;
  hubspotCompanyId?: string;
  justcallAccountId?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      stripe_customer_id: input.stripeCustomerId ?? null,
      hubspot_company_id: input.hubspotCompanyId ?? null,
      justcall_account_id: input.justcallAccountId ?? null,
      is_active: true,
    })
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("onboarding").insert({
    company_id: data.id,
    status: "not_started",
    current_step: "profile",
    completed_steps: [],
  });

  return data;
}

export async function updateAdminClient(
  clientId: string,
  input: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    stripeCustomerId?: string;
    hubspotCompanyId?: string;
    justcallAccountId?: string;
  },
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      stripe_customer_id: input.stripeCustomerId ?? null,
      hubspot_company_id: input.hubspotCompanyId ?? null,
      justcall_account_id: input.justcallAccountId ?? null,
    })
    .eq("id", clientId)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function setAdminClientActive(clientId: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .update({ is_active: isActive })
    .eq("id", clientId)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
