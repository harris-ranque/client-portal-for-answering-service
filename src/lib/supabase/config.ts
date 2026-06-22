import {
  clientEnv,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  isPlaceholderEnv,
} from "@/lib/env";

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

export function isSupabasePublishableKeyPlaceholder(key: string | undefined) {
  return !key || isPlaceholderEnv(key);
}

export function isSupabaseSecretKeyPlaceholder(key: string | undefined) {
  return !key || isPlaceholderEnv(key);
}

export function isSupabaseConfigured() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = getSupabasePublishableKey();

  return Boolean(
    url &&
      publishableKey &&
      !isSupabaseUrlPlaceholder(url) &&
      !isSupabasePublishableKeyPlaceholder(publishableKey),
  );
}

export function isSupabaseAdminConfigured() {
  const secretKey = getSupabaseSecretKey();

  return (
    isSupabaseConfigured() &&
    Boolean(secretKey) &&
    !isSupabaseSecretKeyPlaceholder(secretKey)
  );
}

export function getSupabasePublicConfig() {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is using placeholder credentials. Replace them with values from your Supabase project.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseAdminConfig() {
  const { url } = getSupabasePublicConfig();
  const secretKey = getSupabaseSecretKey();

  if (!secretKey || isSupabaseSecretKeyPlaceholder(secretKey)) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SECRET_KEY with a valid secret key.",
    );
  }

  return { url, secretKey };
}

export function getSupabasePublicConfigOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return {
    url: clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: getSupabasePublishableKey()!,
  };
}
