import { Suspense } from "react";

import {
  BillingInvoiceLink,
} from "@/features/billing/components/billing-plan-card";
import { BillingInvoicesPagination } from "@/features/billing/components/billing-invoices-pagination";
import {
  formatBillingDate,
  formatBillingPeriod,
  formatCurrency,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/billing/lib/formatters";
import type { PaginatedResponse } from "@/types";
import type { BillingInvoice } from "@/features/billing/types/billing.types";
import { EmptyState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BillingInvoicesTableProps {
  invoices: PaginatedResponse<BillingInvoice>;
}

function PaginationFallback() {
  return <p className="text-sm text-muted-foreground">Loading pagination…</p>;
}

export function BillingInvoicesTable({ invoices }: BillingInvoicesTableProps) {
  const rows = invoices.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Payment history and downloadable invoices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Invoices will appear here once billing records are available."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {formatBillingDate(invoice.paid_at ?? invoice.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatBillingPeriod(invoice.period_start, invoice.period_end)}
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.amount_cents, invoice.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={getBillingStatusVariant(invoice.status)}>
                        {getSubscriptionStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <BillingInvoiceLink invoiceUrl={invoice.invoice_url} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Suspense fallback={<PaginationFallback />}>
              <BillingInvoicesPagination pagination={invoices.pagination} />
            </Suspense>
          </>
        )}
      </CardContent>
    </Card>
  );
}
