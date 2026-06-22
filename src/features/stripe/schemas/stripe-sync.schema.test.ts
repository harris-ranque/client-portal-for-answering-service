import { describe, expect, it } from "vitest";

import {
  stripeRetryRequestSchema,
  stripeSyncRequestSchema,
} from "@/features/stripe/schemas/stripe-sync.schema";

describe("stripe sync schemas", () => {
  it("parses sync requests with defaults", () => {
    expect(stripeSyncRequestSchema.parse({})).toEqual({
      syncType: "subscriptions",
    });

    expect(
      stripeSyncRequestSchema.parse({
        syncType: "all",
        companyId: "11111111-1111-4111-8111-111111111111",
      }),
    ).toEqual({
      syncType: "all",
      companyId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("rejects invalid retry ids", () => {
    expect(() => stripeRetryRequestSchema.parse({ syncId: "not-a-uuid" })).toThrow();
  });
});
