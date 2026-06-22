import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminConfig();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
