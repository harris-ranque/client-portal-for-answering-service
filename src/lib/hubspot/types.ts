export interface HubSpotPaging {
  next?: {
    after?: string;
  };
}

export interface HubSpotObject<TProperties = Record<string, string | null>> {
  id: string;
  properties: TProperties;
  createdAt?: string;
  updatedAt?: string;
}

export interface HubSpotListResponse<T> {
  results: T[];
  paging?: HubSpotPaging;
}

export interface HubSpotAssociationResult {
  toObjectId: string;
  associationTypes?: Array<{ category: string; typeId: number; label?: string }>;
}

export interface HubSpotAssociationsResponse {
  results: HubSpotAssociationResult[];
}

export type HubSpotCompanyProperties = {
  name?: string | null;
  phone?: string | null;
  domain?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

export type HubSpotContactProperties = {
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  phone?: string | null;
  jobtitle?: string | null;
};

export type HubSpotDealProperties = {
  dealname?: string | null;
  dealstage?: string | null;
  pipeline?: string | null;
  closedate?: string | null;
};

export type HubSpotSyncType = "companies" | "contacts" | "onboarding" | "all";

export type HubSpotCompany = HubSpotObject<HubSpotCompanyProperties>;
export type HubSpotContact = HubSpotObject<HubSpotContactProperties>;
export type HubSpotDeal = HubSpotObject<HubSpotDealProperties>;
