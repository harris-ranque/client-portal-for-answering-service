"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PaginatedResponse } from "@/types";
import type { CallLogRecord } from "@/features/calls/types/call-logs.types";
import { Button } from "@/components/ui/button";

interface CallLogsPaginationProps {
  pagination: PaginatedResponse<CallLogRecord>["pagination"];
}

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function CallLogsPagination({ pagination }: CallLogsPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages, total, pageSize } = pagination;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {total} calls
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={buildPageHref(pathname, searchParams, page - 1)} />}
          >
            <ChevronLeft />
            Previous
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft />
            Previous
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Button
            variant="outline"
            size="sm"
            render={<Link href={buildPageHref(pathname, searchParams, page + 1)} />}
          >
            Next
            <ChevronRight />
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}
