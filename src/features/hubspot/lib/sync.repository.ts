import type { HubSpotSyncType } from "@/lib/hubspot/types";
import type { Json, Tables, TablesInsert } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export type HubSpotSyncRecord = Tables<"hubspot_sync">;

const SYNC_JOB_ENTITY_TYPE = "sync_job";

export async function createHubSpotSyncJob(input: {
  syncType: HubSpotSyncType | string;
  companyId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  const jobId = randomUUID();

  const payload: TablesInsert<"hubspot_sync"> = {
    entity_type: SYNC_JOB_ENTITY_TYPE,
    hubspot_id: jobId,
    entity_id: input.companyId ?? null,
    sync_status: "running",
    last_synced_at: new Date().toISOString(),
    metadata: {
      syncType: input.syncType,
      ...(input.metadata ?? {}),
    } as Json,
  };

  const { data, error } = await supabase.from("hubspot_sync").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function completeHubSpotSyncJob(
  syncId: string,
  input: {
    recordsProcessed: number;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("hubspot_sync")
    .update({
      sync_status: "completed",
      last_synced_at: new Date().toISOString(),
      error_message: null,
      metadata: {
        recordsProcessed: input.recordsProcessed,
        ...(input.metadata ?? {}),
      } as Json,
    })
    .eq("id", syncId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function failHubSpotSyncJob(
  syncId: string,
  input: {
    errorMessage: string;
    recordsProcessed?: number;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("hubspot_sync")
    .update({
      sync_status: "failed",
      last_synced_at: new Date().toISOString(),
      error_message: input.errorMessage,
      metadata: {
        recordsProcessed: input.recordsProcessed ?? 0,
        ...(input.metadata ?? {}),
      } as Json,
    })
    .eq("id", syncId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertHubSpotMapping(input: {
  entityType: string;
  hubspotId: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const payload: TablesInsert<"hubspot_sync"> = {
    entity_type: input.entityType,
    hubspot_id: input.hubspotId,
    entity_id: input.entityId ?? null,
    sync_status: "completed",
    last_synced_at: new Date().toISOString(),
    error_message: null,
    metadata: (input.metadata ?? {}) as Json,
  };

  const { error } = await supabase.from("hubspot_sync").upsert(payload, {
    onConflict: "entity_type,hubspot_id",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getHubSpotSyncHistory(limit = 25) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("hubspot_sync")
    .select(
      "id, entity_type, entity_id, hubspot_id, last_synced_at, sync_status, error_message, metadata, created_at, updated_at",
    )
    .eq("entity_type", SYNC_JOB_ENTITY_TYPE)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getHubSpotSyncJob(syncId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("hubspot_sync")
    .select(
      "id, entity_type, entity_id, hubspot_id, last_synced_at, sync_status, error_message, metadata, created_at, updated_at",
    )
    .eq("id", syncId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function getSyncTypeFromJob(record: HubSpotSyncRecord): HubSpotSyncType | string {
  const metadata = (record.metadata ?? {}) as Record<string, unknown>;
  return typeof metadata.syncType === "string" ? metadata.syncType : "companies";
}
