import type { Json, Tables, TablesInsert } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

export type StripeSyncRecord = Tables<"stripe_sync">;

export async function createStripeSyncJob(input: {
  companyId?: string | null;
  syncType: string;
  stripeEventId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const payload: TablesInsert<"stripe_sync"> = {
    company_id: input.companyId ?? null,
    sync_type: input.syncType,
    stripe_event_id: input.stripeEventId ?? null,
    sync_status: "running",
    started_at: new Date().toISOString(),
    metadata: (input.metadata ?? {}) as Json,
  };

  const { data, error } = await supabase.from("stripe_sync").insert(payload).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function completeStripeSyncJob(
  syncId: string,
  input: {
    recordsProcessed: number;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_sync")
    .update({
      sync_status: "completed",
      completed_at: new Date().toISOString(),
      records_processed: input.recordsProcessed,
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

export async function failStripeSyncJob(
  syncId: string,
  input: {
    errorMessage: string;
    recordsProcessed?: number;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_sync")
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

export async function getStripeSyncJob(syncId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("stripe_sync").select("*").eq("id", syncId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getStripeSyncHistory(limit = 25) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_sync")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getStripeWebhookEventRecord(stripeEventId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_sync")
    .select("*")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function restartStripeWebhookJob(syncId: string, metadata?: Record<string, unknown>) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_sync")
    .update({
      sync_status: "running",
      started_at: new Date().toISOString(),
      completed_at: null,
      records_processed: 0,
      error_message: null,
      metadata: (metadata ?? {}) as Json,
    })
    .eq("id", syncId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
