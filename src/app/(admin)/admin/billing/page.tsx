import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminBillingView } from "@/features/admin/components/admin-billing-view";
import { getAdminBillingRows } from "@/features/admin/lib/admin.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Billing",
};

async function AdminBillingContent() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Billing"
          description="Manage subscriptions, invoices, and billing configuration."
        />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to load billing data.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const rows = await getAdminBillingRows();
  return <AdminBillingView rows={rows} />;
}

export default function AdminBillingPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminBillingContent />
    </Suspense>
  );
}
