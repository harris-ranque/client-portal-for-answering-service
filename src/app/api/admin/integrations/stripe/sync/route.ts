import { NextResponse } from "next/server";

import { stripeSyncRequestSchema } from "@/features/stripe/schemas/stripe-sync.schema";
import { runStripeSync } from "@/features/stripe/lib/sync.service";
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

  if (!isStripeConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "STRIPE_NOT_CONFIGURED",
        "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      ),
      { status: 503 },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      createErrorResponse(
        "SUPABASE_ADMIN_NOT_CONFIGURED",
        "SUPABASE_SERVICE_ROLE_KEY is required to run Stripe sync jobs.",
      ),
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const input = stripeSyncRequestSchema.parse(body);
    const result = await runStripeSync(input);

    return NextResponse.json(createSuccessResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe sync failed.";
    return NextResponse.json(createErrorResponse("STRIPE_SYNC_FAILED", message), {
      status: 500,
    });
  }
}
