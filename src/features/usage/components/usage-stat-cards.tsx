import { Clock, Phone, PhoneMissed, Timer } from "lucide-react";

import {
  formatAverageDuration,
  formatMinutes,
} from "@/features/usage/lib/formatters";
import { formatPeriodRange } from "@/features/usage/lib/periods";
import type { UsageSummary } from "@/features/usage/types/usage.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageStatCardsProps {
  summary: UsageSummary;
}

export function UsageStatCards({ summary }: UsageStatCardsProps) {
  const periodLabel =
    summary.periodStart && summary.periodEnd
      ? formatPeriodRange(summary.periodStart, summary.periodEnd)
      : "Current billing period";

  const stats = [
    {
      title: "Monthly minutes",
      value: formatMinutes(summary.minutesUsed),
      description:
        summary.minutesIncluded !== null
          ? `${formatMinutes(summary.minutesRemaining ?? 0)} remaining of ${formatMinutes(summary.minutesIncluded)}`
          : periodLabel,
      icon: Timer,
      showProgress: summary.usagePercent !== null,
    },
    {
      title: "Calls answered",
      value: summary.callsAnswered.toLocaleString(),
      description: `${summary.totalCalls.toLocaleString()} total calls`,
      icon: Phone,
      showProgress: false,
    },
    {
      title: "Missed calls",
      value: summary.callsMissed.toLocaleString(),
      description:
        summary.totalCalls > 0
          ? `${Math.round((summary.callsMissed / summary.totalCalls) * 100)}% miss rate`
          : "No calls this period",
      icon: PhoneMissed,
      showProgress: false,
    },
    {
      title: "Average duration",
      value: formatAverageDuration(summary.averageDurationSeconds),
      description: "Per answered call",
      icon: Clock,
      showProgress: false,
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
              {stat.showProgress && summary.usagePercent !== null ? (
                <Progress value={summary.usagePercent} />
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
