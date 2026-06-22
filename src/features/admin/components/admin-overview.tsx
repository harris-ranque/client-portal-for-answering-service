import Link from "next/link";
import { Building2, DollarSign, Phone, RefreshCw, Timer, Users } from "lucide-react";

import type { AdminOverviewMetrics } from "@/features/admin/types/admin.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";

interface AdminOverviewProps {
  metrics: AdminOverviewMetrics;
}

function formatRevenue(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function AdminOverview({ metrics }: AdminOverviewProps) {
  const cards = [
    {
      title: "Active clients",
      value: metrics.activeCompanies.toLocaleString(),
      description: `${metrics.totalCompanies} total · ${metrics.onboardingInProgress} onboarding`,
      icon: Building2,
      href: APP_ROUTES.admin.clients,
    },
    {
      title: "Client users",
      value: metrics.totalUsers.toLocaleString(),
      description: "Portal accounts",
      icon: Users,
      href: APP_ROUTES.admin.users,
    },
    {
      title: "Calls this month",
      value: metrics.callsThisMonth.toLocaleString(),
      description: `${metrics.totalCalls.toLocaleString()} all time`,
      icon: Phone,
      href: APP_ROUTES.admin.calls,
    },
    {
      title: "Minutes this month",
      value: metrics.totalMinutesThisMonth.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }),
      description: `${metrics.activeSubscriptions} active subscriptions`,
      icon: Timer,
      href: APP_ROUTES.admin.metrics,
    },
    {
      title: "Monthly revenue",
      value: formatRevenue(metrics.monthlyRevenueCents),
      description: "Paid invoices this month",
      icon: DollarSign,
      href: APP_ROUTES.admin.billing,
    },
    {
      title: "Sync status",
      value: metrics.failedSyncJobs.toLocaleString(),
      description:
        metrics.runningSyncJobs > 0
          ? `${metrics.runningSyncJobs} running · failed jobs`
          : "Failed integration sync jobs",
      icon: RefreshCw,
      href: APP_ROUTES.admin.integrations,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link key={card.title} href={card.href}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
