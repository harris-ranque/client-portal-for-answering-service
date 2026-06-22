import { z } from "zod";

export const JUSTCALL_SYNC_TYPES = ["calls", "contacts", "agents", "all"] as const;

export const justCallSyncRequestSchema = z.object({
  syncType: z.enum(JUSTCALL_SYNC_TYPES).default("calls"),
  companyId: z.uuid().optional(),
  fromDatetime: z.string().trim().optional(),
  toDatetime: z.string().trim().optional(),
});

export const justCallRetryRequestSchema = z.object({
  syncId: z.uuid("Invalid sync job id"),
});

export type JustCallSyncRequestInput = z.infer<typeof justCallSyncRequestSchema>;
