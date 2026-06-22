import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getBillingData } from "@/features/billing/lib/billing.repository";
import { createBillingPortalSession } from "@/features/billing/lib/stripe-customer-portal";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";
import { USER_ROLES } from "@/lib/constants";
import { isStripeConfigured } from "@/lib/stripe/client";
import { rejectInvalidOrigin } from "@/lib/security/reject-invalid-origin";

const portalRequestSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const originError = rejectInvalidOrigin(request);

  if (originError) {
    return originError;
  }

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

  if (!isStripeConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "STRIPE_NOT_CONFIGURED",
        "Stripe is not configured. Add valid Stripe API keys to enable the customer portal.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { returnUrl } = portalRequestSchema.parse(body);
    const billingData = await getBillingData(companyId, 1, 1);

    if (!billingData?.stripeCustomerId) {
      return NextResponse.json(
        createErrorResponse(
          "NO_STRIPE_CUSTOMER",
          "No Stripe customer is linked to this company.",
        ),
        { status: 400 },
      );
    }

    const session = await createBillingPortalSession({
      stripeCustomerId: billingData.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json(createSuccessResponse(session));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create billing portal session.";
    return NextResponse.json(createErrorResponse("BILLING_PORTAL_FAILED", message), {
      status: 500,
    });
  }
}
