import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@/features/auth/lib/api-auth", () => ({
  requireApiAuth: vi.fn(async () => ({
    user: { id: "user-1", role: "client", companyId: "company-1" },
  })),
}));

vi.mock("@/features/billing/lib/billing.repository", () => ({
  getBillingData: vi.fn(async () => ({
    stripeCustomerId: "cus_123",
  })),
}));

vi.mock("@/features/billing/lib/stripe-customer-portal", () => ({
  createBillingPortalSession: vi.fn(async () => ({ url: "https://billing.stripe.com/session" })),
}));

vi.mock("@/lib/stripe/client", () => ({
  isStripeConfigured: vi.fn(() => true),
}));

import { POST } from "@/app/api/billing/portal/route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("POST /api/billing/portal", () => {
  it("rejects requests with invalid origin", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    const response = await POST(
      new Request("https://portal.example.com/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example.com",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response).toBeDefined();

    const body = await response!.json();

    expect(response!.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_ORIGIN");
  });

  it("accepts requests with allowed origin", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    const response = await POST(
      new Request("https://portal.example.com/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://portal.example.com",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response).toBeDefined();

    const body = await response!.json();

    expect(response!.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
