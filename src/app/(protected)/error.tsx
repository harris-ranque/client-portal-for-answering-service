"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/async-states";
import { PageContainer, PageHeader } from "@/components/layout/page-shell";

interface ProtectedErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Something went wrong" description="We could not load this page." />
      <ErrorState message={error.message || "An unexpected error occurred."} onRetry={reset} />
    </PageContainer>
  );
}
