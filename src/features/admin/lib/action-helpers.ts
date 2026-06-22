import { getSessionUser } from "@/features/auth/lib/session";
import { USER_ROLES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AdminActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  resetLink?: string;
};

export async function requireAdminAction() {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." } as const;
  }

  const user = await getSessionUser();

  if (!user) {
    return { error: "You must be signed in." } as const;
  }

  if (user.role !== USER_ROLES.admin) {
    return { error: "Admin access is required." } as const;
  }

  return { user } as const;
}

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
