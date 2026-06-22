"use server";

import { revalidatePath } from "next/cache";

import { requireAdminAction, type AdminActionState } from "@/features/admin/lib/action-helpers";
import { recalculateUsageForAllActiveCompanies } from "@/features/usage/lib/aggregate-usage.service";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export async function recalculateUsageAction(): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  if (!isSupabaseAdminConfigured()) {
    return { error: "SUPABASE_SECRET_KEY is required to recalculate usage metrics." };
  }

  try {
    const result = await recalculateUsageForAllActiveCompanies();
    revalidatePath(APP_ROUTES.admin.metrics);
    revalidatePath(APP_ROUTES.admin.integrations);
    return {
      success: true,
      message: `Recalculated usage for ${result.companiesProcessed} active companies.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to recalculate usage metrics.",
    };
  }
}
