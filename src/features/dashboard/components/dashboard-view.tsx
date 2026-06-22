import { DashboardCompanyCard } from "@/features/dashboard/components/dashboard-company-card";
import { DashboardGreeting } from "@/features/dashboard/components/dashboard-greeting";
import { DashboardQuickLinks } from "@/features/dashboard/components/dashboard-quick-links";
import { DashboardRecentCalls } from "@/features/dashboard/components/dashboard-recent-calls";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-cards";
import { DashboardSubscriptionCard } from "@/features/dashboard/components/dashboard-subscription-card";
import { DashboardUsageChart } from "@/components/charts/lazy-charts";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types";
import { PageContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardViewProps {
  fullName: string | null;
  data: DashboardData | null;
}

export function DashboardView({ fullName, data }: DashboardViewProps) {
  if (!data) {
    return (
      <PageContainer>
        <DashboardGreeting fullName={fullName} companyName={null} />
        <Card>
          <CardHeader>
            <CardTitle>No company assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account is not linked to a company yet. Contact your answering service provider
              to get access.
            </p>
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
