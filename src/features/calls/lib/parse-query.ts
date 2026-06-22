import { callLogsQuerySchema } from "@/features/calls/schemas/call-logs-query.schema";

export function parseCallLogsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return callLogsQuerySchema.parse(normalized);
}

export function toCallLogsSearchRecord(
  query: ReturnType<typeof parseCallLogsSearchParams>,
): Record<string, string | undefined> {
  return {
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    search: query.search,
    from: query.from,
    to: query.to,
    status: query.status,
    direction: query.direction,
  };
}
