import type { AdminOnboardingRow } from "@/features/admin/types/admin.types";
import { AdminOnboardingEditSheet } from "@/features/admin/components/admin-onboarding-edit-sheet";
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

interface AdminOnboardingViewProps {
  rows: AdminOnboardingRow[];
}

export function AdminOnboardingView({ rows }: AdminOnboardingViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Track onboarding progress across client organizations."
      />

      <Card>
        <CardHeader>
          <CardTitle>Onboarding status</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No onboarding records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current step</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.onboarding.id}>
                    <TableCell className="font-medium">{row.company.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {row.onboarding.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.onboarding.current_step ?? "—"}</TableCell>
                    <TableCell>
                      {row.onboarding.completed_at
                        ? new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(row.onboarding.completed_at))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminOnboardingEditSheet row={row} />
                    </TableCell>
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
