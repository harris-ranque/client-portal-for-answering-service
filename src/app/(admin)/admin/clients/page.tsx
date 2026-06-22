import type { Metadata } from "next";
import { Suspense } from "react";

import { ClientsView } from "@/features/admin/components/clients-view";
import { getAdminClients } from "@/features/admin/lib/clients.repository";
import { parseClientsSearchParams } from "@/features/admin/lib/parse-query";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Clients",
};

interface AdminClientsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AdminClientsContent({ searchParams }: AdminClientsPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <PageHeader title="Clients" description="Create, edit, and manage client organizations." />
        <Card>
          <CardHeader>
            <CardTitle>Supabase not configured</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure Supabase to manage clients.</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const params = await searchParams;
  const query = parseClientsSearchParams(params);
  const result = await getAdminClients(query);

  return (
    <ClientsView
      result={result}
      filters={{
        search: query.search,
        status: query.status,
      }}
    />
  );
}

export default function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingSkeleton rows={8} />
        </PageContainer>
      }
    >
      <AdminClientsContent searchParams={searchParams} />
    </Suspense>
  );
}
