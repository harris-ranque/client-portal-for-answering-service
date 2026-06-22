import { z } from "zod";

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

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1, "Business name is required").max(200),
  email: optionalEmail(),
  phone: optionalString(40),
  address: optionalString(500),
});

export const userProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").max(120),
  email: optionalEmail(),
  phone: optionalString(40),
  title: optionalString(80),
  isPrimary: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
    .transform((value) => value === "on" || value === "true"),
});

export const contactIdSchema = z.object({
  contactId: z.uuid("Invalid contact id"),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
