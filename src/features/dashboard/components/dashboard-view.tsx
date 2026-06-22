import Link from "next/link";

import { DashboardCompanyCard } from "@/features/dashboard/components/dashboard-company-card";
import { DashboardGreeting } from "@/features/dashboard/components/dashboard-greeting";
import { DashboardQuickLinks } from "@/features/dashboard/components/dashboard-quick-links";
import { DashboardRecentCalls } from "@/features/dashboard/components/dashboard-recent-calls";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-cards";
import { DashboardSubscriptionCard } from "@/features/dashboard/components/dashboard-subscription-card";
import { DashboardUsageChart } from "@/components/charts/lazy-charts";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";

interface DashboardViewProps {
  fullName: string | null;
  role: string;
  data: DashboardData | null;
}

export function DashboardView({ fullName, role, data }: DashboardViewProps) {
  if (!data) {
    return (
      <PageContainer>
        <DashboardGreeting fullName={fullName} companyName={null} />
        <Card>
          <CardHeader>
            <CardTitle>{role === "admin" ? "No company context" : "No company assigned"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {role === "admin"
                ? "Your admin account is not linked to a client company. Use the admin panel to manage organizations."
                : "Your account is not linked to a company yet. Contact your administrator to get access."}
            </p>
            {role === "admin" ? (
              <Button render={<Link href={APP_ROUTES.admin.root} />}>Open admin panel</Button>
            ) : null}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <DashboardGreeting fullName={fullName} companyName={data.company.name} />

      <DashboardStatCards summary={data.summary} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DashboardUsageChart data={data.chartData} />
          <DashboardRecentCalls calls={data.recentCalls} />
        </div>

        <div className="space-y-6">
          <DashboardCompanyCard company={data.company} onboarding={data.onboarding} />
          <DashboardSubscriptionCard
            subscription={data.subscription}
            latestBilling={data.latestBilling}
          />
          <DashboardQuickLinks />
        </div>
      </div>
    </PageContainer>
  );
}
