import {
  buildCompanyNumberMap,
  mapJustCallCallToCallLog,
  resolveCompanyIdForCall,
} from "@/features/justcall/lib/mappers";
import { listJustCallCalls } from "@/lib/justcall";
import type { JustCallCall } from "@/lib/justcall/types";
import { aggregateUsageForCompanies } from "@/features/usage/lib/aggregate-usage.service";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncCallsOptions {
  companyId?: string | null;
  fromDatetime?: string;
  toDatetime?: string;
  maxPages?: number;
}

async function getActiveCompanies(companyId?: string | null) {
  const supabase = createAdminClient();

  let query = supabase
    .from("companies")
    .select("id, name, justcall_account_id, is_active")
    .eq("is_active", true);

  if (companyId) {
    query = query.eq("id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function upsertCallLogs(records: ReturnType<typeof mapJustCallCallToCallLog>[]) {
  if (records.length === 0) {
    return 0;
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("call_logs").upsert(records, {
    onConflict: "company_id,external_id",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return records.length;
}

export async function syncJustCallCalls(options: SyncCallsOptions = {}) {
  const companies = await getActiveCompanies(options.companyId);

  if (companies.length === 0) {
    throw new Error("No active companies found for call sync.");
  }

  const companyByNumber = buildCompanyNumberMap(companies);
  const fallbackCompanyId =
    companies.length === 1 ? companies[0]?.id ?? null : options.companyId ?? null;

  const justcallNumber = options.companyId
    ? companies.find((company) => company.id === options.companyId)?.justcall_account_id ?? undefined
    : undefined;

  const calls = await listJustCallCalls({
    fromDatetime: options.fromDatetime,
    toDatetime: options.toDatetime,
    justcallNumber: justcallNumber ?? undefined,
    maxPages: options.maxPages,
  });

  const mapped = calls
    .map((call: JustCallCall) => {
      const resolvedCompanyId = resolveCompanyIdForCall(call, companyByNumber, fallbackCompanyId);

      if (!resolvedCompanyId) {
        return null;
      }

      return mapJustCallCallToCallLog(call, resolvedCompanyId);
    })
    .filter((record): record is NonNullable<typeof record> => record !== null);

  const processed = await upsertCallLogs(mapped);
  const affectedCompanyIds = [...new Set(mapped.map((record) => record.company_id))];

  if (affectedCompanyIds.length > 0) {
    await aggregateUsageForCompanies(affectedCompanyIds);
  }

  return {
    fetched: calls.length,
    processed,
    skipped: calls.length - mapped.length,
    companies: companies.map((company) => company.id),
  };
}
