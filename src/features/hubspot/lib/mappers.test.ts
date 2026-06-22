import { describe, expect, it } from "vitest";

import {
  buildHubSpotCompanyAddress,
  buildHubSpotContactName,
  mapHubSpotDealStageToOnboardingStatus,
  mapHubSpotDealStageToStep,
} from "@/features/hubspot/lib/mappers";

describe("hubspot mappers", () => {
  it("builds company addresses", () => {
    expect(buildHubSpotCompanyAddress({ address: "123 Main St" })).toBe("123 Main St");
    expect(
      buildHubSpotCompanyAddress({
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "US",
      }),
    ).toBe("Austin, TX, 78701, US");
    expect(buildHubSpotCompanyAddress({})).toBeNull();
  });

  it("builds contact names", () => {
    expect(buildHubSpotContactName({ firstname: "Jane", lastname: "Doe" })).toBe("Jane Doe");
    expect(buildHubSpotContactName({})).toBeNull();
  });

  it("maps deal stages to onboarding status", () => {
    expect(mapHubSpotDealStageToOnboardingStatus("closedwon")).toBe("completed");
    expect(mapHubSpotDealStageToOnboardingStatus("closedlost")).toBe("blocked");
    expect(mapHubSpotDealStageToOnboardingStatus("")).toBe("not_started");
    expect(mapHubSpotDealStageToOnboardingStatus("discovery")).toBe("in_progress");
  });

  it("maps deal stages to onboarding steps", () => {
    expect(mapHubSpotDealStageToStep("closedwon")).toBe("launch");
    expect(mapHubSpotDealStageToStep("billing_setup")).toBe("billing");
    expect(mapHubSpotDealStageToStep("custom_stage")).toBe("custom_stage");
  });
});
