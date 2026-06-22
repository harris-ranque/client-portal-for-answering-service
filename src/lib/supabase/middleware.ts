import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getSafeRedirectPath,
  isAdminRoute,
  isApiRoute,
  isAuthOnlyRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/features/auth/lib/routes";
import { mapAuthUserToSessionUser } from "@/features/auth/lib/session";
import { APP_ROUTES, DEFAULT_AUTH_REDIRECT, USER_ROLES } from "@/lib/constants";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfigOrNull();
  const { pathname } = request.nextUrl;

  if (!config) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicRoute(pathname) || isApiRoute(pathname)) {
    return supabaseResponse;
  }

  if (!user && (isProtectedRoute(pathname) || isAdminRoute(pathname))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = APP_ROUTES.login;
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthOnlyRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getSafeRedirectPath(
      request.nextUrl.searchParams.get("redirectTo"),
      DEFAULT_AUTH_REDIRECT,
    );
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAdminRoute(pathname)) {
    const sessionUser = mapAuthUserToSessionUser(user);

    if (sessionUser.role !== USER_ROLES.admin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = APP_ROUTES.dashboard;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
