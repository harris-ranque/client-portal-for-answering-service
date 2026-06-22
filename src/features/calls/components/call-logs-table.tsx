import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";

import type { CallLogSortField } from "@/features/calls/schemas/call-logs-query.schema";
import { formatCallDate, formatDuration } from "@/features/calls/lib/formatters";
import type { CallLogsResult } from "@/features/calls/types/call-logs.types";
import { EmptyState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CallLogsTableProps {
  result: CallLogsResult;
  query: {
    sortBy: CallLogSortField;
    sortOrder: "asc" | "desc";
  };
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

const SORTABLE_COLUMNS: Array<{ key: CallLogSortField; label: string }> = [
  { key: "call_date", label: "Date" },
  { key: "caller_name", label: "Caller" },
  { key: "direction", label: "Direction" },
  { key: "duration_seconds", label: "Duration" },
  { key: "agent_name", label: "Agent" },
  { key: "status", label: "Status" },
];

function getStatusVariant(
  status: CallLogsResult["data"][number]["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "answered") {
    return "default";
  }

  if (status === "missed" || status === "failed") {
    return "destructive";
  }

  return "secondary";
}

function buildSortHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  sortBy: CallLogSortField,
  currentSortBy: CallLogSortField,
  currentSortOrder: "asc" | "desc",
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const nextOrder = currentSortBy === sortBy && currentSortOrder === "desc" ? "asc" : "desc";

  params.set("sortBy", sortBy);
  params.set("sortOrder", nextOrder);
  params.delete("page");

  return `${basePath}?${params.toString()}`;
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: CallLogSortField;
  sortBy: CallLogSortField;
  sortOrder: "asc" | "desc";
}) {
  if (column !== sortBy) {
    return <ArrowUpDown className="size-3.5 text-muted-foreground" />;
  }

  return sortOrder === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

export function CallLogsTable({ result, query, basePath, searchParams }: CallLogsTableProps) {
  if (result.data.length === 0) {
    return (
      <EmptyState
        title="No calls found"
        description="Try adjusting your search or date filters to find call records."
      />
    );
  }

  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              {SORTABLE_COLUMNS.map((column) => (
                <TableHead key={column.key}>
                  <Link
                    href={buildSortHref(
                      basePath,
                      searchParams,
                      column.key,
                      query.sortBy,
                      query.sortOrder,
                    )}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-foreground",
                      query.sortBy === column.key && "text-foreground",
                    )}
                  >
                    {column.label}
                    <SortIcon
                      column={column.key}
                      sortBy={query.sortBy}
                      sortOrder={query.sortOrder}
                    />
                  </Link>
                </TableHead>
              ))}
              <TableHead>Recording</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((call) => (
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
                <TableCell>
                  {call.recording_url ? (
                    <a
                      href={call.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      Listen
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{call.notes ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
