import type { HubSpotCompanyProperties, HubSpotContactProperties } from "@/lib/hubspot/types";
import type { Database } from "@/types/database";

type OnboardingStatus = Database["public"]["Enums"]["onboarding_status"];

export function buildHubSpotCompanyAddress(properties: HubSpotCompanyProperties) {
  if (properties.address) {
    return properties.address;
  }

  const parts = [properties.city, properties.state, properties.zip, properties.country].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export function buildHubSpotContactName(properties: HubSpotContactProperties) {
  const parts = [properties.firstname, properties.lastname].filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" ").trim();
}

export function mapHubSpotDealStageToOnboardingStatus(
  dealStage: string | null | undefined,
): OnboardingStatus {
  const normalized = dealStage?.toLowerCase().replace(/[\s_-]+/g, "") ?? "";

  if (
    normalized.includes("closedwon") ||
    normalized.includes("won") ||
    normalized.includes("completed") ||
    normalized.includes("launch")
  ) {
    return "completed";
  }

  if (
    normalized.includes("closedlost") ||
    normalized.includes("lost") ||
    normalized.includes("blocked")
  ) {
    return "blocked";
  }

  if (normalized.includes("notstarted") || normalized === "") {
    return "not_started";
  }

  return "in_progress";
}

export function mapHubSpotDealStageToStep(dealStage: string | null | undefined) {
  const normalized = dealStage?.toLowerCase() ?? "";

  if (normalized.includes("closedwon") || normalized.includes("won")) {
    return "launch";
  }

  if (normalized.includes("billing")) {
    return "billing";
  }

  if (normalized.includes("profile")) {
    return "profile";
  }

  return dealStage ?? "in_progress";
}
