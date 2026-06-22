"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

import {
  CALL_LOG_DIRECTIONS,
  CALL_LOG_STATUSES,
} from "@/features/calls/schemas/call-logs-query.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CallLogsFiltersProps {
  defaults: {
    search?: string;
    from?: string;
    to?: string;
    status?: string;
    direction?: string;
  };
}

function updateSearchParams(searchParams: URLSearchParams, updates: Record<string, string | null>) {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  params.delete("page");

  return params;
}

export function CallLogsFilters({ defaults }: CallLogsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function applyUpdates(updates: Record<string, string | null>) {
    const params = updateSearchParams(searchParams, updates);
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    applyUpdates({
      search: String(formData.get("search") ?? ""),
      from: String(formData.get("from") ?? ""),
      to: String(formData.get("to") ?? ""),
      status: String(formData.get("status") ?? ""),
      direction: String(formData.get("direction") ?? ""),
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters = Boolean(
    defaults.search || defaults.from || defaults.to || defaults.status || defaults.direction,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("grid gap-4 rounded-xl border p-4", isPending && "opacity-70")}
    >
      <div className="grid gap-4 lg:grid-cols-6">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              name="search"
              defaultValue={defaults.search ?? ""}
              placeholder="Caller, number, agent, notes..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input id="from" name="from" type="date" defaultValue={defaults.from ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input id="to" name="to" type="date" defaultValue={defaults.to ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults.status ?? ""}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All statuses</option>
            {CALL_LOG_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <select
            id="direction"
            name="direction"
            defaultValue={defaults.direction ?? ""}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All directions</option>
            {CALL_LOG_DIRECTIONS.map((direction) => (
              <option key={direction} value={direction}>
                {direction}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          Apply filters
        </Button>
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={clearFilters} disabled={isPending}>
            <X />
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}
