import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { requireAuth, getSessionUserWithCompany } from "@/features/auth";
import { ProfileView } from "@/features/profile/components/profile-view";
import { getProfileData } from "@/features/profile/lib/profile.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Profile",
};

function ProfileContentFallback() {
  return (
    <PageContainer className="space-y-6">
      <LoadingSkeleton rows={8} />
    </PageContainer>
  );
}

async function ProfileContent() {
  const user = await requireAuth();
  const sessionData = await getSessionUserWithCompany();
  const companyId = sessionData?.session?.companyId ?? user.companyId;

  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader
          title="Profile"
          description="Manage your account, company details, and contacts."
        />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure Supabase credentials to load and update your profile.
            </p>
            {user.role === "admin" ? (
              <Button render={<Link href={APP_ROUTES.admin.root} />}>Open admin panel</Button>
            ) : null}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const data = await getProfileData(user.id, companyId);

  if (!data) {
    return (
      <PageContainer>
        <PageHeader
          title="Profile"
          description="Manage your account, company details, and contacts."
        />
        <Card>
          <CardHeader>
            <CardTitle>Profile unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Unable to load your profile.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return <ProfileView data={data} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileContentFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
