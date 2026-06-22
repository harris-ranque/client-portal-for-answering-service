import { NextResponse } from "next/server";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getBillingData } from "@/features/billing/lib/billing.repository";
import { billingQuerySchema } from "@/features/billing/schemas/billing-query.schema";
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
    const query = billingQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });
    const data = await getBillingData(companyId, query.page, query.pageSize);

    if (!data) {
      return NextResponse.json(createErrorResponse("BILLING_NOT_FOUND", "Billing data not found."), {
        status: 404,
      });
    }

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch billing data.";
    return NextResponse.json(createErrorResponse("BILLING_FETCH_FAILED", message), {
      status: 500,
    });
  }
}
