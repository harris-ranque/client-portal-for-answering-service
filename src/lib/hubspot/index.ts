export { isHubSpotConfigured, getHubSpotAccessToken, HUBSPOT_API_BASE_URL } from "@/lib/hubspot/config";
export { HubSpotApiError, HubSpotRateLimitError } from "@/lib/hubspot/errors";
export { hubSpotRequest, hubSpotListAllPages } from "@/lib/hubspot/client";
export {
  listHubSpotCompanies,
  listHubSpotContacts,
  listHubSpotDeals,
  getHubSpotContactCompanyIds,
  getHubSpotDealCompanyIds,
  pingHubSpotApi,
} from "@/lib/hubspot/resources";
export type {
  HubSpotCompany,
  HubSpotContact,
  HubSpotDeal,
  HubSpotSyncType,
} from "@/lib/hubspot/types";
