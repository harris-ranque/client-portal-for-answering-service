import { JustCallApiError, JustCallRateLimitError } from "@/lib/justcall/errors";
import { getJustCallCredentials, JUSTCALL_API_BASE_URL } from "@/lib/justcall/config";
import type { JustCallApiResponse } from "@/lib/justcall/types";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

interface JustCallRequestOptions {
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

  const date = Date.parse(header);

  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return DEFAULT_RETRY_DELAY_MS;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function justCallRequest<T>(
  path: string,
  options: JustCallRequestOptions = {},
): Promise<JustCallApiResponse<T>> {
  const { apiKey, apiSecret } = getJustCallCredentials();
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const method = options.method ?? "GET";
  const query = buildQueryString(options.query ?? {});
  const url = `${JUSTCALL_API_BASE_URL}${path}${query}`;

  let attempt = 0;

  while (attempt <= maxRetries) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `${apiKey}:${apiSecret}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    if (response.status === 429 && attempt < maxRetries) {
      const retryAfterMs = parseRetryAfterMs(response);
      await sleep(retryAfterMs);
      attempt += 1;
      continue;
    }

    const payload = (await response.json().catch(() => ({}))) as JustCallApiResponse<T>;

    if (!response.ok) {
      const message =
        payload.message ??
        (typeof payload.data === "string" ? payload.data : undefined) ??
        `JustCall API request failed with status ${response.status}.`;

      if (response.status === 429) {
        throw new JustCallRateLimitError(message, parseRetryAfterMs(response));
      }

      throw new JustCallApiError(message, response.status);
    }

    return payload;
  }

  throw new JustCallRateLimitError("JustCall rate limit exceeded.", DEFAULT_RETRY_DELAY_MS);
}

export async function justCallGetAllPages<T>(
  path: string,
  options: {
    query?: Record<string, string | number | boolean | undefined>;
    perPage?: number;
    maxPages?: number;
    getItems: (response: JustCallApiResponse<T[]>) => T[];
    getNextPage?: (response: JustCallApiResponse<T[]>, page: number) => number | null;
  },
) {
  const perPage = options.perPage ?? 100;
  const maxPages = options.maxPages ?? 50;
  const items: T[] = [];
  let page = 1;
  let lastCallIdFetched: number | undefined;

  while (page <= maxPages) {
    const response = await justCallRequest<T[]>(path, {
      query: {
        ...options.query,
        page,
        per_page: perPage,
        ...(lastCallIdFetched ? { last_call_id_fetched: lastCallIdFetched } : {}),
      },
    });

    const batch = options.getItems(response);

    if (batch.length === 0) {
      break;
    }

    items.push(...batch);

    const lastItem = batch[batch.length - 1] as { id?: number };

    if (typeof lastItem?.id === "number") {
      lastCallIdFetched = lastItem.id;
    }

    const nextPage = options.getNextPage?.(response, page);

    if (nextPage) {
      page = nextPage;
      continue;
    }

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return items;
}
