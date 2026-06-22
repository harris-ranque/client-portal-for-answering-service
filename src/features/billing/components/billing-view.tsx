import { BillingInvoicesTable } from "@/features/billing/components/billing-invoices-table";
import { BillingPlanCard } from "@/features/billing/components/billing-plan-card";
import { BillingPortalButton } from "@/features/billing/components/billing-portal-button";
import { BillingUsageCard } from "@/features/billing/components/billing-usage-card";
import type { BillingData } from "@/features/billing/types/billing.types";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingViewProps {
  data: BillingData;
}

export function BillingView({ data }: BillingViewProps) {
  const latestInvoice = data.invoices.data[0] ?? null;
  const paymentStatus = latestInvoice?.status ?? data.subscription?.status ?? null;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Billing"
        description="View your plan, invoices, payment status, and manage billing."
        actions={<BillingPortalButton portalAvailable={data.portalAvailable} />}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <BillingPlanCard subscription={data.subscription} paymentStatus={paymentStatus} />
        <BillingUsageCard usage={data.usage} />
      </div>

      <BillingInvoicesTable invoices={data.invoices} />

      {!data.portalAvailable ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Stripe Customer Portal</CardTitle>
            <CardDescription>
              Update payment methods, view invoices, and manage your subscription in Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.stripeCustomerId
                ? "Stripe credentials are not configured in this environment."
                : "A Stripe customer record has not been linked to your company yet."}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
