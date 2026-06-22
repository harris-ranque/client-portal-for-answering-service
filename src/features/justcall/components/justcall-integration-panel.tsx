"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { Tables } from "@/types/database";
import { JUSTCALL_SYNC_TYPES } from "@/features/justcall/schemas/justcall-sync.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";

interface JustCallIntegrationPanelProps {
  configured: boolean;
  adminReady: boolean;
  companies: Array<{ id: string; name: string; justcall_account_id: string | null }>;
  history: Tables<"justcall_sync">[];
}

function getStatusVariant(
  status: Tables<"justcall_sync">["sync_status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") {
    return "default";
  }

  if (status === "failed") {
    return "destructive";
  }

  if (status === "running") {
    return "secondary";
  }

  return "outline";
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function JustCallIntegrationPanel({
  configured,
  adminReady,
  companies,
  history,
}: JustCallIntegrationPanelProps) {
  const [syncType, setSyncType] = useState<(typeof JUSTCALL_SYNC_TYPES)[number]>("calls");
  const [companyId, setCompanyId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const canSync = configured && adminReady;

  async function handleSync() {
    setIsSyncing(true);

    try {
      const result = await apiClient.post<{ recordsProcessed: number; syncType: string }>(
        API_ROUTES.justcallSync,
        {
          syncType,
          companyId: companyId || undefined,
        },
      );

      toast.success(
        `JustCall ${result.syncType} sync completed (${result.recordsProcessed} records processed).`,
      );
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : "JustCall sync failed.";
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleRetry(syncId: string) {
    setRetryingId(syncId);

    try {
      await apiClient.post(API_ROUTES.justcallRetry, { syncId });
      toast.success("JustCall sync retried successfully.");
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retry sync.";
      toast.error(message);
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">JustCall</CardTitle>
            <CardDescription>
              Sync calls, contacts, and agents with pagination, retries, and sync history.
            </CardDescription>
          </div>
          <Badge variant={configured ? "default" : "secondary"}>
            {configured ? "Connected" : "Not configured"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            Add `JUSTCALL_API_KEY` and `JUSTCALL_API_SECRET` to your environment to enable sync.
          </p>
        ) : null}

        {!adminReady ? (
          <p className="text-sm text-muted-foreground">
Set `SUPABASE_SECRET_KEY` to write sync jobs and upsert call records.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="justcall-sync-type">Sync type</Label>
            <select
              id="justcall-sync-type"
              value={syncType}
              onChange={(event) =>
                setSyncType(event.target.value as (typeof JUSTCALL_SYNC_TYPES)[number])
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {JUSTCALL_SYNC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="justcall-company">Company (optional)</Label>
            <select
              id="justcall-company"
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="">All mapped companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                  {company.justcall_account_id ? ` · ${company.justcall_account_id}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleSync} disabled={!canSync || isSyncing}>
          {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Run sync
        </Button>

        <div className="space-y-3">
          <p className="text-sm font-medium">Recent sync jobs</p>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sync history yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium capitalize">{job.sync_type}</span>
                      <Badge variant={getStatusVariant(job.sync_status)} className="capitalize">
                        {job.sync_status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(job.started_at)} · {job.records_processed} records
                    </p>
                    {job.error_message ? (
                      <p className="text-xs text-destructive">{job.error_message}</p>
                    ) : null}
                  </div>
                  {job.sync_status === "failed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canSync || retryingId === job.id}
                      onClick={() => handleRetry(job.id)}
                    >
                      {retryingId === job.id ? "Retrying..." : "Retry"}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
