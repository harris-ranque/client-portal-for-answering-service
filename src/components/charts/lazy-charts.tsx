"use client";

import dynamic from "next/dynamic";

import { LoadingSkeleton } from "@/components/feedback";

function ChartFallback() {
  return <LoadingSkeleton rows={6} />;
}

export const DashboardUsageChart = dynamic(
  () =>
    import("@/features/dashboard/components/dashboard-usage-chart").then(
      (module) => module.DashboardUsageChart,
    ),
  {
    loading: ChartFallback,
    ssr: false,
  },
);

export const UsageMinutesChart = dynamic(
  () =>
    import("@/features/usage/components/usage-minutes-chart").then(
      (module) => module.UsageMinutesChart,
    ),
  {
    loading: ChartFallback,
    ssr: false,
  },
);

export const UsageCallsChart = dynamic(
  () =>
    import("@/features/usage/components/usage-calls-chart").then((module) => module.UsageCallsChart),
  {
    loading: ChartFallback,
    ssr: false,
  },
);
