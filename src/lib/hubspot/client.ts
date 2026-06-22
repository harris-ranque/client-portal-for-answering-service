import { HubSpotApiError, HubSpotRateLimitError } from "@/lib/hubspot/errors";
import { getHubSpotAccessToken, HUBSPOT_API_BASE_URL } from "@/lib/hubspot/config";
import type { HubSpotListResponse } from "@/lib/hubspot/types";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

interface HubSpotRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  maxRetries?: number;
}

function buildQueryString(query: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function parseRetryAfterMs(response: Response) {
  const header = response.headers.get("retry-after");

  if (!header) {
    return DEFAULT_RETRY_DELAY_MS;
  }

  const seconds = Number(header);

  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  return DEFAULT_RETRY_DELAY_MS;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }

  return fallback;
}

export async function hubSpotRequest<T>(
  path: string,
  options: HubSpotRequestOptions = {},
): Promise<T> {
  const token = getHubSpotAccessToken();
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const method = options.method ?? "GET";
  const query = buildQueryString(options.query ?? {});
  const url = `${HUBSPOT_API_BASE_URL}${path}${query}`;

  let attempt = 0;

  while (attempt <= maxRetries) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (response.status === 429 && attempt < maxRetries) {
      await sleep(parseRetryAfterMs(response));
      attempt += 1;
      continue;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = extractErrorMessage(
        payload,
        `HubSpot API request failed with status ${response.status}.`,
      );

      if (response.status === 429) {
        throw new HubSpotRateLimitError(message, parseRetryAfterMs(response));
      }

      throw new HubSpotApiError(message, response.status);
    }

    return payload as T;
  }

  throw new HubSpotRateLimitError("HubSpot rate limit exceeded.", DEFAULT_RETRY_DELAY_MS);
}

export async function hubSpotListAllPages<T>(
  path: string,
  options: {
    query?: Record<string, string | number | boolean | undefined>;
    limit?: number;
    maxPages?: number;
  } = {},
) {
  const limit = options.limit ?? 100;
  const maxPages = options.maxPages ?? 50;
  const items: T[] = [];
  let after: string | undefined;
  let page = 0;

  while (page < maxPages) {
    const response = await hubSpotRequest<HubSpotListResponse<T>>(path, {
      query: {
        ...options.query,
        limit,
        ...(after ? { after } : {}),
      },
    });

    items.push(...(response.results ?? []));

    after = response.paging?.next?.after;

    if (!after) {
      break;
    }

    page += 1;
  }

  return items;
}
