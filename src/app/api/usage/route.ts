import { NextResponse } from "next/server";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getUsageData } from "@/features/usage/lib/usage.repository";
import { usageQuerySchema } from "@/features/usage/schemas/usage-query.schema";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { USER_ROLES } from "@/lib/constants";

export async function GET(request: Request) {
  const authResult = await requireApiAuth({ role: USER_ROLES.client });

  if ("response" in authResult) {
    return authResult.response;
  }

  const companyId = authResult.user.companyId;

  if (!companyId) {
    return NextResponse.json(
      createErrorResponse("NO_COMPANY", "No company is assigned to this account."),
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = usageQuerySchema.parse({
      months: searchParams.get("months") ?? undefined,
    });
    const data = await getUsageData(companyId, query.months);

    if (!data) {
      return NextResponse.json(createErrorResponse("USAGE_NOT_FOUND", "Usage data not found."), {
        status: 404,
      });
    }

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch usage data.";
    return NextResponse.json(createErrorResponse("USAGE_FETCH_FAILED", message), {
      status: 500,
    });
  }
}
