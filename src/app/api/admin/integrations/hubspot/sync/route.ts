import { NextResponse } from "next/server";

import { hubSpotSyncRequestSchema } from "@/features/hubspot/schemas/hubspot-sync.schema";
import { runHubSpotSync } from "@/features/hubspot/lib/sync.service";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { isHubSpotConfigured } from "@/lib/hubspot";
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

  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "HUBSPOT_NOT_CONFIGURED",
        "HubSpot is not configured. Add HUBSPOT_ACCESS_TOKEN to your environment.",
      ),
      { status: 503 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "SUPABASE_ADMIN_NOT_CONFIGURED",
        "SUPABASE_SECRET_KEY is required to run HubSpot sync jobs.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const input = hubSpotSyncRequestSchema.parse(body);
    const result = await runHubSpotSync(input);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot sync failed.";
    return NextResponse.json(createErrorResponse("HUBSPOT_SYNC_FAILED", message), {
      status: 500,
    });
  }
}
