import { NextResponse } from "next/server";

import { handleStripeWebhook } from "@/features/stripe/lib/webhook.service";
import { isStripeWebhookConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured." },
      { status: 503 },
    );
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");
    const result = await handleStripeWebhook(payload, signature);

    return NextResponse.json({
      received: true,
      eventId: result.eventId,
      duplicate: result.duplicate ?? false,
      recordsProcessed: result.recordsProcessed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe webhook failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
