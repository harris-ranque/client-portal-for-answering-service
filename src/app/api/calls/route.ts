import { NextResponse } from "next/server";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getCallLogs } from "@/features/calls/lib/calls.repository";
import { parseCallLogsSearchParams } from "@/features/calls/lib/parse-query";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function GET(request: Request) {
  const authResult = await requireApiAuth();

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
    const query = parseCallLogsSearchParams(Object.fromEntries(searchParams.entries()));
    const result = await getCallLogs({ ...query, companyId });

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch call logs.";
    return NextResponse.json(createErrorResponse("CALL_LOGS_FETCH_FAILED", message), {
      status: 500,
    });
  }
}
