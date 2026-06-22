import { formatMinutes } from "@/features/usage/lib/formatters";
import type { AdminUsageCompanyRow } from "@/features/admin/types/admin.types";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminMetricsViewProps {
  rows: AdminUsageCompanyRow[];
}

export function AdminMetricsView({ rows }: AdminMetricsViewProps) {
  const totalMinutes = rows.reduce(
    (sum, row) => sum + Number(row.currentUsage?.minutes_used ?? 0),
    0,
  );
  const totalAnswered = rows.reduce(
    (sum, row) => sum + (row.currentUsage?.calls_answered ?? 0),
    0,
  );
  const totalMissed = rows.reduce((sum, row) => sum + (row.currentUsage?.calls_missed ?? 0), 0);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Metrics"
        description="Platform-wide usage for the current billing period."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatMinutes(totalMinutes)}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Calls answered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalAnswered.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Missed calls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalMissed.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage by company</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Minutes</TableHead>
                <TableHead>Answered</TableHead>
                <TableHead>Missed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.company.id}>
                  <TableCell className="font-medium">{row.company.name}</TableCell>
                  <TableCell>{row.subscription?.plan_name ?? "—"}</TableCell>
                  <TableCell>
                    {formatMinutes(Number(row.currentUsage?.minutes_used ?? 0))}
                  </TableCell>
                  <TableCell>{row.currentUsage?.calls_answered?.toLocaleString() ?? "0"}</TableCell>
                  <TableCell>{row.currentUsage?.calls_missed?.toLocaleString() ?? "0"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
