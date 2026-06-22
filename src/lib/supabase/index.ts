export { createClient as createBrowserClient } from "@/lib/supabase/client";
export {
  getSupabaseAdminConfig,
  getSupabasePublicConfig,
  getSupabasePublicConfigOrNull,
  isSupabaseAdminConfigured,
  isSupabaseAnonKeyPlaceholder,
  isSupabaseConfigured,
  isSupabaseServiceRoleKeyPlaceholder,
  isSupabaseUrlPlaceholder,
} from "@/lib/supabase/config";
