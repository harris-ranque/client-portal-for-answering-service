import { NextResponse } from "next/server";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getCallLogsForExport } from "@/features/calls/lib/calls.repository";
import { callLogsToCsv } from "@/features/calls/lib/csv";
import { parseCallLogsSearchParams } from "@/features/calls/lib/parse-query";
import { createErrorResponse } from "@/lib/api";
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
    const query = parseCallLogsSearchParams(Object.fromEntries(searchParams.entries()));
    const rows = await getCallLogsForExport({ ...query, companyId });
    const csv = callLogsToCsv(rows);
    const filename = `call-logs-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export call logs.";
    return NextResponse.json(createErrorResponse("CALL_LOGS_EXPORT_FAILED", message), {
      status: 500,
    });
  }
}
