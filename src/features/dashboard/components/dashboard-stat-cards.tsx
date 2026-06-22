import { Clock, Phone, PhoneMissed, Timer } from "lucide-react";

import { formatMinutes } from "@/features/dashboard/lib/formatters";
import type { DashboardSummary } from "@/features/dashboard/types/dashboard.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardStatCardsProps {
  summary: DashboardSummary;
}

export function DashboardStatCards({ summary }: DashboardStatCardsProps) {
  const stats = [
    {
      title: "Minutes used",
      value: formatMinutes(summary.minutesUsed),
      description:
        summary.minutesIncluded !== null
          ? `${formatMinutes(summary.minutesRemaining ?? 0)} remaining of ${formatMinutes(summary.minutesIncluded)}`
          : "Current billing period",
      icon: Timer,
    },
    {
      title: "Remaining minutes",
      value: summary.minutesRemaining !== null ? formatMinutes(summary.minutesRemaining) : "—",
      description:
        summary.minutesIncluded !== null
          ? `of ${formatMinutes(summary.minutesIncluded)} included`
          : "No plan limit configured",
      icon: Clock,
    },
    {
      title: "Calls answered",
      value: summary.callsAnswered.toString(),
      description: "This month",
      icon: Phone,
    },
    {
      title: "Missed calls",
      value: summary.callsMissed.toString(),
      description: "This month",
      icon: PhoneMissed,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.title} size="sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.title === "Minutes used" && summary.usagePercent !== null ? (
                <Progress value={summary.usagePercent} />
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
