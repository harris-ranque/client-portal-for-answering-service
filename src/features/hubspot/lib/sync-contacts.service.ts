import {
  buildHubSpotContactName,
} from "@/features/hubspot/lib/mappers";
import { upsertHubSpotMapping } from "@/features/hubspot/lib/sync.repository";
import { getHubSpotContactCompanyIds, listHubSpotContacts } from "@/lib/hubspot";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncContactsOptions {
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

export async function syncHubSpotContacts(options: SyncContactsOptions = {}) {
  const contacts = await listHubSpotContacts();
  const supabase = createAdminClient();
  let processed = 0;

  for (const contact of contacts) {
    const properties = contact.properties ?? {};
    const name = buildHubSpotContactName(properties);

    if (!name) {
      continue;
    }

    const hubspotCompanyIds = await getHubSpotContactCompanyIds(contact.id);
    const portalCompanyId = await resolvePortalCompanyId(hubspotCompanyIds);

    if (!portalCompanyId) {
      continue;
    }

    if (options.companyId && portalCompanyId !== options.companyId) {
      continue;
    }

    const email = properties.email ?? null;
    const phone = properties.phone ?? null;
    const title = properties.jobtitle ?? null;

    let existingQuery = supabase
      .from("company_contacts")
      .select("id")
      .eq("company_id", portalCompanyId)
      .eq("name", name)
      .limit(1);

    if (email) {
      existingQuery = existingQuery.eq("email", email);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("company_contacts")
        .update({ phone, title })
        .eq("id", existing.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("company_contacts").insert({
        company_id: portalCompanyId,
        name,
        email,
        phone,
        title,
        is_primary: false,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    await upsertHubSpotMapping({
      entityType: "contact",
      hubspotId: contact.id,
      entityId: portalCompanyId,
      metadata: { name, email },
    });

    processed += 1;
  }

  return {
    fetched: contacts.length,
    processed,
  };
}
