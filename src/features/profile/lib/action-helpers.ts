import { getSessionUser } from "@/features/auth/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ProfileActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function requireProfileAccess() {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase is not configured. Add valid credentials to your environment file.",
    } as const;
  }

  const user = await getSessionUser();

  if (!user) {
    return { error: "You must be signed in to update your profile." } as const;
  }

  return { user } as const;
}

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
