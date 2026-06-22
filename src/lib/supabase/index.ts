export { createClient as createBrowserClient } from "@/lib/supabase/client";
export {
  getSupabaseAdminConfig,
  getSupabasePublicConfig,
  getSupabasePublicConfigOrNull,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  isSupabasePublishableKeyPlaceholder,
  isSupabaseSecretKeyPlaceholder,
  isSupabaseUrlPlaceholder,
} from "@/lib/supabase/config";
