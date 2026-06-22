import { clientEnv, isPlaceholderEnv, serverEnv } from "@/lib/env";

const PLACEHOLDER_SUPABASE_HOST = "placeholder.supabase.co";

export function isSupabaseUrlPlaceholder(url: string | undefined) {
  if (!url) {
    return true;
  }

  try {
    return new URL(url).hostname === PLACEHOLDER_SUPABASE_HOST;
  } catch {
    return true;
  }
}

export function isSupabaseAnonKeyPlaceholder(key: string | undefined) {
  return !key || isPlaceholderEnv(key);
}

export function isSupabaseServiceRoleKeyPlaceholder(key: string | undefined) {
  return !key || isPlaceholderEnv(key);
}

export function isSupabaseConfigured() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url && anonKey && !isSupabaseUrlPlaceholder(url) && !isSupabaseAnonKeyPlaceholder(anonKey),
  );
}

export function isSupabaseAdminConfigured() {
  return (
    isSupabaseConfigured() &&
    Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY) &&
    !isSupabaseServiceRoleKeyPlaceholder(serverEnv.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function getSupabasePublicConfig() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is using placeholder credentials. Replace them with values from your Supabase project.",
    );
  }

  return { url, anonKey };
}

export function getSupabaseAdminConfig() {
  const { url } = getSupabasePublicConfig();
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || isSupabaseServiceRoleKeyPlaceholder(serviceRoleKey)) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY with a valid service role key.",
    );
  }

  return { url, serviceRoleKey };
}

export function getSupabasePublicConfigOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return {
    url: clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
