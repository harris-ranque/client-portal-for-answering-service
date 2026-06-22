import { z } from "zod";

import { paginationSchema } from "@/schemas/common";

export const billingQuerySchema = paginationSchema;

export type BillingQueryInput = z.infer<typeof billingQuerySchema>;
