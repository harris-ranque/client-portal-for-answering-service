import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export interface WriteAuditLogInput {
  actorId: string;
  companyId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    company_id: input.companyId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
