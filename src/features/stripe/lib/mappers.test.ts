import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  getInvoiceCustomerId,
  mapStripeInvoice,
  mapStripeSubscription,
  mapStripeSubscriptionStatus,
} from "@/features/stripe/lib/mappers";

function createSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_test_123",
    object: "subscription",
    customer: "cus_test_123",
    status: "active",
    metadata: { minutes_included: "500" },
    items: {
      object: "list",
      data: [
        {
          id: "si_test",
          object: "subscription_item",
          current_period_start: 1_700_000_000,
          current_period_end: 1_702_592_000,
          price: {
            id: "price_test",
            object: "price",
            nickname: "Professional Plan",
          } as Stripe.Price,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items",
    },
    ...overrides,
  } as Stripe.Subscription;
}

function createInvoice(overrides: Partial<Stripe.Invoice> = {}): Stripe.Invoice {
  return {
    id: "in_test_123",
    object: "invoice",
    customer: "cus_test_123",
    amount_due: 9900,
    currency: "usd",
    status: "paid",
    hosted_invoice_url: "https://invoice.stripe.com/test",
    period_start: 1_700_000_000,
    period_end: 1_702_592_000,
    status_transitions: {
      paid_at: 1_700_086_400,
    },
    ...overrides,
  } as Stripe.Invoice;
}

describe("stripe mappers", () => {
  it("maps subscription status and fields", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("unknown" as Stripe.Subscription.Status)).toBe("incomplete");

    const mapped = mapStripeSubscription(createSubscription());

    expect(mapped).toMatchObject({
      stripe_subscription_id: "sub_test_123",
      stripe_customer_id: "cus_test_123",
      plan_name: "Professional Plan",
      status: "active",
      minutes_included: 500,
    });
    expect(mapped.current_period_start).toBeTruthy();
    expect(mapped.current_period_end).toBeTruthy();
  });

  it("maps invoice fields and customer id", () => {
    const mapped = mapStripeInvoice(createInvoice());

    expect(mapped).toMatchObject({
      amount_cents: 9900,
      currency: "usd",
      status: "paid",
      invoice_url: "https://invoice.stripe.com/test",
    });
    expect(getInvoiceCustomerId(createInvoice())).toBe("cus_test_123");
  });
});
