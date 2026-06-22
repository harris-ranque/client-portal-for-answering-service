import { getCurrentMonthBounds } from "@/features/usage/lib/periods";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type CallStatus = Database["public"]["Enums"]["call_status"];

export interface CallLogAggregateInput {
  duration_seconds: number;
  status: CallStatus;
}

export interface AggregatedUsage {
  minutesUsed: number;
  callsAnswered: number;
  callsMissed: number;
  averageDurationSeconds: number;
}

const MISSED_STATUSES: ReadonlySet<CallStatus> = new Set([
  "missed",
  "voicemail",
  "busy",
  "failed",
  "cancelled",
]);

function toStartOfDayIso(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function toEndOfDayIso(date: string) {
  return new Date(`${date}T23:59:59.999Z`).toISOString();
}

export function aggregateCallLogs(callLogs: CallLogAggregateInput[]): AggregatedUsage {
  if (callLogs.length === 0) {
    return {
      minutesUsed: 0,
      callsAnswered: 0,
      callsMissed: 0,
      averageDurationSeconds: 0,
    };
  }

  let totalDurationSeconds = 0;
  let callsAnswered = 0;
  let callsMissed = 0;

  for (const call of callLogs) {
    totalDurationSeconds += call.duration_seconds;

    if (call.status === "answered") {
      callsAnswered += 1;
    } else if (MISSED_STATUSES.has(call.status)) {
      callsMissed += 1;
    }
  }

  const minutesUsed = Math.round((totalDurationSeconds / 60) * 100) / 100;
  const averageDurationSeconds = Math.round(totalDurationSeconds / callLogs.length);

  return {
    minutesUsed,
    callsAnswered,
    callsMissed,
    averageDurationSeconds,
  };
}

export async function aggregateUsageForCompany(
  companyId: string,
  periodStart: string,
  periodEnd: string,
): Promise<AggregatedUsage> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("call_logs")
    .select("duration_seconds, status")
    .eq("company_id", companyId)
    .gte("call_date", toStartOfDayIso(periodStart))
    .lte("call_date", toEndOfDayIso(periodEnd));

  if (error) {
    throw new Error(error.message);
  }

  const aggregated = aggregateCallLogs(data ?? []);

  const { error: upsertError } = await supabase.from("usage_metrics").upsert(
    {
      company_id: companyId,
      period_start: periodStart,
      period_end: periodEnd,
      minutes_used: aggregated.minutesUsed,
      calls_answered: aggregated.callsAnswered,
      calls_missed: aggregated.callsMissed,
      average_duration_seconds: aggregated.averageDurationSeconds,
    },
    { onConflict: "company_id,period_start,period_end" },
  );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return aggregated;
}

export async function aggregateUsageForCompanies(companyIds: string[]) {
  const uniqueCompanyIds = [...new Set(companyIds.filter(Boolean))];

  if (uniqueCompanyIds.length === 0) {
    return [];
  }

  const { start, end } = getCurrentMonthBounds();

  return Promise.all(
    uniqueCompanyIds.map((companyId) => aggregateUsageForCompany(companyId, start, end)),
  );
}

export async function recalculateUsageForAllActiveCompanies() {
  const supabase = createAdminClient();
  const { start, end } = getCurrentMonthBounds();

  const { data, error } = await supabase.from("companies").select("id").eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const companyIds = (data ?? []).map((company) => company.id);
  const results = await Promise.all(
    companyIds.map((companyId) => aggregateUsageForCompany(companyId, start, end)),
  );

  return {
    companiesProcessed: companyIds.length,
    periodStart: start,
    periodEnd: end,
    results,
  };
}
