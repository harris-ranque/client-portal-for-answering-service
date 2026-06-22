import { isPlaceholderEnv, serverEnv } from "@/lib/env";

export const JUSTCALL_API_BASE_URL = "https://api.justcall.io";

export function isJustCallConfigured() {
  const apiKey = serverEnv.JUSTCALL_API_KEY;
  const apiSecret = serverEnv.JUSTCALL_API_SECRET;

  return Boolean(
    apiKey && apiSecret && !isPlaceholderEnv(apiKey) && !isPlaceholderEnv(apiSecret),
  );
}

export function getJustCallCredentials() {
  if (!isJustCallConfigured()) {
    throw new Error(
      "JustCall is not configured. Set JUSTCALL_API_KEY and JUSTCALL_API_SECRET in your environment.",
    );
  }

  return {
    apiKey: serverEnv.JUSTCALL_API_KEY!,
    apiSecret: serverEnv.JUSTCALL_API_SECRET!,
  };
}
