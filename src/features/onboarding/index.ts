export { OnboardingView } from "@/features/onboarding/components/onboarding-view";
export { getCompanyOnboarding } from "@/features/onboarding/lib/onboarding.repository";
export {
  formatOnboardingStatus,
  getOnboardingChecklistSteps,
  getOnboardingProgressPercent,
  getOnboardingStepLabel,
  ONBOARDING_STEP_ORDER,
} from "@/features/onboarding/lib/formatters";
export type {
  OnboardingRecord,
  OnboardingStatus,
  OnboardingViewData,
} from "@/features/onboarding/types/onboarding.types";

export const ONBOARDING_FEATURE = "onboarding" as const;
