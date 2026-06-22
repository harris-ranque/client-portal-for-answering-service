import { cache } from "react";

import { USER_ROLES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { SessionUser, UserRole } from "@/types";

export type UserProfile = Tables<"users">;
export type CompanyRecord = Tables<"companies">;

export interface SessionProfile {
  user: UserProfile;
  companyId: string | null;
  company: CompanyRecord | null;
}

function parseRole(value: unknown): UserRole {
  if (value === USER_ROLES.admin || value === USER_ROLES.client) {
    return value;
  }

  return USER_ROLES.client;
}

export function mapProfileToSessionUser(
  profile: Pick<UserProfile, "id" | "email" | "role">,
  companyId: string | null,
): SessionUser {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    companyId,
  };
}

export async function getSessionProfileFromDatabase(
  userId: string,
): Promise<SessionProfile | null> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, role, is_active, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    return null;
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const companyId = membership?.company_id ?? null;
  let company: CompanyRecord | null = null;

  if (companyId) {
    const { data: companyData } = await supabase
      .from("companies")
      .select(
        "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at",
      )
      .eq("id", companyId)
      .maybeSingle();

    company = companyData ?? null;
  }

  return {
    user: profile,
    companyId,
    company,
  };
}

export const getSessionProfile = cache(
  async (userId: string): Promise<SessionProfile | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }

    return getSessionProfileFromDatabase(userId);
  },
);

export function mapAuthMetadataToSessionUser(user: {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
}): SessionUser | null {
  if (!user.email) {
    return null;
  }

  const metadata = user.app_metadata;

  return {
    id: user.id,
    email: user.email,
    role: parseRole(metadata?.role),
    companyId: typeof metadata?.company_id === "string" ? metadata.company_id : null,
  };
}
