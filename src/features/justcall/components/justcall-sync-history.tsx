"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import type { JustCallSyncRecord } from "@/features/justcall/lib/sync.repository";
import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JustCallSyncHistoryProps {
  history: JustCallSyncRecord[];
}

function getStatusVariant(
  status: JustCallSyncRecord["sync_status"],
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

function RetrySyncButton({ syncId }: { syncId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleRetry() {
    startTransition(async () => {
      try {
        await apiClient.post(`${API_ROUTES.admin}/integrations/justcall/sync/${syncId}/retry`);
        toast.success("Retry completed.");
        window.location.reload();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Retry failed.";
        toast.error(message);
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleRetry}>
      <RotateCcw />
      Retry
    </Button>
  );
}

export function JustCallSyncHistory({ history }: JustCallSyncHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sync history</CardTitle>
        <CardDescription>Recent JustCall sync jobs with status and record counts.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sync jobs have been run yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Error</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="capitalize">{job.sync_type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(job.sync_status)} className="capitalize">
                      {job.sync_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.records_processed.toLocaleString()}</TableCell>
                  <TableCell>{formatTimestamp(job.started_at)}</TableCell>
                  <TableCell>{formatTimestamp(job.completed_at)}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {job.error_message ?? "—"}
                  </TableCell>
                  <TableCell>
                    {job.sync_status === "failed" ? <RetrySyncButton syncId={job.id} /> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
