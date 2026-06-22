import type { Tables } from "@/types/database";

export type OnboardingRecord = Tables<"onboarding">;
export type OnboardingStatus = OnboardingRecord["status"];

export interface OnboardingViewData {
  onboarding: OnboardingRecord | null;
  companyId: string;
}
