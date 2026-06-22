import type { JustCallCall } from "@/lib/justcall/types";
import type { TablesInsert } from "@/types/database";

type CallLogInsert = TablesInsert<"call_logs">;

function normalizePhone(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

export function mapJustCallDirection(direction: string | undefined): "inbound" | "outbound" {
  const normalized = direction?.toLowerCase() ?? "";

  if (normalized.includes("incoming") || normalized.includes("inbound")) {
    return "inbound";
  }

  return "outbound";
}

export function mapJustCallStatus(
  callType: string | undefined,
): "answered" | "missed" | "voicemail" | "busy" | "failed" | "cancelled" {
  const normalized = callType?.toLowerCase() ?? "";

  if (normalized.includes("answered")) {
    return "answered";
  }

  if (normalized.includes("voicemail")) {
    return "voicemail";
  }

  if (normalized.includes("busy")) {
    return "busy";
  }

  if (normalized.includes("failed")) {
    return "failed";
  }

  if (normalized.includes("cancelled") || normalized.includes("canceled")) {
    return "cancelled";
  }

  return "missed";
}

export function buildJustCallExternalId(call: JustCallCall) {
  return call.call_sid ?? `jc-${call.id}`;
}

export function buildJustCallCallDate(call: JustCallCall) {
  if (!call.call_date) {
    return new Date().toISOString();
  }

  const time = call.call_time ?? "00:00:00";
  const isoCandidate = `${call.call_date}T${time}Z`;

  const parsed = new Date(isoCandidate);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(call.call_date).toISOString();
  }

  return parsed.toISOString();
}

export function mapJustCallCallToCallLog(
  call: JustCallCall,
  companyId: string,
): CallLogInsert {
  const callInfo = call.call_info ?? {};

  return {
    company_id: companyId,
    external_id: buildJustCallExternalId(call),
    call_date: buildJustCallCallDate(call),
    caller_name: call.contact_name ?? null,
    caller_number: call.contact_number ?? null,
    direction: mapJustCallDirection(callInfo.direction),
    duration_seconds: Math.max(0, Math.round(call.call_duration?.total_duration ?? 0)),
    agent_name: call.agent_name ?? null,
    status: mapJustCallStatus(callInfo.type),
    recording_url: callInfo.recording ?? null,
    notes: callInfo.notes ?? null,
  };
}

export function resolveCompanyIdForCall(
  call: JustCallCall,
  companyByNumber: Map<string, string>,
  fallbackCompanyId: string | null,
) {
  const candidates = [call.justcall_number, call.justcall_line_name]
    .filter(Boolean)
    .map((value) => normalizePhone(String(value)));

  for (const candidate of candidates) {
    const companyId = companyByNumber.get(candidate);

    if (companyId) {
      return companyId;
    }
  }

  return fallbackCompanyId;
}

export function buildCompanyNumberMap(
  companies: Array<{ id: string; justcall_account_id: string | null }>,
) {
  const map = new Map<string, string>();

  companies.forEach((company) => {
    if (!company.justcall_account_id) {
      return;
    }

    map.set(normalizePhone(company.justcall_account_id), company.id);
  });

  return map;
}
