import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/lib/session";
import { APP_ROUTES, DEFAULT_AUTH_REDIRECT, USER_ROLES } from "@/lib/constants";
import type { SessionUser, UserRole } from "@/types";

export async function requireAuth(redirectTo = APP_ROUTES.login): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireRole(
  role: UserRole,
  redirectTo = DEFAULT_AUTH_REDIRECT,
): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(USER_ROLES.admin, APP_ROUTES.dashboard);
}

export async function requireClient(): Promise<SessionUser> {
  return requireRole(USER_ROLES.client, APP_ROUTES.admin.root);
}

export function hasRole(user: SessionUser, role: UserRole) {
  return user.role === role;
}

export function isAdmin(user: SessionUser) {
  return user.role === USER_ROLES.admin;
}

export function isClient(user: SessionUser) {
  return user.role === USER_ROLES.client;
}
