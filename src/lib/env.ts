import { z } from "zod";

function emptyToUndefined(value: string | undefined) {
  return value === "" ? undefined : value;
}

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  /** @deprecated Use SUPABASE_SECRET_KEY */
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  JUSTCALL_API_KEY: z.string().min(1).optional(),
  JUSTCALL_API_SECRET: z.string().min(1).optional(),
  HUBSPOT_ACCESS_TOKEN: z.string().min(1).optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Client Portal"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  /** @deprecated Use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY */
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

function parseEnv<T extends z.ZodTypeAny>(schema: T, env: Record<string, string | undefined>) {
  const result = schema.safeParse(env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  return result.data;
}

export const serverEnv = parseEnv(serverEnvSchema, {
  SUPABASE_SECRET_KEY: emptyToUndefined(process.env.SUPABASE_SECRET_KEY),
  SUPABASE_SERVICE_ROLE_KEY: emptyToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
  STRIPE_SECRET_KEY: emptyToUndefined(process.env.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: emptyToUndefined(process.env.STRIPE_WEBHOOK_SECRET),
  JUSTCALL_API_KEY: emptyToUndefined(process.env.JUSTCALL_API_KEY),
  JUSTCALL_API_SECRET: emptyToUndefined(process.env.JUSTCALL_API_SECRET),
  HUBSPOT_ACCESS_TOKEN: emptyToUndefined(process.env.HUBSPOT_ACCESS_TOKEN),
});

export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_APP_URL: emptyToUndefined(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_APP_NAME: emptyToUndefined(process.env.NEXT_PUBLIC_APP_NAME),
  NEXT_PUBLIC_SUPABASE_URL: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: emptyToUndefined(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyToUndefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: emptyToUndefined(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ),
});

export function isPlaceholderEnv(value: string | undefined) {
  return value?.startsWith("placeholder_") ?? false;
}

/** Resolves publishable key (sb_publishable_...) with legacy anon JWT fallback. */
export function getSupabasePublishableKey() {
  return (
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Resolves secret key (sb_secret_...) with legacy service_role JWT fallback. */
export function getSupabaseSecretKey() {
  return serverEnv.SUPABASE_SECRET_KEY ?? serverEnv.SUPABASE_SERVICE_ROLE_KEY;
}
