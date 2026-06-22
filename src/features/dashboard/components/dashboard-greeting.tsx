import { getGreeting } from "@/features/dashboard/lib/formatters";
import { PageHeader } from "@/components/layout";

interface DashboardGreetingProps {
  fullName: string | null;
  companyName: string | null;
}

export function DashboardGreeting({ fullName, companyName }: DashboardGreetingProps) {
  return (
    <PageHeader
      title={getGreeting(fullName)}
      description={
        companyName
          ? `Here's what's happening with ${companyName} this month.`
          : "Here's your account overview for this month."
      }
    />
  );
}
