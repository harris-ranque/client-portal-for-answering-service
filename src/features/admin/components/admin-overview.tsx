import Link from "next/link";
import { Building2, Phone, Timer, Users } from "lucide-react";

import type { AdminOverviewMetrics } from "@/features/admin/types/admin.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";

interface AdminOverviewProps {
  metrics: AdminOverviewMetrics;
}

export function AdminOverview({ metrics }: AdminOverviewProps) {
  const cards = [
    {
      title: "Companies",
      value: metrics.activeCompanies.toLocaleString(),
      description: `${metrics.totalCompanies} total · ${metrics.onboardingInProgress} onboarding`,
      icon: Building2,
      href: APP_ROUTES.admin.clients,
    },
    {
      title: "Users",
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
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
