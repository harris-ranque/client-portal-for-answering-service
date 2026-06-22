import { NextResponse } from "next/server";

import { stripeRetryRequestSchema } from "@/features/stripe/schemas/stripe-sync.schema";
import { retryStripeSync } from "@/features/stripe/lib/sync.service";
import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { isStripeConfigured } from "@/lib/stripe";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { USER_ROLES } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function POST(request: Request) {
  const authResult = await requireApiAuth({ role: USER_ROLES.admin });

  if ("response" in authResult) {
    return authResult.response;
  }

  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "STRIPE_NOT_CONFIGURED",
        "Stripe sync requires valid Stripe and Supabase service role credentials.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { syncId } = stripeRetryRequestSchema.parse(body);
    const result = await retryStripeSync(syncId);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retry Stripe sync.";
    return NextResponse.json(createErrorResponse("STRIPE_RETRY_FAILED", message), {
      status: 500,
    });
  }
}
