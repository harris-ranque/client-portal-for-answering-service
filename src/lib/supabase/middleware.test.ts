import { describe, expect, it } from "vitest";

import { mapAuthUserToSessionUser } from "@/features/auth/lib/session";
import { isAdminRoute, isProtectedRoute } from "@/features/auth/lib/routes";
import { APP_ROUTES, USER_ROLES } from "@/lib/constants";

const adminAuthUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "admin@clientportal.local",
  app_metadata: { role: USER_ROLES.admin },
};

const clientAuthUser = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "client@acme.example.com",
  app_metadata: {
    role: USER_ROLES.client,
    company_id: "33333333-3333-3333-3333-333333333333",
  },
};

describe("middleware portal separation", () => {
  it("treats client routes as protected and admin routes separately", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/admin")).toBe(false);
    expect(isAdminRoute("/admin/clients")).toBe(true);
  });

  it("maps system admins away from client-only areas", () => {
    const sessionUser = mapAuthUserToSessionUser(adminAuthUser as never);

    expect(sessionUser.role).toBe(USER_ROLES.admin);
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(APP_ROUTES.admin.root).toBe("/admin");
  });

  it("keeps client users on client routes", () => {
    const sessionUser = mapAuthUserToSessionUser(clientAuthUser as never);

    expect(sessionUser.role).toBe(USER_ROLES.client);
    expect(isAdminRoute("/admin")).toBe(true);
    expect(APP_ROUTES.dashboard).toBe("/dashboard");
  });
});
