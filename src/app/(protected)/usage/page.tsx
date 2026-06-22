import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAuth, getSessionUserWithCompany } from "@/features/auth";
import { UsageView } from "@/features/usage/components/usage-view";
import { getUsageData } from "@/features/usage/lib/usage.repository";
import { usageQuerySchema } from "@/features/usage/schemas/usage-query.schema";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Usage",
};

interface UsagePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function UsageContentFallback() {
  return (
    <PageContainer className="space-y-6">
      <LoadingSkeleton rows={8} />
    </PageContainer>
  );
}

async function UsageContent({ searchParams }: UsagePageProps) {
  const user = await requireAuth();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;
  const params = await searchParams;
  const query = usageQuerySchema.parse({
    months: Array.isArray(params.months) ? params.months[0] : params.months,
  });

  if (!companyId || !isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Usage" description="Track monthly minutes, call volume, and usage trends." />
        <Card>
          <CardHeader>
            <CardTitle>
              {!isSupabaseConfigured() ? "Supabase not configured" : "No company assigned"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {!isSupabaseConfigured()
                ? "Configure Supabase credentials to load usage metrics."
                : "Your account is not linked to a company yet."}
            </p>
            {user.role === "admin" ? (
              <Button render={<Link href={APP_ROUTES.admin.root} />}>Open admin panel</Button>
            ) : null}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const data = await getUsageData(companyId, query.months);

  if (!data) {
    return (
      <PageContainer>
        <PageHeader title="Usage" description="Track monthly minutes, call volume, and usage trends." />
        <Card>
          <CardHeader>
            <CardTitle>Usage unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Unable to load usage metrics for your company.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return <UsageView data={data} months={query.months} />;
}

export default function UsagePage({ searchParams }: UsagePageProps) {
  return (
    <Suspense fallback={<UsageContentFallback />}>
      <UsageContent searchParams={searchParams} />
    </Suspense>
  );
}
