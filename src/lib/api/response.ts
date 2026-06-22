import type { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from "@/types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>,
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, details },
  };
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !isApiSuccess(payload)) {
    const error = !isApiSuccess(payload)
      ? payload.error
      : { code: "UNKNOWN_ERROR", message: "An unexpected error occurred." };

    throw new ApiClientError(
      error.message,
      error.code,
      response.status,
      "details" in error ? error.details : undefined,
    );
  }

  return payload.data;
}
