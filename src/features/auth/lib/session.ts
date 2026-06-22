import { cache } from "react";

import { getAuthUser } from "@/lib/supabase/auth";
import {
  getSessionProfile,
  isUserProfileInactive,
  mapAuthMetadataToSessionUser,
  mapProfileToSessionUser,
} from "@/lib/database/session.repository";
import type { SessionUser, UserRole } from "@/types";

function parseRole(value: unknown): UserRole {
  if (value === "admin" || value === "client") {
    return value;
  }

  return "client";
}

function parseCompanyId(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** @deprecated Use getSessionUser instead. Kept for middleware JWT fallback. */
export function mapAuthUserToSessionUser(
  user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>,
): SessionUser {
  const metadata = user.app_metadata as Record<string, unknown> | undefined;

  return {
    id: user.id,
    email: user.email ?? "",
    role: parseRole(metadata?.role),
    companyId: parseCompanyId(metadata?.company_id),
  };
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const authUser = await getAuthUser();

  if (!authUser?.email) {
    return null;
  }

  if (await isUserProfileInactive(authUser.id)) {
    return null;
  }

  const sessionProfile = await getSessionProfile(authUser.id);

  if (sessionProfile) {
    return mapProfileToSessionUser(sessionProfile.user, sessionProfile.companyId);
  }

  return mapAuthMetadataToSessionUser({
    id: authUser.id,
    email: authUser.email,
    app_metadata: authUser.app_metadata as Record<string, unknown>,
  });
});

export const getSessionUserWithCompany = cache(async () => {
  const authUser = await getAuthUser();

  if (!authUser?.email) {
    return null;
  }

  if (await isUserProfileInactive(authUser.id)) {
    return null;
  }

  const sessionProfile = await getSessionProfile(authUser.id);

  if (!sessionProfile) {
    return {
      session: mapAuthMetadataToSessionUser({
        id: authUser.id,
        email: authUser.email,
        app_metadata: authUser.app_metadata as Record<string, unknown>,
      }),
      company: null,
      profile: null,
    };
  }

  return {
    session: mapProfileToSessionUser(sessionProfile.user, sessionProfile.companyId),
    company: sessionProfile.company,
    profile: sessionProfile.user,
  };
});
