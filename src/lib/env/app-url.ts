import { isPlaceholderEnv } from "@/lib/env";

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (configured && !isPlaceholderEnv(configured)) {
    return normalizeUrl(configured);
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function getRequestOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;

  if (
    configured &&
    !isPlaceholderEnv(configured) &&
    !configured.includes("localhost") &&
    !configured.includes("127.0.0.1")
  ) {
    return normalizeUrl(configured);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();

    if (host) {
      return `${forwardedProto}://${host}`;
    }
  }

  return new URL(request.url).origin;
}
