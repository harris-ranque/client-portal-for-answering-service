import { NextResponse } from "next/server";

import { justCallRetryRequestSchema } from "@/features/justcall/schemas/justcall-sync.schema";
import { retryJustCallSync } from "@/features/justcall/lib/sync.service";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { isJustCallConfigured } from "@/lib/justcall";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function POST(request: Request) {
  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  if (!isJustCallConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "JUSTCALL_NOT_CONFIGURED",
        "JustCall sync requires valid JustCall and Supabase service role credentials.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { syncId } = justCallRetryRequestSchema.parse(body);
    const result = await retryJustCallSync(syncId);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retry JustCall sync.";
    return NextResponse.json(createErrorResponse("JUSTCALL_RETRY_FAILED", message), {
      status: 500,
    });
  }
}
