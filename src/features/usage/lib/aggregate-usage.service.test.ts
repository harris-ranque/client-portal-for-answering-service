import { describe, expect, it } from "vitest";

import { aggregateCallLogs } from "@/features/usage/lib/aggregate-usage.service";

describe("aggregateCallLogs", () => {
  it("returns zeroed metrics for empty input", () => {
    expect(aggregateCallLogs([])).toEqual({
      minutesUsed: 0,
      callsAnswered: 0,
      callsMissed: 0,
      averageDurationSeconds: 0,
    });
  });

  it("aggregates minutes, answered, missed, and average duration", () => {
    const result = aggregateCallLogs([
      { duration_seconds: 120, status: "answered" },
      { duration_seconds: 60, status: "answered" },
      { duration_seconds: 30, status: "missed" },
      { duration_seconds: 90, status: "voicemail" },
    ]);

    expect(result.minutesUsed).toBe(5);
    expect(result.callsAnswered).toBe(2);
    expect(result.callsMissed).toBe(2);
    expect(result.averageDurationSeconds).toBe(75);
  });
});
