import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleStripeSubscriptionEvent } from "@/features/stripe/lib/webhook-handlers";

const resolveCompanyByStripeCustomerId = vi.fn();
const upsertSubscriptionFromStripe = vi.fn();
const markSubscriptionCanceled = vi.fn();

vi.mock("@/features/stripe/lib/company.repository", () => ({
  resolveCompanyByStripeCustomerId: (...args: unknown[]) =>
    resolveCompanyByStripeCustomerId(...args),
}));

vi.mock("@/features/stripe/lib/subscription.repository", () => ({
  upsertSubscriptionFromStripe: (...args: unknown[]) => upsertSubscriptionFromStripe(...args),
  markSubscriptionCanceled: (...args: unknown[]) => markSubscriptionCanceled(...args),
}));

function createSubscription(status: Stripe.Subscription.Status = "active") {
  return {
    id: "sub_test_123",
    customer: "cus_test_123",
    status,
  } as Stripe.Subscription;
}

describe("handleStripeSubscriptionEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips events when the company is not mapped", async () => {
    resolveCompanyByStripeCustomerId.mockResolvedValue(null);

    const result = await handleStripeSubscriptionEvent(
      "customer.subscription.updated",
      createSubscription(),
    );

    expect(result).toEqual({
      skipped: true,
      reason: "No company mapped to Stripe customer cus_test_123.",
    });
    expect(upsertSubscriptionFromStripe).not.toHaveBeenCalled();
  });

  it("upserts active subscriptions for mapped companies", async () => {
    resolveCompanyByStripeCustomerId.mockResolvedValue("company-1");

    const result = await handleStripeSubscriptionEvent(
      "customer.subscription.updated",
      createSubscription("active"),
    );

    expect(result).toEqual({
      skipped: false,
      companyId: "company-1",
      subscriptionId: "sub_test_123",
    });
    expect(upsertSubscriptionFromStripe).toHaveBeenCalledWith("company-1", expect.any(Object));
  });

  it("marks canceled subscriptions", async () => {
    resolveCompanyByStripeCustomerId.mockResolvedValue("company-1");

    await handleStripeSubscriptionEvent(
      "customer.subscription.deleted",
      createSubscription("canceled"),
    );

    expect(markSubscriptionCanceled).toHaveBeenCalled();
    expect(upsertSubscriptionFromStripe).not.toHaveBeenCalled();
  });
});
