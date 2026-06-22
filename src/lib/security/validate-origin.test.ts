import { describe, expect, it, afterEach } from "vitest";

import {
  getAllowedOrigins,
  isOriginAllowed,
  validateRequestOrigin,
} from "@/lib/security/validate-origin";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("validate-origin", () => {
  it("allows configured app origins", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    expect(isOriginAllowed("https://portal.example.com", getAllowedOrigins())).toBe(true);
    expect(isOriginAllowed("https://evil.example.com", getAllowedOrigins())).toBe(false);
  });

  it("accepts matching Origin header", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    const request = new Request("https://portal.example.com/api/billing/portal", {
      method: "POST",
      headers: { Origin: "https://portal.example.com" },
    });

    expect(validateRequestOrigin(request).valid).toBe(true);
  });

  it("accepts matching Referer when Origin is absent", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    const request = new Request("https://portal.example.com/api/billing/portal", {
      method: "POST",
      headers: { Referer: "https://portal.example.com/billing" },
    });

    expect(validateRequestOrigin(request).valid).toBe(true);
  });

  it("rejects unknown origins", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    const request = new Request("https://portal.example.com/api/billing/portal", {
      method: "POST",
      headers: { Origin: "https://attacker.example.com" },
    });

    expect(validateRequestOrigin(request)).toEqual({
      valid: false,
      origin: "https://attacker.example.com",
    });
  });
});
