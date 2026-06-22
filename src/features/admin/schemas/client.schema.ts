import { z } from "zod";

import { paginationSchema } from "@/schemas/common";

function optionalString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined));
}

function optionalEmail() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.union([z.email("Enter a valid email address"), z.undefined()]));
}

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  email: optionalEmail(),
  phone: optionalString(40),
  address: optionalString(500),
});

export const clientIdSchema = z.object({
  clientId: z.uuid("Invalid client id"),
});

export const clientsQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  status: z.enum(["active", "inactive", "all"]).default("all"),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
export type ClientsQueryInput = z.infer<typeof clientsQuerySchema>;
