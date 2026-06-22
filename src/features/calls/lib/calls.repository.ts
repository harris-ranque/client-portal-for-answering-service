import { CALL_LOG_SORT_FIELDS } from "@/features/calls/schemas/call-logs-query.schema";
import type { CallLogsQuery, CallLogsResult } from "@/features/calls/types/call-logs.types";
import { createClient } from "@/lib/supabase/server";

const EXPORT_MAX_ROWS = 10_000;

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

type FilterableQuery = {
  eq: (column: string, value: string) => FilterableQuery;
  gte: (column: string, value: string) => FilterableQuery;
  lte: (column: string, value: string) => FilterableQuery;
  or: (filters: string) => FilterableQuery;
};

function applyCallLogFilters<T extends FilterableQuery>(
  query: T,
  filters: Omit<CallLogsQuery, "page" | "pageSize" | "sortBy" | "sortOrder">,
): T {
  let builder = query.eq("company_id", filters.companyId) as T;

  if (filters.search) {
    const term = `%${filters.search}%`;
    builder = builder.or(
      `caller_name.ilike.${term},caller_number.ilike.${term},agent_name.ilike.${term},notes.ilike.${term}`,
    ) as T;
  }

  if (filters.from) {
    builder = builder.gte("call_date", toStartOfDayIso(filters.from)) as T;
  }

  if (filters.to) {
    builder = builder.lte("call_date", toEndOfDayIso(filters.to)) as T;
  }

  if (filters.status) {
    builder = builder.eq("status", filters.status) as T;
  }

  if (filters.direction) {
    builder = builder.eq("direction", filters.direction) as T;
  }

  return builder;
}

export async function getCallLogs(query: CallLogsQuery): Promise<CallLogsResult> {
  const supabase = await createClient();
  const sortBy = isValidSortField(query.sortBy) ? query.sortBy : "call_date";
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  const baseQuery = applyCallLogFilters(
    supabase.from("call_logs").select(CALL_LOG_COLUMNS, { count: "exact" }),
    query,
  );

  const { data, count, error } = await baseQuery
    .order(sortBy, { ascending: query.sortOrder === "asc" })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: data ?? [],
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getCallLogsForExport(query: Omit<CallLogsQuery, "page" | "pageSize">) {
  const supabase = await createClient();
  const sortBy = isValidSortField(query.sortBy) ? query.sortBy : "call_date";

  const { data, error } = await applyCallLogFilters(
    supabase.from("call_logs").select(CALL_LOG_COLUMNS),
    query,
  )
    .order(sortBy, { ascending: query.sortOrder === "asc" })
    .limit(EXPORT_MAX_ROWS);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
