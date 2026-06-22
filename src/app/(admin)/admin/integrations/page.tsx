import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminIntegrationsView } from "@/features/admin/components/admin-integrations-view";
import { getAdminCompanyOptions } from "@/features/admin/lib/admin.repository";
import { getHubSpotSyncHistory } from "@/features/hubspot/lib/sync.repository";
import { getJustCallSyncHistory } from "@/features/justcall/lib/sync.repository";
import { getStripeSyncHistory } from "@/features/stripe/lib/sync.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer } from "@/components/layout";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Integrations",
};

async function AdminIntegrationsContent() {
  if (!isSupabaseConfigured()) {
    return (
      <AdminIntegrationsView
        companies={[]}
        justCallHistory={[]}
        hubSpotHistory={[]}
        stripeHistory={[]}
      />
    );
  }

  const [companies, justCallHistory, hubSpotHistory, stripeHistory] = await Promise.all([
    getAdminCompanyOptions(),
    getJustCallSyncHistory(25).catch(() => []),
    getHubSpotSyncHistory(25).catch(() => []),
    getStripeSyncHistory(25).catch(() => []),
  ]);

  return (
    <AdminIntegrationsView
      companies={companies}
      justCallHistory={justCallHistory}
      hubSpotHistory={hubSpotHistory}
      stripeHistory={stripeHistory}
    />
  );
}

export default function AdminIntegrationsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminIntegrationsContent />
    </Suspense>
  );
}
