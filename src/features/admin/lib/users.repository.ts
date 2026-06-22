import type { UsersQueryInput } from "@/features/admin/schemas/user.schema";
import type { AdminUsersResult, AdminUserRecord } from "@/features/admin/types/admin.types";
import { getAppUrl } from "@/lib/env/app-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const USER_COLUMNS = "id, email, full_name, role, is_active, created_at, updated_at";

export async function getAdminUsers(query: UsersQueryInput): Promise<AdminUsersResult> {
  const supabase = await createClient();
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let builder = supabase.from("users").select(USER_COLUMNS, { count: "exact" });

  if (query.role !== "all") {
    builder = builder.eq("role", query.role);
  }

  if (query.search) {
    const term = `%${query.search}%`;
    builder = builder.or(`email.ilike.${term},full_name.ilike.${term}`);
  }

  const { data, count, error } = await builder.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const userIds = (data ?? []).map((user) => user.id);

  const { data: memberships } =
    userIds.length > 0
      ? await supabase
          .from("company_members")
          .select("user_id, company_id")
          .in("user_id", userIds)
      : { data: [] as { user_id: string; company_id: string }[] };

  const companyIds = [...new Set((memberships ?? []).map((row) => row.company_id))];
  const { data: companies } =
    companyIds.length > 0
      ? await supabase.from("companies").select("id, name").in("id", companyIds)
      : { data: [] as { id: string; name: string }[] };

  const companyNameById = Object.fromEntries((companies ?? []).map((company) => [company.id, company.name]));

  const membershipByUser = Object.fromEntries(
    (memberships ?? []).map((row) => [
      row.user_id,
      {
        companyId: row.company_id,
        companyName: companyNameById[row.company_id] ?? null,
      },
    ]),
  );

  const total = count ?? 0;

  return {
    data: (data ?? []).map((user) => ({
      ...user,
      companyId: membershipByUser[user.id]?.companyId ?? null,
      companyName: membershipByUser[user.id]?.companyName ?? null,
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function inviteAdminUser(input: {
  email: string;
  fullName: string;
  role: AdminUserRecord["role"];
  companyId?: string;
}) {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase service role key is required to invite users.");
  }

  const admin = createAdminClient();

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      data: { full_name: input.fullName },
      redirectTo: `${getAppUrl()}/auth/callback`,
    },
  );

  if (inviteError || !inviteData.user) {
    throw new Error(inviteError?.message ?? "Failed to invite user.");
  }

  const userId = inviteData.user.id;

  const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      role: input.role,
      company_id: input.companyId ?? null,
    },
  });

  if (metadataError) {
    throw new Error(metadataError.message);
  }

  const { error: profileError } = await admin
    .from("users")
    .update({
      full_name: input.fullName,
      role: input.role,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (input.companyId && input.role === "client") {
    const { error: membershipError } = await admin.from("company_members").insert({
      user_id: userId,
      company_id: input.companyId,
      role: "client",
    });

    if (membershipError) {
      throw new Error(membershipError.message);
    }
  }

  return { userId, email: input.email };
}

export async function generateAdminPasswordResetLink(email: string) {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase service role key is required to reset passwords.");
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getAppUrl()}/auth/callback?next=/login`,
    },
  });

  if (error || !data.properties?.action_link) {
    throw new Error(error?.message ?? "Failed to generate password reset link.");
  }

  return data.properties.action_link;
}

export async function setAdminUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", userId)
    .select(USER_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
