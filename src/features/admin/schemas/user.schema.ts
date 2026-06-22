import { z } from "zod";

import { paginationSchema } from "@/schemas/common";
import { USER_ROLES } from "@/lib/constants";

export const usersQuerySchema = paginationSchema.extend({
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  role: z.enum([USER_ROLES.admin, USER_ROLES.client, "all"]).default("all"),
});

export const inviteUserSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    fullName: z.string().trim().min(1, "Name is required").max(120),
    role: z.enum([USER_ROLES.admin, USER_ROLES.client]).default(USER_ROLES.client),
    companyId: z
      .string()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined))
      .pipe(z.union([z.uuid(), z.undefined()])),
  })
  .refine((data) => data.role !== USER_ROLES.client || Boolean(data.companyId), {
    message: "Client users must be assigned to a company",
    path: ["companyId"],
  });

export const userIdSchema = z.object({
  userId: z.uuid("Invalid user id"),
});

export type UsersQueryInput = z.infer<typeof usersQuerySchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
