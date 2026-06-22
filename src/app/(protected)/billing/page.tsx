import type { Metadata } from "next";
import { Suspense } from "react";

import { requireClient, getSessionUserWithCompany } from "@/features/auth";
import { BillingView } from "@/features/billing/components/billing-view";
import { getBillingData } from "@/features/billing/lib/billing.repository";
import { billingQuerySchema } from "@/features/billing/schemas/billing-query.schema";
import { LoadingSkeleton, ErrorState } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Billing",
};

interface BillingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function BillingContentFallback() {
  return (
    <PageContainer className="space-y-6">
      <LoadingSkeleton rows={8} />
    </PageContainer>
  );
}

async function BillingContent({ searchParams }: BillingPageProps) {
  const user = await requireClient();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;
  const params = await searchParams;
  const query = billingQuerySchema.parse({
    page: Array.isArray(params.page) ? params.page[0] : params.page,
    pageSize: Array.isArray(params.pageSize) ? params.pageSize[0] : params.pageSize,
  });

  if (!companyId || !isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Billing"
          description="View your plan, invoices, payment status, and manage billing."
        />
        <Card>
          <CardHeader>
            <CardTitle>
              {!isSupabaseConfigured() ? "Supabase not configured" : "No company assigned"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {!isSupabaseConfigured()
                ? "Configure Supabase credentials to load billing information."
                : "Your account is not linked to a company yet. Contact your answering service provider."}
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  let data;

  try {
    data = await getBillingData(companyId, query.page, query.pageSize);
  } catch (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Billing"
          description="View your plan, invoices, payment status, and manage billing."
        />
        <ErrorState
          message={error instanceof Error ? error.message : "Unable to load billing information."}
        />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <PageHeader
          title="Billing"
          description="View your plan, invoices, payment status, and manage billing."
        />
        <Card>
          <CardHeader>
            <CardTitle>Billing unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Unable to load billing information for your company.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return <BillingView data={data} />;
}

export default function BillingPage({ searchParams }: BillingPageProps) {
  return (
    <Suspense fallback={<BillingContentFallback />}>
      <BillingContent searchParams={searchParams} />
    </Suspense>
  );
}
