"use server";

import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { mapAuthUserToSessionUser } from "@/features/auth/lib/session";
import {
  forgotPasswordSchema,
  setPasswordSchema,
} from "@/features/auth/schemas/password.schema";
import { APP_ROUTES } from "@/lib/constants";
import { getHomeRouteForRole } from "@/lib/constants/navigation";
import { getAppUrl } from "@/lib/env/app-url";
import { createServerActionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type PasswordActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function forgotPasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured." };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createServerActionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(APP_ROUTES.resetPassword)}`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function setPasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Authentication is not configured." };
  }

  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const fallback = getSafeRedirectPath(
    formData.get("redirectTo")?.toString(),
    APP_ROUTES.dashboard,
  );

  const supabase = await createServerActionClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = user
    ? getHomeRouteForRole(mapAuthUserToSessionUser(user).role)
    : fallback;

  return { redirectTo };
}
