import { isPlaceholderEnv } from "@/lib/env";
import { getAppUrl } from "@/lib/env/app-url";

function normalizeOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch {
    return origin.replace(/\/$/, "");
  }
}

export function getAllowedOrigins() {
  const origins = new Set<string>();

  origins.add(normalizeOrigin(getAppUrl()));
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");

  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (configured && !isPlaceholderEnv(configured)) {
    origins.add(normalizeOrigin(configured));
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    origins.add(normalizeOrigin(`https://${vercelUrl}`));
  }

  return [...origins];
}

export function isOriginAllowed(origin: string | null, allowedOrigins = getAllowedOrigins()) {
  if (!origin) {
    return false;
  }

  const normalized = normalizeOrigin(origin);
  return allowedOrigins.some((allowed) => normalizeOrigin(allowed) === normalized);
}

export function validateRequestOrigin(
  request: Request,
  allowedOrigins = getAllowedOrigins(),
): { valid: true } | { valid: false; origin: string | null } {
  const origin = request.headers.get("origin");

  if (isOriginAllowed(origin, allowedOrigins)) {
    return { valid: true };
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;

      if (isOriginAllowed(refererOrigin, allowedOrigins)) {
        return { valid: true };
      }
    } catch {
      // Ignore malformed referer values.
    }
  }

  return { valid: false, origin };
}
