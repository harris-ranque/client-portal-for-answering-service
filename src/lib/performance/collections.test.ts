import { describe, expect, it } from "vitest";

import {
  findMetricForPeriod,
  indexByCompanyId,
  indexLatestByCompanyId,
} from "@/lib/performance/collections";

describe("performance collection helpers", () => {
  it("keeps the latest record per company", () => {
    const rows = [
      { company_id: "a", created_at: "2025-06-01T00:00:00.000Z", value: 1 },
      { company_id: "a", created_at: "2025-06-02T00:00:00.000Z", value: 2 },
      { company_id: "b", created_at: "2025-06-01T00:00:00.000Z", value: 3 },
    ];

    const latest = indexLatestByCompanyId(rows);

    expect(latest.get("a")?.value).toBe(2);
    expect(latest.get("b")?.value).toBe(3);
  });

  it("indexes rows by company id", () => {
    const rows = [
      { company_id: "a", minutes_used: 10 },
      { company_id: "b", minutes_used: 20 },
    ];

    const byCompany = indexByCompanyId(rows);

    expect(byCompany.get("a")?.minutes_used).toBe(10);
    expect(byCompany.get("b")?.minutes_used).toBe(20);
  });

  it("finds metrics for a billing period", () => {
    const metrics = [
      { period_start: "2025-05-01", period_end: "2025-05-31", minutes_used: 100 },
      { period_start: "2025-06-01", period_end: "2025-06-30", minutes_used: 200 },
    ];

    expect(findMetricForPeriod(metrics, "2025-06-01", "2025-06-30")?.minutes_used).toBe(200);
    expect(findMetricForPeriod(metrics, "2025-01-01", "2025-01-31")).toBeNull();
  });
});
