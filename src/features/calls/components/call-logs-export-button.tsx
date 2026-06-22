"use client";

import { Download } from "lucide-react";

import { API_ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface CallLogsExportButtonProps {
  searchParams: Record<string, string | undefined>;
}

export function CallLogsExportButton({ searchParams }: CallLogsExportButtonProps) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page" && key !== "pageSize") {
      params.set(key, value);
    }
  });

  const href = params.toString()
    ? `${API_ROUTES.calls}/export?${params.toString()}`
    : `${API_ROUTES.calls}/export`;

  return (
    <Button variant="outline" render={<a href={href} download />}>
      <Download />
      Export CSV
    </Button>
  );
}
