import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/lib/routes";
import { mapAuthUserToSessionUser } from "@/features/auth/lib/session";
import { APP_ROUTES } from "@/lib/constants";
import { getHomeRouteForRole } from "@/lib/constants/navigation";
import { getRequestOrigin } from "@/lib/env/app-url";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const fallback = user
        ? getHomeRouteForRole(mapAuthUserToSessionUser(user).role)
        : APP_ROUTES.dashboard;

      const next = getSafeRedirectPath(searchParams.get("next"), fallback);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${APP_ROUTES.login}?error=auth_callback_error`);
}
