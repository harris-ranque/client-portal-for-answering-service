import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminAuditView } from "@/features/admin/components/admin-audit-view";
import { getAdminAuditLogs } from "@/lib/audit/audit-log.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Audit Log",
};

async function AdminAuditContent() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Audit log" description="Review administrative actions." />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to load audit logs.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const rows = await getAdminAuditLogs({ limit: 100 });
  return <AdminAuditView rows={rows} />;
}

export default function AdminAuditPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminAuditContent />
    </Suspense>
  );
}
