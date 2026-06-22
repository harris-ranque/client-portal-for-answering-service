import { z } from "zod";

import { callLogsQuerySchema } from "@/features/calls/schemas/call-logs-query.schema";

export const adminCallLogsQuerySchema = callLogsQuerySchema.extend({
  companyId: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.union([z.uuid(), z.undefined()])),
});

export type AdminCallLogsQueryInput = z.infer<typeof adminCallLogsQuerySchema>;
