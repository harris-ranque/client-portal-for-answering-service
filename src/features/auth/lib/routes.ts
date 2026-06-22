import {
  ADMIN_ROUTE_PREFIX,
  AUTH_ONLY_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  PUBLIC_ROUTES,
} from "@/lib/constants";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isPublicRoute(pathname: string) {
  const path = normalizePath(pathname);

  if (PUBLIC_ROUTES.includes(path as (typeof PUBLIC_ROUTES)[number])) {
    return true;
  }

  if (path.startsWith("/api/health")) {
    return true;
  }

  if (path.startsWith("/auth/")) {
    return true;
  }

  return false;
}

export function isAuthOnlyRoute(pathname: string) {
  const path = normalizePath(pathname);
  return AUTH_ONLY_ROUTES.includes(path as (typeof AUTH_ONLY_ROUTES)[number]);
}

export function isProtectedRoute(pathname: string) {
  const path = normalizePath(pathname);

  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isAdminRoute(pathname: string) {
  const path = normalizePath(pathname);
  return path === ADMIN_ROUTE_PREFIX || path.startsWith(`${ADMIN_ROUTE_PREFIX}/`);
}

export function isApiRoute(pathname: string) {
  return normalizePath(pathname).startsWith("/api/");
}

export function getSafeRedirectPath(path: string | null | undefined, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}
