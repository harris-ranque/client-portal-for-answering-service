import { NextResponse } from "next/server";

import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      createErrorResponse("SUPABASE_NOT_CONFIGURED", "Supabase is not configured."),
      { status: 503 },
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(createErrorResponse("LOGOUT_FAILED", error.message), { status: 500 });
  }

  return NextResponse.json(createSuccessResponse({ success: true }));
}
