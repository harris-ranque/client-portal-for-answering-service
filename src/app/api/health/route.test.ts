import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns service status", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");
    expect(body.status).toBe("ok");
    expect(body.app).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
    expect(body.services.supabase).toMatchObject({
      configured: expect.any(Boolean),
      adminConfigured: expect.any(Boolean),
    });
  });
});
