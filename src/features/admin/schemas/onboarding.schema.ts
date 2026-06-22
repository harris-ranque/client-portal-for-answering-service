import { z } from "zod";

export const onboardingStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "blocked",
]);

export const updateOnboardingSchema = z.object({
  onboardingId: z.string().uuid(),
  status: onboardingStatusSchema,
  currentStep: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  completedStep: z.string().trim().optional(),
});
