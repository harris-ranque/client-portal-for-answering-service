import { describe, expect, it } from "vitest";

import {
  ApiClientError,
  createErrorResponse,
  createSuccessResponse,
  isApiSuccess,
} from "@/lib/api/response";

describe("api response helpers", () => {
  it("creates success and error payloads", () => {
    expect(createSuccessResponse({ ok: true })).toEqual({
      success: true,
      data: { ok: true },
    });

    expect(createErrorResponse("TEST_ERROR", "Something failed")).toEqual({
      success: false,
      error: {
        code: "TEST_ERROR",
        message: "Something failed",
        details: undefined,
      },
    });
  });

  it("narrows success responses", () => {
    const success = createSuccessResponse("value");
    const failure = createErrorResponse("ERR", "nope");

    expect(isApiSuccess(success)).toBe(true);
    expect(isApiSuccess(failure)).toBe(false);
  });

  it("creates typed client errors", () => {
    const error = new ApiClientError("Bad request", "BAD_REQUEST", 400, {
      email: ["Invalid email"],
    });

    expect(error.name).toBe("ApiClientError");
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.details?.email).toEqual(["Invalid email"]);
  });
});
