import { hubSpotListAllPages, hubSpotRequest } from "@/lib/hubspot/client";
import type {
  HubSpotAssociationsResponse,
  HubSpotCompany,
  HubSpotContact,
  HubSpotDeal,
} from "@/lib/hubspot/types";

const COMPANY_PROPERTIES = ["name", "phone", "domain", "address", "city", "state", "zip", "country"];
const CONTACT_PROPERTIES = ["firstname", "lastname", "email", "phone", "jobtitle"];
const DEAL_PROPERTIES = ["dealname", "dealstage", "pipeline", "closedate"];

export async function listHubSpotCompanies(options?: { maxPages?: number }) {
  return hubSpotListAllPages<HubSpotCompany>("/crm/v3/objects/companies", {
    query: { properties: COMPANY_PROPERTIES.join(",") },
    maxPages: options?.maxPages ?? 20,
  });
}

export async function listHubSpotContacts(options?: { maxPages?: number }) {
  return hubSpotListAllPages<HubSpotContact>("/crm/v3/objects/contacts", {
    query: { properties: CONTACT_PROPERTIES.join(",") },
    maxPages: options?.maxPages ?? 20,
  });
}

export async function listHubSpotDeals(options?: { maxPages?: number }) {
  return hubSpotListAllPages<HubSpotDeal>("/crm/v3/objects/deals", {
    query: { properties: DEAL_PROPERTIES.join(",") },
    maxPages: options?.maxPages ?? 20,
  });
}

export async function getHubSpotContactCompanyIds(contactId: string) {
  const response = await hubSpotRequest<HubSpotAssociationsResponse>(
    `/crm/v4/objects/contacts/${contactId}/associations/companies`,
  );

  return (response.results ?? []).map((item) => item.toObjectId);
}

export async function getHubSpotDealCompanyIds(dealId: string) {
  const response = await hubSpotRequest<HubSpotAssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/companies`,
  );

  return (response.results ?? []).map((item) => item.toObjectId);
}

export async function pingHubSpotApi() {
  await hubSpotRequest<{ results: HubSpotCompany[] }>("/crm/v3/objects/companies", {
    query: { limit: 1, properties: "name" },
  });

  return { ok: true };
}
