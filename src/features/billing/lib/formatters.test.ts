import { describe, expect, it } from "vitest";

import { formatBillingDate, formatBillingPeriod } from "@/features/billing/lib/formatters";

describe("billing formatters", () => {
  it("formats billing dates", () => {
    expect(formatBillingDate(null)).toBe("—");
    expect(formatBillingDate("2025-06-15T00:00:00.000Z")).toMatch(/Jun/);
  });

  it("formats billing periods", () => {
    expect(formatBillingPeriod(null, null)).toBe("—");
    expect(formatBillingPeriod("2025-06-01T00:00:00.000Z", "2025-06-30T00:00:00.000Z")).toContain(
      "–",
    );
  });
});
