import type { Metadata } from "next";
import { Suspense } from "react";

import { requireClient, getSessionUserWithCompany } from "@/features/auth";
import { CallLogsView } from "@/features/calls/components/call-logs-view";
import { getCallLogs } from "@/features/calls/lib/calls.repository";
import {
  parseCallLogsSearchParams,
  toCallLogsSearchRecord,
} from "@/features/calls/lib/parse-query";
import { PageContainer, PageHeader } from "@/components/layout";
import { ErrorState, LoadingSkeleton } from "@/components/feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Call Logs",
};

interface CallsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function CallsContentFallback() {
  return (
    <PageContainer className="space-y-6">
      <LoadingSkeleton rows={6} />
    </PageContainer>
  );
}

async function CallsContent({ searchParams }: CallsPageProps) {
  const user = await requireClient();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;
  const params = await searchParams;
  const query = parseCallLogsSearchParams(params);
  const searchRecord = toCallLogsSearchRecord(query);

  if (!companyId || !isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Call logs" description="Search, filter, and export your call history." />
        <Card>
          <CardHeader>
            <CardTitle>
              {!isSupabaseConfigured() ? "Supabase not configured" : "No company assigned"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {!isSupabaseConfigured()
                ? "Configure Supabase credentials to load call history."
                : "Your account is not linked to a company yet. Contact your answering service provider."}
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  let result;

  try {
    result = await getCallLogs({
      ...query,
      companyId,
    });
  } catch (error) {
    return (
      <PageContainer>
        <PageHeader title="Call logs" description="Search, filter, and export your call history." />
        <ErrorState
          message={error instanceof Error ? error.message : "Unable to load call logs."}
        />
      </PageContainer>
    );
  }

  return (
    <CallLogsView
      result={result}
      filters={{
        search: query.search,
        from: query.from,
        to: query.to,
        status: query.status,
        direction: query.direction,
      }}
      query={{
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }}
      searchParams={searchRecord}
    />
  );
}

export default function CallsPage({ searchParams }: CallsPageProps) {
  return (
    <Suspense fallback={<CallsContentFallback />}>
      <CallsContent searchParams={searchParams} />
    </Suspense>
  );
}
