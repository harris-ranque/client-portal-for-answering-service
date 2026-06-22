import { z } from "zod";

import { paginationSchema } from "@/schemas/common";

export const CALL_LOG_SORT_FIELDS = [
  "call_date",
  "caller_name",
  "duration_seconds",
  "status",
  "direction",
  "agent_name",
] as const;

export const CALL_LOG_STATUSES = [
  "answered",
  "missed",
  "voicemail",
  "busy",
  "failed",
  "cancelled",
] as const;

export const CALL_LOG_DIRECTIONS = ["inbound", "outbound"] as const;

export const callLogsQuerySchema = paginationSchema.extend({
  sortBy: z.enum(CALL_LOG_SORT_FIELDS).default("call_date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  from: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  to: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  status: z.enum(CALL_LOG_STATUSES).optional(),
  direction: z.enum(CALL_LOG_DIRECTIONS).optional(),
});

export type CallLogsQueryInput = z.infer<typeof callLogsQuerySchema>;
export type CallLogSortField = (typeof CALL_LOG_SORT_FIELDS)[number];
