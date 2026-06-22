"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ClientCreateForm } from "@/features/admin/components/client-create-form";
import { ClientsTable } from "@/features/admin/components/clients-table";
import type { AdminClientsResult } from "@/features/admin/types/admin.types";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ClientsViewProps {
  result: AdminClientsResult;
  filters: {
    search?: string;
    status: string;
  };
}

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

export function ClientsView({ result, filters }: ClientsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    const search = formData.get("search")?.toString() ?? "";
    const status = formData.get("status")?.toString() ?? "all";

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    params.set("status", status);
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const { page, totalPages, total, pageSize } = result.pagination;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Clients"
        description="Create, edit, and manage client organizations."
        actions={<ClientCreateForm />}
      />

      <form
        onSubmit={handleFilterSubmit}
        className={cn("grid gap-4 rounded-lg border p-4 md:grid-cols-3", isPending && "opacity-70")}
      >
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input id="search" name="search" defaultValue={filters.search ?? ""} placeholder="Name or email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      <ClientsTable clients={result.data} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {start}-{end} of {total} clients
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={buildPageHref(pathname, searchParams, page - 1)} />}
            >
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
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
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
