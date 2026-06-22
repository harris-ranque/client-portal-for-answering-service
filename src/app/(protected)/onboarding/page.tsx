import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAuth, getSessionUserWithCompany } from "@/features/auth";
import { getCompanyOnboarding, OnboardingView } from "@/features/onboarding";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Onboarding",
};

function OnboardingContentFallback() {
  return (
    <PageContainer className="space-y-6">
      <LoadingSkeleton rows={8} />
    </PageContainer>
  );
}

async function OnboardingContent() {
  const user = await requireAuth();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;

  if (!companyId || !isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Onboarding"
          description="Track your onboarding progress and next steps."
        />
        <Card>
          <CardHeader>
            <CardTitle>
              {!isSupabaseConfigured() ? "Supabase not configured" : "No company assigned"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {!isSupabaseConfigured()
                ? "Configure Supabase credentials to load onboarding status."
                : "Your account is not linked to a company yet."}
            </p>
            {user.role === "admin" ? (
              <Button render={<Link href={APP_ROUTES.admin.onboarding} />}>
                Manage onboarding
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const onboarding = await getCompanyOnboarding(companyId);

  return <OnboardingView onboarding={onboarding} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingContentFallback />}>
      <OnboardingContent />
    </Suspense>
  );
}
