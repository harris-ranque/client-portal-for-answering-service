import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type OnboardingStatus = Database["public"]["Enums"]["onboarding_status"];

export interface UpdateAdminOnboardingInput {
  status: OnboardingStatus;
  currentStep?: string | null;
  notes?: string | null;
  completedStep?: string | null;
}

export async function updateAdminOnboarding(
  onboardingId: string,
  input: UpdateAdminOnboardingInput,
) {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("onboarding")
    .select("id, company_id, completed_steps, status, completed_at")
    .eq("id", onboardingId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!existing) {
    throw new Error("Onboarding record not found.");
  }

  const completedSteps = Array.isArray(existing.completed_steps)
    ? existing.completed_steps.filter((step): step is string => typeof step === "string")
    : [];

  const nextCompletedSteps =
    input.completedStep && !completedSteps.includes(input.completedStep)
      ? [...completedSteps, input.completedStep]
      : completedSteps;

  const completedAt =
    input.status === "completed"
      ? existing.completed_at ?? new Date().toISOString()
      : input.status === "not_started"
        ? null
        : existing.completed_at;

  const { data, error } = await supabase
    .from("onboarding")
    .update({
      status: input.status,
      current_step: input.currentStep?.trim() ? input.currentStep.trim() : null,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      completed_steps: nextCompletedSteps,
      completed_at: completedAt,
    })
    .eq("id", onboardingId)
    .select(
      "id, company_id, status, current_step, completed_steps, hubspot_deal_id, notes, completed_at, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
