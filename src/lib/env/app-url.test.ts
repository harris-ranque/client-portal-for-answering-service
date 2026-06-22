import { describe, expect, it, afterEach } from "vitest";

import { getAppUrl, getRequestOrigin } from "@/lib/env/app-url";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("app url helpers", () => {
  it("prefers configured app url", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://portal.example.com";

    expect(getAppUrl()).toBe("https://portal.example.com");
  });

  it("falls back to vercel url", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.VERCEL_URL = "client-portal.vercel.app";

    expect(getAppUrl()).toBe("https://client-portal.vercel.app");
  });

  it("uses forwarded host headers for request origin", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    const request = new Request("http://localhost:3000/auth/callback", {
      headers: {
        "x-forwarded-host": "client-portal.vercel.app",
        "x-forwarded-proto": "https",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://client-portal.vercel.app");
  });
});
