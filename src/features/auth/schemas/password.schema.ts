import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
