import { Suspense } from "react";

import { CallLogsExportButton } from "@/features/calls/components/call-logs-export-button";
import { CallLogsFilters } from "@/features/calls/components/call-logs-filters";
import { CallLogsPagination } from "@/features/calls/components/call-logs-pagination";
import { CallLogsTable } from "@/features/calls/components/call-logs-table";
import type { CallLogsResult } from "@/features/calls/types/call-logs.types";
import type { CallLogSortField } from "@/features/calls/schemas/call-logs-query.schema";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";

interface CallLogsViewProps {
  result: CallLogsResult;
  filters: {
    search?: string;
    from?: string;
    to?: string;
    status?: string;
    direction?: string;
  };
  query: {
    sortBy: CallLogSortField;
    sortOrder: "asc" | "desc";
  };
  searchParams: Record<string, string | undefined>;
}

function FiltersFallback() {
  return <LoadingSkeleton rows={3} />;
}

export function CallLogsView({ result, filters, query, searchParams }: CallLogsViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Call logs"
        description="Search, filter, and export your call history."
        actions={<CallLogsExportButton searchParams={searchParams} />}
      />

      <Suspense fallback={<FiltersFallback />}>
        <CallLogsFilters defaults={filters} />
      </Suspense>

      <CallLogsTable result={result} query={query} basePath="/calls" searchParams={searchParams} />

      <Suspense fallback={<LoadingSkeleton rows={1} />}>
        <CallLogsPagination pagination={result.pagination} />
      </Suspense>
    </PageContainer>
  );
}
