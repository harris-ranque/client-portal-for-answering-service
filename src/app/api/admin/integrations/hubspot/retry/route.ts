import { NextResponse } from "next/server";

import { hubSpotRetryRequestSchema } from "@/features/hubspot/schemas/hubspot-sync.schema";
import { retryHubSpotSync } from "@/features/hubspot/lib/sync.service";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { isHubSpotConfigured } from "@/lib/hubspot";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function POST(request: Request) {
  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  if (!isHubSpotConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "HUBSPOT_NOT_CONFIGURED",
        "HubSpot sync requires valid HubSpot and Supabase service role credentials.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { syncId } = hubSpotRetryRequestSchema.parse(body);
    const result = await retryHubSpotSync(syncId);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retry HubSpot sync.";
    return NextResponse.json(createErrorResponse("HUBSPOT_RETRY_FAILED", message), {
      status: 500,
    });
  }
}
