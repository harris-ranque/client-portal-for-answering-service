import type { Metadata } from "next";
import { Suspense } from "react";

import { UsersView } from "@/features/admin/components/users-view";
import { getAdminCompanyOptions } from "@/features/admin/lib/admin.repository";
import { parseUsersSearchParams } from "@/features/admin/lib/parse-query";
import { getAdminUsers } from "@/features/admin/lib/users.repository";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Users",
};

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AdminUsersContent({ searchParams }: AdminUsersPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Users" description="Invite users, assign roles, and manage access." />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to manage users.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const params = await searchParams;
  const query = parseUsersSearchParams(params);
  const [result, companies] = await Promise.all([getAdminUsers(query), getAdminCompanyOptions()]);

  return (
    <UsersView
      result={result}
      companies={companies}
      filters={{
        search: query.search,
        role: query.role,
      }}
    />
  );
}

export default function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminUsersContent searchParams={searchParams} />
    </Suspense>
  );
}
