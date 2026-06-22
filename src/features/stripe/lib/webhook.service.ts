import type Stripe from "stripe";

import {
  completeStripeSyncJob,
  createStripeSyncJob,
  failStripeSyncJob,
  getStripeWebhookEventRecord,
  restartStripeWebhookJob,
} from "@/features/stripe/lib/sync.repository";
import {
  handleStripeInvoiceEvent,
  handleStripeSubscriptionEvent,
} from "@/features/stripe/lib/webhook-handlers";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { STRIPE_WEBHOOK_EVENT_TYPES } from "@/lib/stripe/types";
import type { StripeWebhookEventType } from "@/lib/stripe/types";

const HANDLED_EVENT_TYPES = new Set<string>(STRIPE_WEBHOOK_EVENT_TYPES);

function isHandledEventType(eventType: string): eventType is StripeWebhookEventType {
  return HANDLED_EVENT_TYPES.has(eventType);
}

async function processStripeEvent(event: Stripe.Event) {
  if (!isHandledEventType(event.type)) {
    return {
      recordsProcessed: 0,
      metadata: {
        eventType: event.type,
        skipped: true,
        reason: "Unhandled event type.",
      },
    };
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const result = await handleStripeSubscriptionEvent(event.type, event.data.object);
      return {
        recordsProcessed: result.skipped ? 0 : 1,
        metadata: {
          eventType: event.type,
          ...result,
        },
      };
    }
    case "invoice.created":
    case "invoice.updated":
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.payment_failed": {
      const result = await handleStripeInvoiceEvent(event.data.object);
      return {
        recordsProcessed: result.skipped ? 0 : 1,
        metadata: {
          eventType: event.type,
          ...result,
        },
      };
    }
    default:
      return {
        recordsProcessed: 0,
        metadata: {
          eventType: event.type,
          skipped: true,
        },
      };
  }
}

export async function constructStripeWebhookEvent(payload: string, signature: string | null) {
  if (!signature) {
    throw new Error("Missing Stripe signature header.");
  }

  const stripe = getStripeClient();

  return stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
}

export async function handleStripeWebhook(payload: string, signature: string | null) {
  const event = await constructStripeWebhookEvent(payload, signature);
  const existing = await getStripeWebhookEventRecord(event.id);

  if (existing?.sync_status === "completed") {
    return {
      eventId: event.id,
      duplicate: true,
      recordsProcessed: existing.records_processed,
    };
  }

  if (existing?.sync_status === "running") {
    return {
      eventId: event.id,
      duplicate: true,
      recordsProcessed: 0,
    };
  }

  const syncJob =
    existing?.sync_status === "failed"
      ? await restartStripeWebhookJob(existing.id, { eventType: event.type })
      : await createStripeSyncJob({
          syncType: "webhook",
          stripeEventId: event.id,
          metadata: {
            eventType: event.type,
          },
        });

  try {
    const result = await processStripeEvent(event);

    await completeStripeSyncJob(syncJob.id, {
      recordsProcessed: result.recordsProcessed,
      metadata: {
        ...result.metadata,
        eventType: event.type,
      },
    });

    return {
      eventId: event.id,
      duplicate: false,
      recordsProcessed: result.recordsProcessed,
      metadata: result.metadata,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe webhook processing failed.";

    await failStripeSyncJob(syncJob.id, {
      errorMessage: message,
      metadata: {
        eventType: event.type,
      },
    });

    throw error;
  }
}
