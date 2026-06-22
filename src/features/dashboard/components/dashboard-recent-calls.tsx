import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatCallDate, formatDuration } from "@/features/dashboard/lib/formatters";
import type { DashboardCallLog } from "@/features/dashboard/types/dashboard.types";
import { EmptyState } from "@/components/feedback";
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
import { APP_ROUTES } from "@/lib/constants";

interface DashboardRecentCallsProps {
  calls: DashboardCallLog[];
}

function getStatusVariant(
  status: DashboardCallLog["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "answered") {
    return "default";
  }

  if (status === "missed" || status === "failed") {
    return "destructive";
  }

  return "secondary";
}

export function DashboardRecentCalls({ calls }: DashboardRecentCallsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recent calls</CardTitle>
          <CardDescription>Latest activity from your answering service.</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href={APP_ROUTES.calls} />}>
          View all
          <ArrowRight />
        </Button>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <EmptyState
            title="No calls yet"
            description="Recent call activity will appear here once calls are logged."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{formatCallDate(call.call_date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{call.caller_name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {call.caller_number ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{call.direction}</TableCell>
                  <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                  <TableCell>{call.agent_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(call.status)} className="capitalize">
                      {call.status}
                    </Badge>
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
