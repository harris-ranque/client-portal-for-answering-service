import { describe, expect, it } from "vitest";

import {
  getSafeRedirectPath,
  isAdminRoute,
  isApiRoute,
  isAuthOnlyRoute,
  isProtectedRoute,
  isPublicRoute,
} from "@/features/auth/lib/routes";

describe("auth route helpers", () => {
  it("identifies public routes", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/forgot-password")).toBe(true);
    expect(isPublicRoute("/reset-password")).toBe(true);
    expect(isPublicRoute("/accept-invitation")).toBe(true);
    expect(isPublicRoute("/auth/callback")).toBe(true);
    expect(isPublicRoute("/api/health")).toBe(true);
    expect(isPublicRoute("/dashboard")).toBe(false);
  });

  it("normalizes trailing slashes", () => {
    expect(isPublicRoute("/login/")).toBe(true);
    expect(isProtectedRoute("/billing/")).toBe(true);
  });

  it("identifies protected and admin routes", () => {
    expect(isProtectedRoute("/calls")).toBe(true);
    expect(isProtectedRoute("/calls/123")).toBe(true);
    expect(isProtectedRoute("/admin")).toBe(false);
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/clients")).toBe(true);
  });

  it("identifies auth-only and api routes", () => {
    expect(isAuthOnlyRoute("/login")).toBe(true);
    expect(isAuthOnlyRoute("/forgot-password")).toBe(true);
    expect(isAuthOnlyRoute("/reset-password")).toBe(false);
    expect(isAuthOnlyRoute("/dashboard")).toBe(false);
    expect(isApiRoute("/api/calls")).toBe(true);
    expect(isApiRoute("/calls")).toBe(false);
  });

  it("returns safe redirect paths", () => {
    expect(getSafeRedirectPath("/dashboard", "/login")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.com", "/login")).toBe("/login");
    expect(getSafeRedirectPath("https://evil.com", "/login")).toBe("/login");
    expect(getSafeRedirectPath(null, "/login")).toBe("/login");
  });
});
