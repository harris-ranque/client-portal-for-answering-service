import type { JustCallSyncType } from "@/lib/justcall/types";
import type { Json, Tables, TablesInsert } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

export type JustCallSyncRecord = Tables<"justcall_sync">;

export async function createJustCallSyncJob(input: {
  companyId?: string | null;
  syncType: JustCallSyncType | string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const payload: TablesInsert<"justcall_sync"> = {
    company_id: input.companyId ?? null,
    sync_type: input.syncType,
    sync_status: "running",
    started_at: new Date().toISOString(),
    metadata: (input.metadata ?? {}) as Json,
  };

  const { data, error } = await supabase.from("justcall_sync").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function completeJustCallSyncJob(
  syncId: string,
  input: {
    recordsProcessed: number;
    cursor?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("justcall_sync")
    .update({
      sync_status: "completed",
      completed_at: new Date().toISOString(),
      records_processed: input.recordsProcessed,
      cursor: input.cursor ?? null,
      error_message: null,
      metadata: (input.metadata ?? {}) as Json,
    })
    .eq("id", syncId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function failJustCallSyncJob(
  syncId: string,
  input: {
    errorMessage: string;
    recordsProcessed?: number;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("justcall_sync")
    .update({
      sync_status: "failed",
      completed_at: new Date().toISOString(),
      records_processed: input.recordsProcessed ?? 0,
      error_message: input.errorMessage,
      metadata: (input.metadata ?? {}) as Json,
    })
    .eq("id", syncId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getJustCallSyncHistory(limit = 20) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("justcall_sync")
    .select(
      "id, company_id, sync_type, started_at, completed_at, sync_status, records_processed, error_message, cursor, metadata, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getJustCallSyncJob(syncId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("justcall_sync")
    .select(
      "id, company_id, sync_type, started_at, completed_at, sync_status, records_processed, error_message, cursor, metadata, created_at, updated_at",
    )
    .eq("id", syncId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
