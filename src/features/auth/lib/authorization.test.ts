import { describe, expect, it } from "vitest";

import { hasRole, isAdmin, isClient } from "@/features/auth/lib/authorization";
import { USER_ROLES } from "@/lib/constants";
import type { SessionUser } from "@/types";

const adminUser: SessionUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "admin@clientportal.local",
  role: "admin",
  companyId: null,
};

const clientUser: SessionUser = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "client@acme.example.com",
  role: "client",
  companyId: "33333333-3333-3333-3333-333333333333",
};

describe("authorization helpers", () => {
  it("checks roles", () => {
    expect(hasRole(adminUser, USER_ROLES.admin)).toBe(true);
    expect(hasRole(clientUser, USER_ROLES.admin)).toBe(false);
    expect(isAdmin(adminUser)).toBe(true);
    expect(isClient(clientUser)).toBe(true);
  });
});
