import { ExternalLink } from "lucide-react";

import {
  formatBillingPeriod,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/billing/lib/formatters";
import type { BillingSubscription } from "@/features/billing/types/billing.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingPlanCardProps {
  subscription: BillingSubscription | null;
  paymentStatus: string | null;
}

export function BillingPlanCard({ subscription, paymentStatus }: BillingPlanCardProps) {
  const status = paymentStatus ?? subscription?.status ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
        <CardDescription>Your subscription and billing period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{subscription.plan_name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {getSubscriptionStatusLabel(subscription.status)}
                </p>
              </div>
              <Badge variant={getBillingStatusVariant(subscription.status)}>
                {getSubscriptionStatusLabel(subscription.status)}
              </Badge>
            </div>

            {subscription.minutes_included !== null ? (
              <p className="text-sm text-muted-foreground">
                {subscription.minutes_included.toLocaleString()} minutes included per billing period
              </p>
            ) : null}

            {subscription.current_period_start && subscription.current_period_end ? (
              <p className="text-sm text-muted-foreground">
                Billing period:{" "}
                {formatBillingPeriod(
                  subscription.current_period_start,
                  subscription.current_period_end,
                )}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No active subscription on file.</p>
        )}

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Payment status</p>
            <Badge variant={getBillingStatusVariant(status)}>
              {status ? getSubscriptionStatusLabel(status) : "Unknown"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BillingInvoiceLinkProps {
  invoiceUrl: string | null;
  label?: string;
}

export function BillingInvoiceLink({ invoiceUrl, label = "View invoice" }: BillingInvoiceLinkProps) {
  if (!invoiceUrl) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <a
      href={invoiceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  );
}
