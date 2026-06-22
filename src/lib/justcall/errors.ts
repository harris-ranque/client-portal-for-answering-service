export class JustCallApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "JustCallApiError";
  }
}

export class JustCallRateLimitError extends JustCallApiError {
  constructor(message: string, public readonly retryAfterMs: number) {
    super(message, 429, "RATE_LIMITED");
    this.name = "JustCallRateLimitError";
  }
}
