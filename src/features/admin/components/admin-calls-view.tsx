"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { CallLogsFilters } from "@/features/calls/components/call-logs-filters";
import { CallLogsPagination } from "@/features/calls/components/call-logs-pagination";
import { CallLogsTable } from "@/features/calls/components/call-logs-table";
import type { CallLogSortField } from "@/features/calls/schemas/call-logs-query.schema";
import type { CallLogsResult } from "@/features/calls/types/call-logs.types";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";

interface AdminCallsViewProps {
  result: CallLogsResult;
  companyNames: Record<string, string>;
  companies: Array<{ id: string; name: string; is_active: boolean }>;
  filters: {
    search?: string;
    from?: string;
    to?: string;
    status?: string;
    direction?: string;
    companyId?: string;
  };
  query: {
    sortBy: CallLogSortField;
    sortOrder: "asc" | "desc";
  };
  searchParams: Record<string, string | undefined>;
}

export function AdminCallsView({
  result,
  companyNames,
  companies,
  filters,
  query,
  searchParams,
}: AdminCallsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleCompanyChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(urlSearchParams.toString());
    const value = event.target.value;

    if (value) {
      params.set("companyId", value);
    } else {
      params.delete("companyId");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const resultWithCompany = {
    ...result,
    data: result.data.map((call) => ({
      ...call,
      caller_name: companyNames[call.company_id]
        ? `${call.caller_name ?? "Unknown"} (${companyNames[call.company_id]})`
        : call.caller_name,
    })),
  };

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="All calls"
        description="View call logs across all client organizations."
      />

      <div className={cn("space-y-2", isPending && "opacity-70")}>
        <Label htmlFor="companyId">Company</Label>
        <select
          id="companyId"
          name="companyId"
          value={filters.companyId ?? ""}
          onChange={handleCompanyChange}
          className="h-8 w-full max-w-sm rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">All companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <CallLogsFilters defaults={filters} />

      <CallLogsTable
        result={resultWithCompany}
        query={query}
        basePath={APP_ROUTES.admin.calls}
        searchParams={searchParams}
      />

      <CallLogsPagination pagination={result.pagination} />
    </PageContainer>
  );
}
