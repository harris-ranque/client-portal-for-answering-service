import { listJustCallContacts } from "@/lib/justcall";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncContactsOptions {
  companyId?: string | null;
  maxPages?: number;
}

async function getTargetCompanyId(companyId?: string | null) {
  const supabase = createAdminClient();

  if (companyId) {
    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Target company not found or inactive.");
    }

    return data.id;
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No active company available for contact sync.");
  }

  return data.id;
}

export async function syncJustCallContacts(options: SyncContactsOptions = {}) {
  const companyId = await getTargetCompanyId(options.companyId);
  const contacts = await listJustCallContacts({ maxPages: options.maxPages });
  const supabase = createAdminClient();

  let processed = 0;

  for (const contact of contacts) {
    if (!contact.name) {
      continue;
    }

    const email = contact.email ?? null;
    const phone = contact.phone ?? contact.mobile ?? null;

    let existingQuery = supabase
      .from("company_contacts")
      .select("id")
      .eq("company_id", companyId)
      .eq("name", contact.name)
      .limit(1);

    if (email) {
      existingQuery = existingQuery.eq("email", email);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("company_contacts")
        .update({
          phone,
          title: contact.title ?? contact.company ?? null,
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("company_contacts").insert({
        company_id: companyId,
        name: contact.name,
        email,
        phone,
        title: contact.title ?? contact.company ?? null,
        is_primary: false,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    processed += 1;
  }

  return {
    fetched: contacts.length,
    processed,
    companyId,
  };
}
