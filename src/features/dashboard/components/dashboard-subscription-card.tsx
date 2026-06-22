import {
  formatCurrency,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/dashboard/lib/formatters";
import type {
  DashboardBillingRecord,
  DashboardSubscription,
} from "@/features/dashboard/types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSubscriptionCardProps {
  subscription: DashboardSubscription | null;
  latestBilling: DashboardBillingRecord | null;
}

export function DashboardSubscriptionCard({
  subscription,
  latestBilling,
}: DashboardSubscriptionCardProps) {
  const billingStatus = latestBilling?.status ?? subscription?.status ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & billing</CardTitle>
        <CardDescription>Current plan and payment status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{subscription.plan_name}</p>
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
                {subscription.minutes_included.toLocaleString()} minutes included per period
              </p>
            ) : null}

            {subscription.current_period_end ? (
              <p className="text-sm text-muted-foreground">
                Current period ends{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(subscription.current_period_end))}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active subscription on file.</p>
        )}

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Billing status</p>
            <Badge variant={getBillingStatusVariant(billingStatus)}>
              {billingStatus ? getSubscriptionStatusLabel(billingStatus) : "Unknown"}
            </Badge>
          </div>
          {latestBilling ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Latest invoice: {formatCurrency(latestBilling.amount_cents, latestBilling.currency)}{" "}
              {latestBilling.paid_at
                ? `paid on ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(latestBilling.paid_at))}`
                : ""}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No invoices recorded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
