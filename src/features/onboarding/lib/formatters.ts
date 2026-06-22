export const ONBOARDING_STEP_ORDER = ["profile", "billing", "numbers", "routing", "launch"] as const;

const STEP_LABELS: Record<string, string> = {
  profile: "Company profile",
  billing: "Billing setup",
  numbers: "Phone numbers",
  routing: "Call routing",
  launch: "Go live",
  in_progress: "In progress",
};

export function getOnboardingStepLabel(step: string) {
  return STEP_LABELS[step] ?? step.replace(/_/g, " ");
}

export function formatOnboardingStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function getOnboardingProgressPercent(
  completedSteps: string[],
  stepOrder: readonly string[] = ONBOARDING_STEP_ORDER,
) {
  if (stepOrder.length === 0) {
    return 0;
  }

  const completed = new Set(completedSteps);
  const completedCount = stepOrder.filter((step) => completed.has(step)).length;

  return Math.round((completedCount / stepOrder.length) * 100);
}

export function getOnboardingChecklistSteps(
  completedSteps: string[],
  currentStep: string | null,
  stepOrder: readonly string[] = ONBOARDING_STEP_ORDER,
) {
  const completed = new Set(completedSteps);
  const extraSteps = completedSteps.filter((step) => !stepOrder.includes(step));
  const orderedSteps = [...stepOrder, ...extraSteps];

  return orderedSteps.map((step) => ({
    step,
    label: getOnboardingStepLabel(step),
    completed: completed.has(step),
    current: currentStep === step,
  }));
}
