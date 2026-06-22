import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <PlaceholderPage
      title="Onboarding"
      description="Track your onboarding progress and next steps."
      milestone="Milestone 11"
    />
  );
}
