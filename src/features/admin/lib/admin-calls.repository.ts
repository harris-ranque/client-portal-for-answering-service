import { CALL_LOG_SORT_FIELDS } from "@/features/calls/schemas/call-logs-query.schema";
import type { CallLogsResult } from "@/features/calls/types/call-logs.types";
import type { AdminCallLogsQueryInput } from "@/features/admin/schemas/admin-calls-query.schema";
import { createClient } from "@/lib/supabase/server";

const CALL_LOG_COLUMNS =
  "id, company_id, external_id, call_date, caller_name, caller_number, direction, duration_seconds, agent_name, status, recording_url, notes, created_at, updated_at";

function toStartOfDayIso(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function toEndOfDayIso(date: string) {
  return new Date(`${date}T23:59:59.999Z`).toISOString();
}

function isValidSortField(sortBy: string) {
  return CALL_LOG_SORT_FIELDS.includes(sortBy as (typeof CALL_LOG_SORT_FIELDS)[number]);
}

export async function getAdminCallLogs(
  query: AdminCallLogsQueryInput,
): Promise<CallLogsResult & { companyNames: Record<string, string> }> {
  const supabase = await createClient();
  const sortBy = isValidSortField(query.sortBy) ? query.sortBy : "call_date";
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let builder = supabase.from("call_logs").select(CALL_LOG_COLUMNS, { count: "exact" });

  if (query.companyId) {
    builder = builder.eq("company_id", query.companyId);
  }

  if (query.search) {
    const term = `%${query.search}%`;
    builder = builder.or(
      `caller_name.ilike.${term},caller_number.ilike.${term},agent_name.ilike.${term},notes.ilike.${term}`,
    );
  }

  if (query.from) {
    builder = builder.gte("call_date", toStartOfDayIso(query.from));
  }

  if (query.to) {
    builder = builder.lte("call_date", toEndOfDayIso(query.to));
  }

  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  if (query.direction) {
    builder = builder.eq("direction", query.direction);
  }

  const { data, count, error } = await builder
    .order(sortBy, { ascending: query.sortOrder === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = [...new Set((data ?? []).map((call) => call.company_id))];
  const { data: companies } =
    companyIds.length > 0
      ? await supabase.from("companies").select("id, name").in("id", companyIds)
      : { data: [] as { id: string; name: string }[] };

  const companyNames = Object.fromEntries((companies ?? []).map((company) => [company.id, company.name]));
  const total = count ?? 0;

  return {
    data: data ?? [],
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
    companyNames,
  };
}
