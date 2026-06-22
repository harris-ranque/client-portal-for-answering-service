"use server";

import { redirect } from "next/navigation";

import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginActionState = {
  error?: string;
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

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Invalid email or password."
          : error.message,
    };
  }

  const redirectTo = getSafeRedirectPath(
    formData.get("redirectTo")?.toString(),
    DEFAULT_AUTH_REDIRECT,
  );

  redirect(redirectTo);
}

export async function redirectIfAuthenticated(redirectTo = DEFAULT_AUTH_REDIRECT) {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectTo);
  }
}
