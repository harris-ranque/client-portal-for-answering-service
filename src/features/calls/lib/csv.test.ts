import { describe, expect, it } from "vitest";

import { callLogsToCsv } from "@/features/calls/lib/csv";
import type { CallLogRecord } from "@/features/calls/types/call-logs.types";

const sampleCall: CallLogRecord = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  company_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  call_date: "2025-06-15T14:30:00.000Z",
  caller_name: 'Jane "Caller"',
  caller_number: "+15550101000",
  direction: "inbound",
  duration_seconds: 180,
  agent_name: "Alex",
  status: "answered",
  recording_url: "https://example.com/recording",
  notes: "Needs follow-up,\nurgent",
  external_id: "jc_123",
  created_at: "2025-06-15T14:30:00.000Z",
  updated_at: "2025-06-15T14:30:00.000Z",
};

describe("callLogsToCsv", () => {
  it("renders headers and rows", () => {
    const csv = callLogsToCsv([sampleCall]);

    expect(csv).toContain("Call Date");
    expect(csv).toContain("+15550101000");
    expect(csv).toContain('"Jane ""Caller"""');
    expect(csv).toContain('"Needs follow-up,\nurgent"');
  });
});
