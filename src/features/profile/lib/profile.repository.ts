import type { CompanyProfileInput, ContactInput } from "@/features/profile/schemas/profile.schema";
import type { ProfileData } from "@/features/profile/types/profile.types";
import { createClient } from "@/lib/supabase/server";

const COMPANY_COLUMNS =
  "id, name, email, phone, address, is_active, stripe_customer_id, hubspot_company_id, justcall_account_id, created_at, updated_at";

const USER_COLUMNS = "id, email, full_name, role, is_active, created_at, updated_at";

const CONTACT_COLUMNS =
  "id, company_id, name, email, phone, title, is_primary, created_at, updated_at";

export async function getProfileData(userId: string, companyId: string | null): Promise<ProfileData | null> {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (userError || !user) {
    return null;
  }

  if (!companyId) {
    return {
      user,
      company: null,
      contacts: [],
    };
  }

  const [companyResult, contactsResult] = await Promise.all([
    supabase.from("companies").select(COMPANY_COLUMNS).eq("id", companyId).maybeSingle(),
    supabase
      .from("company_contacts")
      .select(CONTACT_COLUMNS)
      .eq("company_id", companyId)
      .order("is_primary", { ascending: false })
      .order("name", { ascending: true }),
  ]);

  if (contactsResult.error) {
    throw new Error(contactsResult.error.message);
  }

  return {
    user,
    company: companyResult.data,
    contacts: contactsResult.data ?? [],
  };
}

export async function updateCompanyProfile(companyId: string, input: CompanyProfileInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    })
    .eq("id", companyId)
    .select(COMPANY_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserProfile(userId: string, fullName: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .update({ full_name: fullName })
    .eq("id", userId)
    .select(USER_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function clearPrimaryContact(companyId: string, excludeContactId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("company_contacts")
    .update({ is_primary: false })
    .eq("company_id", companyId)
    .eq("is_primary", true);

  if (excludeContactId) {
    query = query.neq("id", excludeContactId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCompanyContact(companyId: string, input: ContactInput) {
  const supabase = await createClient();

  if (input.isPrimary) {
    await clearPrimaryContact(companyId);
  }

  const { data, error } = await supabase
    .from("company_contacts")
    .insert({
      company_id: companyId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      title: input.title ?? null,
      is_primary: input.isPrimary,
    })
    .select(CONTACT_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCompanyContact(
  companyId: string,
  contactId: string,
  input: ContactInput,
) {
  const supabase = await createClient();

  if (input.isPrimary) {
    await clearPrimaryContact(companyId, contactId);
  }

  const { data, error } = await supabase
    .from("company_contacts")
    .update({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      title: input.title ?? null,
      is_primary: input.isPrimary,
    })
    .eq("id", contactId)
    .eq("company_id", companyId)
    .select(CONTACT_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCompanyContact(companyId: string, contactId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("company_contacts")
    .delete()
    .eq("id", contactId)
    .eq("company_id", companyId);

  if (error) {
    throw new Error(error.message);
  }
}
