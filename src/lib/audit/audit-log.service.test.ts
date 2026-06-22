import { describe, expect, it } from "vitest";

import type { WriteAuditLogInput } from "@/lib/audit/audit-log.service";

function buildAuditLogPayload(input: WriteAuditLogInput) {
  return {
    actor_id: input.actorId,
    company_id: input.companyId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  };
}

describe("audit log payload", () => {
  it("normalizes optional fields", () => {
    expect(
      buildAuditLogPayload({
        actorId: "11111111-1111-1111-1111-111111111111",
        action: "client.create",
        entityType: "company",
      }),
    ).toEqual({
      actor_id: "11111111-1111-1111-1111-111111111111",
      company_id: null,
      action: "client.create",
      entity_type: "company",
      entity_id: null,
      metadata: {},
      ip_address: null,
      user_agent: null,
    });
  });

  it("preserves metadata and scoped company id", () => {
    expect(
      buildAuditLogPayload({
        actorId: "11111111-1111-1111-1111-111111111111",
        companyId: "22222222-2222-2222-2222-222222222222",
        action: "onboarding.update",
        entityType: "onboarding",
        entityId: "33333333-3333-3333-3333-333333333333",
        metadata: { status: "completed" },
      }).metadata,
    ).toEqual({ status: "completed" });
  });
});
