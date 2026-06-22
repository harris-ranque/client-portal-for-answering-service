import { syncStripeInvoices, syncStripeSubscriptions } from "@/features/stripe/lib/sync-subscriptions.service";
import {
  completeStripeSyncJob,
  createStripeSyncJob,
  failStripeSyncJob,
  getStripeSyncJob,
} from "@/features/stripe/lib/sync.repository";
import { isStripeConfigured } from "@/lib/stripe/client";
import type { StripeSyncType } from "@/lib/stripe/types";

export interface RunStripeSyncInput {
  syncType: StripeSyncType;
  companyId?: string | null;
}

export interface StripeSyncResult {
  syncId: string;
  syncType: StripeSyncType;
  recordsProcessed: number;
  metadata: Record<string, unknown>;
}

async function executeSyncType(input: RunStripeSyncInput) {
  switch (input.syncType) {
    case "subscriptions":
      return syncStripeSubscriptions({ companyId: input.companyId });
    case "invoices":
      return syncStripeInvoices({ companyId: input.companyId });
    case "all": {
      const subscriptions = await syncStripeSubscriptions({ companyId: input.companyId });
      const invoices = await syncStripeInvoices({ companyId: input.companyId });

      return {
        subscriptions,
        invoices,
        processed: (subscriptions.processed ?? 0) + (invoices.processed ?? 0),
      };
    }
    default:
      throw new Error(`Unsupported Stripe sync type: ${input.syncType}`);
  }
}

function getRecordsProcessed(result: Record<string, unknown>) {
  if (typeof result.processed === "number") {
    return result.processed;
  }

  return (
    Number((result.subscriptions as { processed?: number } | undefined)?.processed ?? 0) +
    Number((result.invoices as { processed?: number } | undefined)?.processed ?? 0)
  );
}

export async function runStripeSync(input: RunStripeSyncInput): Promise<StripeSyncResult> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe credentials are not configured.");
  }

  const syncJob = await createStripeSyncJob({
    companyId: input.companyId,
    syncType: input.syncType,
  });

  try {
    const result = (await executeSyncType(input)) as Record<string, unknown>;
    const recordsProcessed = getRecordsProcessed(result);

    await completeStripeSyncJob(syncJob.id, {
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
    const message = error instanceof Error ? error.message : "Stripe sync failed.";

    await failStripeSyncJob(syncJob.id, {
      errorMessage: message,
    });

    throw error;
  }
}

export async function retryStripeSync(syncId: string) {
  const existing = await getStripeSyncJob(syncId);

  if (!existing) {
    throw new Error("Sync job not found.");
  }

  if (existing.sync_status !== "failed") {
    throw new Error("Only failed sync jobs can be retried.");
  }

  if (existing.sync_type === "webhook") {
    throw new Error("Webhook events cannot be retried from the admin panel.");
  }

  return runStripeSync({
    syncType: existing.sync_type as StripeSyncType,
    companyId: existing.company_id,
  });
}
