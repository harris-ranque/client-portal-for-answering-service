import { z } from "zod";

export const HUBSPOT_SYNC_TYPES = ["companies", "contacts", "onboarding", "all"] as const;

export const hubSpotSyncRequestSchema = z.object({
  syncType: z.enum(HUBSPOT_SYNC_TYPES).default("companies"),
  companyId: z.uuid().optional(),
});

export const hubSpotRetryRequestSchema = z.object({
  syncId: z.uuid("Invalid sync job id"),
});

export type HubSpotSyncRequestInput = z.infer<typeof hubSpotSyncRequestSchema>;
