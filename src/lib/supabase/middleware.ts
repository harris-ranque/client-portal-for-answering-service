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
import { APP_ROUTES, USER_ROLES } from "@/lib/constants";
import { getHomeRouteForRole } from "@/lib/constants/navigation";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

function copySupabaseCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

function redirectWithSupabaseCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  options?: { clearSearch?: boolean; searchParams?: Record<string, string> },
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;

  if (options?.clearSearch) {
    redirectUrl.search = "";
  }

  if (options?.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      redirectUrl.searchParams.set(key, value);
    }
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);
  copySupabaseCookies(supabaseResponse, redirectResponse);
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfigOrNull();
  const { pathname } = request.nextUrl;

  if (!config) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(config.url, config.publishableKey, {
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

  if (user && isProtectedRoute(pathname)) {
    const sessionUser = mapAuthUserToSessionUser(user);

    if (sessionUser.role === USER_ROLES.admin) {
      return redirectWithSupabaseCookies(request, supabaseResponse, APP_ROUTES.admin.root, {
        clearSearch: true,
      });
    }
  }

  if (!user && (isProtectedRoute(pathname) || isAdminRoute(pathname))) {
    return redirectWithSupabaseCookies(request, supabaseResponse, APP_ROUTES.login, {
      searchParams: { redirectTo: pathname },
    });
  }

  if (user && isAuthOnlyRoute(pathname)) {
    const sessionUser = mapAuthUserToSessionUser(user);

    return redirectWithSupabaseCookies(
      request,
      supabaseResponse,
      getSafeRedirectPath(
        request.nextUrl.searchParams.get("redirectTo"),
        getHomeRouteForRole(sessionUser.role),
      ),
      { clearSearch: true },
    );
  }

  if (user && isAdminRoute(pathname)) {
    const sessionUser = mapAuthUserToSessionUser(user);

    if (sessionUser.role !== USER_ROLES.admin) {
      return redirectWithSupabaseCookies(request, supabaseResponse, APP_ROUTES.dashboard, {
        clearSearch: true,
      });
    }
  }

  return supabaseResponse;
}
