import type { Tables } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export type AuditLogRecord = Tables<"audit_logs">;

export interface AdminAuditLogRow extends AuditLogRecord {
  actorEmail: string | null;
  companyName: string | null;
}

export interface AdminAuditLogFilters {
  companyId?: string;
  action?: string;
  limit?: number;
}

export async function getAdminAuditLogs(
  filters: AdminAuditLogFilters = {},
): Promise<AdminAuditLogRow[]> {
  const supabase = await createClient();
  const limit = filters.limit ?? 50;

  let query = supabase
    .from("audit_logs")
    .select(
      "id, actor_id, company_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  if (filters.action) {
    query = query.eq("action", filters.action);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const actorIds = [...new Set(rows.map((row) => row.actor_id).filter(Boolean))] as string[];
  const companyIds = [...new Set(rows.map((row) => row.company_id).filter(Boolean))] as string[];

  const [actorsResult, companiesResult] = await Promise.all([
    actorIds.length > 0
      ? supabase.from("users").select("id, email").in("id", actorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string }> }),
    companyIds.length > 0
      ? supabase.from("companies").select("id, name").in("id", companyIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
  ]);

  const actorById = Object.fromEntries((actorsResult.data ?? []).map((user) => [user.id, user.email]));
  const companyById = Object.fromEntries(
    (companiesResult.data ?? []).map((company) => [company.id, company.name]),
  );

  return rows.map((row) => ({
    ...row,
    actorEmail: row.actor_id ? (actorById[row.actor_id] ?? null) : null,
    companyName: row.company_id ? (companyById[row.company_id] ?? null) : null,
  }));
}
