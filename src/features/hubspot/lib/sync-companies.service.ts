import {
  buildHubSpotCompanyAddress,
} from "@/features/hubspot/lib/mappers";
import { upsertHubSpotMapping } from "@/features/hubspot/lib/sync.repository";
import { listHubSpotCompanies } from "@/lib/hubspot";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncCompaniesOptions {
  companyId?: string | null;
}

export async function syncHubSpotCompanies(options: SyncCompaniesOptions = {}) {
  const supabase = createAdminClient();
  const companies = await listHubSpotCompanies();
  let processed = 0;

  for (const hubspotCompany of companies) {
    const properties = hubspotCompany.properties ?? {};
    const hubspotId = hubspotCompany.id;

    const { data: existingByHubSpotId } = await supabase
      .from("companies")
      .select("id")
      .eq("hubspot_company_id", hubspotId)
      .maybeSingle();

    let companyId = existingByHubSpotId?.id ?? null;

    if (!companyId && properties.name) {
      const { data: existingByName } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", properties.name)
        .maybeSingle();

      companyId = existingByName?.id ?? null;
    }

    const payload = {
      name: properties.name ?? "Unnamed company",
      email: properties.domain ? `hello@${properties.domain}` : null,
      phone: properties.phone ?? null,
      address: buildHubSpotCompanyAddress(properties),
      hubspot_company_id: hubspotId,
      is_active: true,
    };

    if (companyId) {
      if (options.companyId && companyId !== options.companyId) {
        continue;
      }

      const { error } = await supabase.from("companies").update(payload).eq("id", companyId);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      if (options.companyId) {
        continue;
      }

      const { data: created, error } = await supabase
        .from("companies")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      companyId = created.id;

      await supabase.from("onboarding").insert({
        company_id: companyId,
        status: "not_started",
        current_step: "profile",
        completed_steps: [],
      });
    }

    await upsertHubSpotMapping({
      entityType: "company",
      hubspotId,
      entityId: companyId,
      metadata: { name: properties.name ?? null },
    });

    processed += 1;
  }

  return {
    fetched: companies.length,
    processed,
  };
}
