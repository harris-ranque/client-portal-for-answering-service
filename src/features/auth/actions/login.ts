"use server";

import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { mapAuthUserToSessionUser } from "@/features/auth/lib/session";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants";
import { getHomeRouteForRole } from "@/lib/constants/navigation";
import { createServerActionClient, createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginActionState = {
  error?: string;
  redirectTo?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Authentication is not configured. Add valid Supabase credentials to your environment file.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      fieldErrors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  const supabase = await createServerActionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message =
      error.message === "Invalid login credentials"
        ? "Invalid email or password."
        : error.message.includes("Database error querying schema")
          ? "Authentication service error. If using local seed users, run `npm run supabase:reset` to refresh auth data."
          : error.message;

    return { error: message };
  }

  const sessionUser = data.user ? mapAuthUserToSessionUser(data.user) : null;
  const redirectTo = getSafeRedirectPath(
    formData.get("redirectTo")?.toString(),
    sessionUser ? getHomeRouteForRole(sessionUser.role) : DEFAULT_AUTH_REDIRECT,
  );

  return { redirectTo };
}

export async function redirectIfAuthenticated(redirectTo?: string) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sessionUser = mapAuthUserToSessionUser(user);
    redirect(redirectTo ?? getHomeRouteForRole(sessionUser.role));
  }
}
