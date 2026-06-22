import { NextResponse } from "next/server";

import { getHubSpotSyncHistory } from "@/features/hubspot/lib/sync.repository";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function GET() {
  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  try {
    const history = await getHubSpotSyncHistory(25);
    return NextResponse.json(createSuccessResponse(history));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch HubSpot sync history.";
    return NextResponse.json(createErrorResponse("HUBSPOT_HISTORY_FAILED", message), {
      status: 500,
    });
  }
}
