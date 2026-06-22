import { isPlaceholderEnv, serverEnv } from "@/lib/env";

export const HUBSPOT_API_BASE_URL = "https://api.hubapi.com";

export function isHubSpotConfigured() {
  const token = serverEnv.HUBSPOT_ACCESS_TOKEN;
  return Boolean(token && !isPlaceholderEnv(token));
}

export function getHubSpotAccessToken() {
  if (!isHubSpotConfigured()) {
    throw new Error(
      "HubSpot is not configured. Set HUBSPOT_ACCESS_TOKEN in your environment.",
    );
  }

  return serverEnv.HUBSPOT_ACCESS_TOKEN!;
}
