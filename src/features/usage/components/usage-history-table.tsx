import {
  formatAverageDuration,
  formatMinutes,
} from "@/features/usage/lib/formatters";
import { formatPeriodRange } from "@/features/usage/lib/periods";
import type { UsageMetricRecord } from "@/features/usage/types/usage.types";
import { EmptyState } from "@/components/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsageHistoryTableProps {
  history: UsageMetricRecord[];
}

export function UsageHistoryTable({ history }: UsageHistoryTableProps) {
  const rows = [...history].sort((a, b) => b.period_start.localeCompare(a.period_start));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly history</CardTitle>
        <CardDescription>Detailed usage breakdown by billing period.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            title="No usage history"
            description="Monthly usage metrics will appear here as they are recorded."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Answered</TableHead>
                <TableHead>Missed</TableHead>
                <TableHead>Avg duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatPeriodRange(row.period_start, row.period_end)}</TableCell>
                  <TableCell>{formatMinutes(Number(row.minutes_used))}</TableCell>
                  <TableCell>{row.calls_answered.toLocaleString()}</TableCell>
                  <TableCell>{row.calls_missed.toLocaleString()}</TableCell>
                  <TableCell>{formatAverageDuration(row.average_duration_seconds)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
