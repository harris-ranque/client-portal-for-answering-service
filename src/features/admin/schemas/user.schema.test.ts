import { describe, expect, it } from "vitest";

import { inviteUserSchema } from "@/features/admin/schemas/user.schema";
import { USER_ROLES } from "@/lib/constants";

describe("inviteUserSchema", () => {
  it("requires company for client users", () => {
    const result = inviteUserSchema.safeParse({
      email: "client@example.com",
      fullName: "Client User",
      role: USER_ROLES.client,
    });

    expect(result.success).toBe(false);
  });

  it("allows system admin invites without a company", () => {
    const result = inviteUserSchema.safeParse({
      email: "admin@example.com",
      fullName: "System Admin",
      role: USER_ROLES.admin,
    });

    expect(result.success).toBe(true);
  });
});
