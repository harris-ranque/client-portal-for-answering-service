export class HubSpotApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HubSpotApiError";
  }
}

export class HubSpotRateLimitError extends HubSpotApiError {
  constructor(message: string, public readonly retryAfterMs: number) {
    super(message, 429, "RATE_LIMITED");
    this.name = "HubSpotRateLimitError";
  }
}
