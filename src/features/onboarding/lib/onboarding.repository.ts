import type { OnboardingRecord } from "@/features/onboarding/types/onboarding.types";
import { createClient } from "@/lib/supabase/server";

const ONBOARDING_COLUMNS =
  "id, company_id, status, current_step, completed_steps, hubspot_deal_id, notes, completed_at, created_at, updated_at";

export async function getCompanyOnboarding(companyId: string): Promise<OnboardingRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onboarding")
    .select(ONBOARDING_COLUMNS)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
