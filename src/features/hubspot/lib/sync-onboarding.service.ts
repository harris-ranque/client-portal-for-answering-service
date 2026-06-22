import {
  mapHubSpotDealStageToOnboardingStatus,
  mapHubSpotDealStageToStep,
} from "@/features/hubspot/lib/mappers";
import { upsertHubSpotMapping } from "@/features/hubspot/lib/sync.repository";
import { getHubSpotDealCompanyIds, listHubSpotDeals } from "@/lib/hubspot";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncOnboardingOptions {
  companyId?: string | null;
}

async function resolvePortalCompanyId(hubspotCompanyIds: string[]) {
  if (hubspotCompanyIds.length === 0) {
    return null;
  }

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("companies")
    .select("id")
    .in("hubspot_company_id", hubspotCompanyIds)
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function syncHubSpotOnboarding(options: SyncOnboardingOptions = {}) {
  const deals = await listHubSpotDeals();
  const supabase = createAdminClient();
  let processed = 0;

  for (const deal of deals) {
    const properties = deal.properties ?? {};
    const hubspotCompanyIds = await getHubSpotDealCompanyIds(deal.id);
    const portalCompanyId = await resolvePortalCompanyId(hubspotCompanyIds);

    if (!portalCompanyId) {
      continue;
    }

    if (options.companyId && portalCompanyId !== options.companyId) {
      continue;
    }

    const status = mapHubSpotDealStageToOnboardingStatus(properties.dealstage);
    const currentStep = mapHubSpotDealStageToStep(properties.dealstage);
    const completedAt = status === "completed" ? new Date().toISOString() : null;

    const { data: existing } = await supabase
      .from("onboarding")
      .select("id, completed_steps")
      .eq("company_id", portalCompanyId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("onboarding")
        .update({
          status,
          current_step: currentStep,
          hubspot_deal_id: deal.id,
          completed_at: completedAt,
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("onboarding").insert({
        company_id: portalCompanyId,
        status,
        current_step: currentStep,
        hubspot_deal_id: deal.id,
        completed_steps: [],
        completed_at: completedAt,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    await upsertHubSpotMapping({
      entityType: "deal",
      hubspotId: deal.id,
      entityId: portalCompanyId,
      metadata: {
        dealname: properties.dealname ?? null,
        dealstage: properties.dealstage ?? null,
      },
    });

    processed += 1;
  }

  return {
    fetched: deals.length,
    processed,
  };
}
