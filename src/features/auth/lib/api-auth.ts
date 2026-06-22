import { NextResponse } from "next/server";

import { getSessionUser } from "@/features/auth/lib/session";
import { createErrorResponse } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { UserRole } from "@/types";

interface RequireApiAuthOptions {
  role?: UserRole;
}

export async function requireApiAuth(options: RequireApiAuthOptions = {}) {
  if (!isSupabaseConfigured()) {
    return {
      response: NextResponse.json(
        createErrorResponse("SUPABASE_NOT_CONFIGURED", "Supabase is not configured."),
        { status: 503 },
      ),
    } as const;
  }

  const user = await getSessionUser();

  if (!user) {
    return {
      response: NextResponse.json(createErrorResponse("UNAUTHORIZED", "Not authenticated."), {
        status: 401,
      }),
    } as const;
  }

  if (options.role && user.role !== options.role) {
    return {
      response: NextResponse.json(createErrorResponse("FORBIDDEN", "Insufficient permissions."), {
        status: 403,
      }),
    } as const;
  }

  return { user } as const;
}
