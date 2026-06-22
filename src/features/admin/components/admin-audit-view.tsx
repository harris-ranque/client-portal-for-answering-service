import type { AdminAuditLogRow } from "@/lib/audit/audit-log.repository";
import { PageContainer, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminAuditViewProps {
  rows: AdminAuditLogRow[];
}

export function AdminAuditView({ rows }: AdminAuditViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Recent administrative actions across the platform."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(row.created_at))}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.actorEmail ?? row.actor_id?.slice(0, 8) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.entity_type}
                      {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}` : ""}
                    </TableCell>
                    <TableCell className="text-sm">{row.companyName ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
