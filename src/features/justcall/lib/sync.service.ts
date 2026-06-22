import { syncJustCallAgents } from "@/features/justcall/lib/sync-agents.service";
import { syncJustCallCalls } from "@/features/justcall/lib/sync-calls.service";
import { syncJustCallContacts } from "@/features/justcall/lib/sync-contacts.service";
import {
  completeJustCallSyncJob,
  createJustCallSyncJob,
  failJustCallSyncJob,
  getJustCallSyncJob,
} from "@/features/justcall/lib/sync.repository";
import { isJustCallConfigured } from "@/lib/justcall";
import type { JustCallSyncType } from "@/lib/justcall/types";

export interface RunJustCallSyncInput {
  syncType: JustCallSyncType;
  companyId?: string | null;
  fromDatetime?: string;
  toDatetime?: string;
}

export interface JustCallSyncResult {
  syncId: string;
  syncType: JustCallSyncType;
  recordsProcessed: number;
  metadata: Record<string, unknown>;
}

async function executeSyncType(input: RunJustCallSyncInput) {
  switch (input.syncType) {
    case "calls":
      return syncJustCallCalls({
        companyId: input.companyId,
        fromDatetime: input.fromDatetime,
        toDatetime: input.toDatetime,
      });
    case "contacts":
      return syncJustCallContacts({
        companyId: input.companyId,
      });
    case "agents":
      return syncJustCallAgents();
    case "all": {
      const [calls, contacts, agents] = await Promise.all([
        syncJustCallCalls({ companyId: input.companyId }),
        syncJustCallContacts({ companyId: input.companyId }),
        syncJustCallAgents(),
      ]);

      return {
        calls,
        contacts,
        agents,
        processed:
          (calls.processed ?? 0) + (contacts.processed ?? 0) + (agents.processed ?? 0),
      };
    }
    default:
      throw new Error(`Unsupported JustCall sync type: ${input.syncType}`);
  }
}

function getRecordsProcessed(result: Record<string, unknown>) {
  if (typeof result.processed === "number") {
    return result.processed;
  }

  if (inputHasNestedCounts(result)) {
    return (
      Number(result.calls?.processed ?? 0) +
      Number(result.contacts?.processed ?? 0) +
      Number(result.agents?.processed ?? 0)
    );
  }

  return 0;
}

function inputHasNestedCounts(result: Record<string, unknown>): result is {
  calls?: { processed?: number };
  contacts?: { processed?: number };
  agents?: { processed?: number };
} {
  return "calls" in result || "contacts" in result || "agents" in result;
}

export async function runJustCallSync(input: RunJustCallSyncInput): Promise<JustCallSyncResult> {
  if (!isJustCallConfigured()) {
    throw new Error("JustCall credentials are not configured.");
  }

  const syncJob = await createJustCallSyncJob({
    companyId: input.companyId,
    syncType: input.syncType,
    metadata: {
      fromDatetime: input.fromDatetime ?? null,
      toDatetime: input.toDatetime ?? null,
    },
  });

  try {
    const result = (await executeSyncType(input)) as Record<string, unknown>;
    const recordsProcessed = getRecordsProcessed(result);

    await completeJustCallSyncJob(syncJob.id, {
      recordsProcessed,
      metadata: result,
    });

    return {
      syncId: syncJob.id,
      syncType: input.syncType,
      recordsProcessed,
      metadata: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "JustCall sync failed.";

    await failJustCallSyncJob(syncJob.id, {
      errorMessage: message,
    });

    throw error;
  }
}

export async function retryJustCallSync(syncId: string) {
  const existing = await getJustCallSyncJob(syncId);

  if (!existing) {
    throw new Error("Sync job not found.");
  }

  if (existing.sync_status !== "failed") {
    throw new Error("Only failed sync jobs can be retried.");
  }

  const metadata = (existing.metadata ?? {}) as Record<string, unknown>;

  return runJustCallSync({
    syncType: existing.sync_type as JustCallSyncType,
    companyId: existing.company_id,
    fromDatetime: typeof metadata.fromDatetime === "string" ? metadata.fromDatetime : undefined,
    toDatetime: typeof metadata.toDatetime === "string" ? metadata.toDatetime : undefined,
  });
}
