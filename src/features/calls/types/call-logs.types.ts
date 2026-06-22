import type { Tables } from "@/types/database";
import type { PaginatedResponse } from "@/types";

export type CallLogRecord = Tables<"call_logs">;

export interface CallLogsQuery {
  companyId: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
  from?: string;
  to?: string;
  status?: CallLogRecord["status"];
  direction?: CallLogRecord["direction"];
}

export type CallLogsResult = PaginatedResponse<CallLogRecord>;

export const CALL_LOG_CSV_COLUMNS = [
  { key: "call_date", header: "Call Date" },
  { key: "caller_name", header: "Caller Name" },
  { key: "caller_number", header: "Caller Number" },
  { key: "direction", header: "Direction" },
  { key: "duration_seconds", header: "Duration (seconds)" },
  { key: "agent_name", header: "Agent" },
  { key: "status", header: "Status" },
  { key: "recording_url", header: "Recording URL" },
  { key: "notes", header: "Notes" },
] as const;
