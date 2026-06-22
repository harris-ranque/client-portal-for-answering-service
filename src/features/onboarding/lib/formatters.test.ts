import { describe, expect, it } from "vitest";

import {
  getOnboardingChecklistSteps,
  getOnboardingProgressPercent,
  getOnboardingStepLabel,
} from "@/features/onboarding/lib/formatters";

describe("onboarding formatters", () => {
  it("maps known step labels", () => {
    expect(getOnboardingStepLabel("profile")).toBe("Company profile");
    expect(getOnboardingStepLabel("custom_step")).toBe("custom step");
  });

  it("calculates progress from completed steps", () => {
    expect(getOnboardingProgressPercent(["profile", "billing"])).toBe(40);
    expect(getOnboardingProgressPercent([])).toBe(0);
  });

  it("builds checklist with current step marker", () => {
    const checklist = getOnboardingChecklistSteps(["profile"], "billing");

    expect(checklist.find((item) => item.step === "profile")?.completed).toBe(true);
    expect(checklist.find((item) => item.step === "billing")?.current).toBe(true);
  });
});
