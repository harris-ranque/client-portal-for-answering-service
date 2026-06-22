import { NextResponse } from "next/server";

import { getAdminOverviewMetrics } from "@/features/admin/lib/admin.repository";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function GET() {
  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  try {
    const metrics = await getAdminOverviewMetrics();
    return NextResponse.json(createSuccessResponse(metrics));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin metrics.";
    return NextResponse.json(createErrorResponse("ADMIN_METRICS_FAILED", message), {
      status: 500,
    });
  }
}
