import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminOnboardingView } from "@/features/admin/components/admin-onboarding-view";
import { getAdminOnboardingRows } from "@/features/admin/lib/admin.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Onboarding",
};

async function AdminOnboardingContent() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Onboarding" description="Manage client onboarding workflows and status." />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure Supabase to load onboarding records.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const rows = await getAdminOnboardingRows();
  return <AdminOnboardingView rows={rows} />;
}

export default function AdminOnboardingPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminOnboardingContent />
    </Suspense>
  );
}
