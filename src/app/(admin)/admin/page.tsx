import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminOverview } from "@/features/admin/components/admin-overview";
import { getAdminOverviewMetrics } from "@/features/admin/lib/admin.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin",
};

async function AdminOverviewContent() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Admin overview"
          description="Manage clients, users, integrations, and platform configuration."
        />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure Supabase credentials to load admin metrics.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const metrics = await getAdminOverviewMetrics();

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Admin overview"
        description="Manage clients, users, integrations, and platform configuration."
      />
      <AdminOverview metrics={metrics} />
    </PageContainer>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={6} />
        </PageContainer>
      }
    >
      <AdminOverviewContent />
    </Suspense>
  );
}
