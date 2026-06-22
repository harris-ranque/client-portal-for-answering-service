import { z } from "zod";

import { STRIPE_SYNC_TYPES } from "@/lib/stripe/types";

export { STRIPE_SYNC_TYPES };

export const stripeSyncRequestSchema = z.object({
  syncType: z.enum(STRIPE_SYNC_TYPES).default("subscriptions"),
  companyId: z.uuid().optional(),
});

export const stripeRetryRequestSchema = z.object({
  syncId: z.uuid("Invalid sync job id"),
});

export type StripeSyncRequestInput = z.infer<typeof stripeSyncRequestSchema>;
