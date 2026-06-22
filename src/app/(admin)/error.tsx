"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/async-states";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Something went wrong" description="We could not load this admin page." />
      <ErrorState message={error.message || "An unexpected error occurred."} onRetry={reset} />
    </PageContainer>
  );
}
