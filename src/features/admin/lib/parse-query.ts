import { z } from "zod";

import { clientsQuerySchema } from "@/features/admin/schemas/client.schema";
import { usersQuerySchema } from "@/features/admin/schemas/user.schema";
import { adminCallLogsQuerySchema } from "@/features/admin/schemas/admin-calls-query.schema";

function normalizeSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export function parseClientsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return clientsQuerySchema.parse(normalizeSearchParams(searchParams));
}

export function parseUsersSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return usersQuerySchema.parse(normalizeSearchParams(searchParams));
}

export function parseAdminCallsSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return adminCallLogsQuerySchema.parse(normalizeSearchParams(searchParams));
}

export function toAdminCallsSearchRecord(
  query: z.infer<typeof adminCallLogsQuerySchema>,
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
    companyId: query.companyId,
  };
}
