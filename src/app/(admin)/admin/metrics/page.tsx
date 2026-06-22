import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminMetricsView } from "@/features/admin/components/admin-metrics-view";
import { getAdminUsageRows } from "@/features/admin/lib/admin.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Metrics",
};

async function AdminMetricsContent() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Metrics"
          description="Platform-wide usage, revenue, and operational metrics."
        />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to load metrics.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const rows = await getAdminUsageRows();
  return <AdminMetricsView rows={rows} />;
}

export default function AdminMetricsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminMetricsContent />
    </Suspense>
  );
}
