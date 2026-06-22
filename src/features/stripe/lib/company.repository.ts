import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveCompanyByStripeCustomerId(stripeCustomerId: string) {
  const supabase = createAdminClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (company?.id) {
    return company.id;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("company_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return subscription?.company_id ?? null;
}

export async function ensureCompanyStripeCustomerId(companyId: string, stripeCustomerId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("companies")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", companyId)
    .is("stripe_customer_id", null);

  if (error) {
    throw new Error(error.message);
  }
}
