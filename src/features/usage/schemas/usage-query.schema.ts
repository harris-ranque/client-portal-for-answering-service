import { z } from "zod";

export const usageQuerySchema = z.object({
  months: z.coerce.number().int().min(3).max(24).default(12),
});

export type UsageQueryInput = z.infer<typeof usageQuerySchema>;
