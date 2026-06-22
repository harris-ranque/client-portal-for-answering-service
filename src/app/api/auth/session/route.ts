import { NextResponse } from "next/server";

import { getSessionUser } from "@/features/auth/lib/session";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      createErrorResponse("SUPABASE_NOT_CONFIGURED", "Supabase is not configured."),
      { status: 503 },
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(createErrorResponse("UNAUTHORIZED", "Not authenticated."), {
      status: 401,
    });
  }

  return NextResponse.json(createSuccessResponse({ user }));
}
