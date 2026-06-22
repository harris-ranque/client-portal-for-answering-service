import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDuration,
  formatMinutes,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/dashboard/lib/formatters";

describe("dashboard formatters", () => {
  it("formats minutes, duration, and currency", () => {
    expect(formatMinutes(1250.4)).toBe("1,250.4");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatCurrency(1999)).toBe("$19.99");
    expect(formatCurrency(1500, "eur")).toMatch(/€|EUR/);
  });

  it("maps billing status variants", () => {
    expect(getBillingStatusVariant("paid")).toBe("default");
    expect(getBillingStatusVariant("past_due")).toBe("destructive");
    expect(getBillingStatusVariant("draft")).toBe("secondary");
    expect(getBillingStatusVariant(null)).toBe("outline");
  });

  it("formats subscription labels", () => {
    expect(getSubscriptionStatusLabel("past_due")).toBe("past due");
  });
});
