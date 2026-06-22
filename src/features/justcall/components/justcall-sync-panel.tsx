"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface JustCallSyncPanelProps {
  configured: boolean;
  companies: Array<{ id: string; name: string; is_active: boolean }>;
}

const SYNC_OPTIONS = [
  { value: "calls", label: "Sync calls" },
  { value: "contacts", label: "Sync contacts" },
  { value: "agents", label: "Sync agents" },
  { value: "all", label: "Sync all" },
] as const;

export function JustCallSyncPanel({ configured, companies }: JustCallSyncPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [syncType, setSyncType] = useState<(typeof SYNC_OPTIONS)[number]["value"]>("calls");
  const [companyId, setCompanyId] = useState("");

  function handleSync() {
    if (!configured) {
      toast.error("Configure JustCall API credentials before running a sync.");
      return;
    }

    startTransition(async () => {
      try {
        await apiClient.post(`${API_ROUTES.admin}/integrations/justcall/sync`, {
          syncType,
          companyId: companyId || undefined,
        });

        toast.success("JustCall sync completed.");
        window.location.reload();
      } catch (error) {
        const message = error instanceof Error ? error.message : "JustCall sync failed.";
        toast.error(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">JustCall sync</CardTitle>
        <CardDescription>
          Pull calls, contacts, and agents from JustCall into the portal database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="justcall-sync-type">Sync type</Label>
            <select
              id="justcall-sync-type"
              value={syncType}
              onChange={(event) =>
                setSyncType(event.target.value as (typeof SYNC_OPTIONS)[number]["value"])
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {SYNC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              {companies
                .filter((company) => company.is_active)
                .map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <Button type="button" onClick={handleSync} disabled={!configured || isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Run sync
        </Button>

        {!configured ? (
          <p className="text-xs text-muted-foreground">
            Set `JUSTCALL_API_KEY` and `JUSTCALL_API_SECRET` in `.env` to enable sync.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Map each client company&apos;s `justcall_account_id` to its JustCall number for
            per-company call routing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
