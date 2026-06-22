import {
  formatCurrency,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/dashboard/lib/formatters";
import type { AdminBillingRow } from "@/features/admin/types/admin.types";
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

interface AdminBillingViewProps {
  rows: AdminBillingRow[];
}

export function AdminBillingView({ rows }: AdminBillingViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Billing"
        description="View subscriptions and invoice status across all clients."
      />

      <Card>
        <CardHeader>
          <CardTitle>Client billing</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Latest invoice</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const status = row.latestInvoice?.status ?? row.subscription?.status ?? null;

                  return (
                    <TableRow key={row.company.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.company.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{row.subscription?.plan_name ?? "—"}</TableCell>
                      <TableCell>
                        {row.subscription ? (
                          <Badge variant={getBillingStatusVariant(row.subscription.status)} className="capitalize">
                            {getSubscriptionStatusLabel(row.subscription.status)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {row.latestInvoice
                          ? formatCurrency(
                              row.latestInvoice.amount_cents,
                              row.latestInvoice.currency,
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <Badge variant={getBillingStatusVariant(status)} className="capitalize">
                            {getSubscriptionStatusLabel(status)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
