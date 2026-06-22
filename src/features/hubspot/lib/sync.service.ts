import { syncHubSpotCompanies } from "@/features/hubspot/lib/sync-companies.service";
import { syncHubSpotContacts } from "@/features/hubspot/lib/sync-contacts.service";
import { syncHubSpotOnboarding } from "@/features/hubspot/lib/sync-onboarding.service";
import {
  completeHubSpotSyncJob,
  createHubSpotSyncJob,
  failHubSpotSyncJob,
  getHubSpotSyncJob,
  getSyncTypeFromJob,
} from "@/features/hubspot/lib/sync.repository";
import { isHubSpotConfigured } from "@/lib/hubspot";
import type { HubSpotSyncType } from "@/lib/hubspot/types";

export interface RunHubSpotSyncInput {
  syncType: HubSpotSyncType;
  companyId?: string | null;
}

export interface HubSpotSyncResult {
  syncId: string;
  syncType: HubSpotSyncType;
  recordsProcessed: number;
  metadata: Record<string, unknown>;
}

async function executeSyncType(input: RunHubSpotSyncInput) {
  switch (input.syncType) {
    case "companies":
      return syncHubSpotCompanies({ companyId: input.companyId });
    case "contacts":
      return syncHubSpotContacts({ companyId: input.companyId });
    case "onboarding":
      return syncHubSpotOnboarding({ companyId: input.companyId });
    case "all": {
      const companies = await syncHubSpotCompanies({ companyId: input.companyId });
      const contacts = await syncHubSpotContacts({ companyId: input.companyId });
      const onboarding = await syncHubSpotOnboarding({ companyId: input.companyId });

      return {
        companies,
        contacts,
        onboarding,
        processed:
          (companies.processed ?? 0) +
          (contacts.processed ?? 0) +
          (onboarding.processed ?? 0),
      };
    }
    default:
      throw new Error(`Unsupported HubSpot sync type: ${input.syncType}`);
  }
}

function getRecordsProcessed(result: Record<string, unknown>) {
  if (typeof result.processed === "number") {
    return result.processed;
  }

  return (
    Number((result.companies as { processed?: number } | undefined)?.processed ?? 0) +
    Number((result.contacts as { processed?: number } | undefined)?.processed ?? 0) +
    Number((result.onboarding as { processed?: number } | undefined)?.processed ?? 0)
  );
}

export async function runHubSpotSync(input: RunHubSpotSyncInput): Promise<HubSpotSyncResult> {
  if (!isHubSpotConfigured()) {
    throw new Error("HubSpot credentials are not configured.");
  }

  const syncJob = await createHubSpotSyncJob({
    syncType: input.syncType,
    companyId: input.companyId,
  });

  try {
    const result = (await executeSyncType(input)) as Record<string, unknown>;
    const recordsProcessed = getRecordsProcessed(result);

    await completeHubSpotSyncJob(syncJob.id, {
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
    const message = error instanceof Error ? error.message : "HubSpot sync failed.";

    await failHubSpotSyncJob(syncJob.id, {
      errorMessage: message,
    });

    throw error;
  }
}

export async function retryHubSpotSync(syncId: string) {
  const existing = await getHubSpotSyncJob(syncId);

  if (!existing) {
    throw new Error("Sync job not found.");
  }

  if (existing.sync_status !== "failed") {
    throw new Error("Only failed sync jobs can be retried.");
  }

  return runHubSpotSync({
    syncType: getSyncTypeFromJob(existing) as HubSpotSyncType,
    companyId: existing.entity_id,
  });
}
