import { NextResponse } from "next/server";

import { justCallSyncRequestSchema } from "@/features/justcall/schemas/justcall-sync.schema";
import { runJustCallSync } from "@/features/justcall/lib/sync.service";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { isJustCallConfigured } from "@/lib/justcall";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { rejectInvalidOrigin } from "@/lib/security/reject-invalid-origin";

export async function POST(request: Request) {
  const originError = rejectInvalidOrigin(request);

  if (originError) {
    return originError;
  }

  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  if (!isJustCallConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "JUSTCALL_NOT_CONFIGURED",
        "JustCall credentials are not configured. Add JUSTCALL_API_KEY and JUSTCALL_API_SECRET.",
      ),
      { status: 503 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "SUPABASE_ADMIN_NOT_CONFIGURED",
        "SUPABASE_SECRET_KEY is required to run JustCall sync jobs.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const input = justCallSyncRequestSchema.parse(body);
    const result = await runJustCallSync(input);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "JustCall sync failed.";
    return NextResponse.json(createErrorResponse("JUSTCALL_SYNC_FAILED", message), {
      status: 500,
    });
  }
}
