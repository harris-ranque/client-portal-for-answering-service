import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminCallsView } from "@/features/admin/components/admin-calls-view";
import { getAdminCallLogs } from "@/features/admin/lib/admin-calls.repository";
import { getAdminCompanyOptions } from "@/features/admin/lib/admin.repository";
import {
  parseAdminCallsSearchParams,
  toAdminCallsSearchRecord,
} from "@/features/admin/lib/parse-query";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "All Calls",
};

interface AdminCallsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AdminCallsContent({ searchParams }: AdminCallsPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="All calls" description="View call logs across all client organizations." />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to load call logs.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const params = await searchParams;
  const query = parseAdminCallsSearchParams(params);
  const searchRecord = toAdminCallsSearchRecord(query);
  const [result, companies] = await Promise.all([
    getAdminCallLogs(query),
    getAdminCompanyOptions(),
  ]);

  return (
    <AdminCallsView
      result={result}
      companyNames={result.companyNames}
      companies={companies}
      filters={{
        search: query.search,
        from: query.from,
        to: query.to,
        status: query.status,
        direction: query.direction,
        companyId: query.companyId,
      }}
      query={{
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }}
      searchParams={searchRecord}
    />
  );
}

export default function AdminCallsPage({ searchParams }: AdminCallsPageProps) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminCallsContent searchParams={searchParams} />
    </Suspense>
  );
}
