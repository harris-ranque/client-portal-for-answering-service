import Link from "next/link";

import { formatMinutes } from "@/features/usage/lib/formatters";
import type { BillingUsageSummary } from "@/features/billing/types/billing.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";

interface BillingUsageCardProps {
  usage: BillingUsageSummary;
}

export function BillingUsageCard({ usage }: BillingUsageCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Current usage</CardTitle>
          <CardDescription>Minutes and call volume for this billing period.</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href={APP_ROUTES.usage} />}>
          View details
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Minutes used</p>
            <p className="text-2xl font-semibold">{formatMinutes(usage.minutesUsed)}</p>
            {usage.minutesIncluded !== null ? (
              <p className="text-xs text-muted-foreground">
                of {formatMinutes(usage.minutesIncluded)} included
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calls answered</p>
            <p className="text-2xl font-semibold">{usage.callsAnswered.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Missed calls</p>
            <p className="text-2xl font-semibold">{usage.callsMissed.toLocaleString()}</p>
          </div>
        </div>

        {usage.usagePercent !== null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan usage</span>
              <span className="font-medium">{usage.usagePercent}%</span>
            </div>
            <Progress value={usage.usagePercent} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
