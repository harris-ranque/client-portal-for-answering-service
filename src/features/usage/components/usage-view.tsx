import { Suspense } from "react";

import { UsageHistoryTable } from "@/features/usage/components/usage-history-table";
import { UsagePeriodSelector } from "@/features/usage/components/usage-period-selector";
import { UsageStatCards } from "@/features/usage/components/usage-stat-cards";
import { UsageCallsChart, UsageMinutesChart } from "@/components/charts/lazy-charts";
import type { UsageData } from "@/features/usage/types/usage.types";
import { LoadingSkeleton } from "@/components/feedback";
import { PageContainer, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptionStatusLabel } from "@/features/dashboard/lib/formatters";

interface UsageViewProps {
  data: UsageData;
  months: number;
}

function SelectorFallback() {
  return <LoadingSkeleton rows={1} />;
}

export function UsageView({ data, months }: UsageViewProps) {
  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Usage"
        description="Track monthly minutes, call volume, and usage trends."
        actions={
          <Suspense fallback={<SelectorFallback />}>
            <UsagePeriodSelector months={months} />
          </Suspense>
        }
      />

      {data.subscription ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Current plan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">{data.subscription.plan_name}</span>
            <Badge variant="secondary" className="capitalize">
              {getSubscriptionStatusLabel(data.subscription.status)}
            </Badge>
            {data.subscription.minutes_included !== null ? (
              <span className="text-muted-foreground">
                {data.subscription.minutes_included.toLocaleString()} minutes included
              </span>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <UsageStatCards summary={data.summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <UsageMinutesChart data={data.minutesChart} />
        <UsageCallsChart data={data.callsChart} />
      </div>

      <UsageHistoryTable history={data.history} />
    </PageContainer>
  );
}
