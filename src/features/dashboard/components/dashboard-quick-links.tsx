import Link from "next/link";
import { BarChart3, CreditCard, Phone, Rocket, Settings, UserCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  {
    title: "Call logs",
    description: "Search and filter call history",
    href: APP_ROUTES.calls,
    icon: Phone,
  },
  {
    title: "Usage",
    description: "Review monthly usage trends",
    href: APP_ROUTES.usage,
    icon: BarChart3,
  },
  {
    title: "Billing",
    description: "Plans, invoices, and payments",
    href: APP_ROUTES.billing,
    icon: CreditCard,
  },
  {
    title: "Profile",
    description: "Update company details",
    href: APP_ROUTES.profile,
    icon: UserCircle,
  },
  {
    title: "Onboarding",
    description: "Track setup progress",
    href: APP_ROUTES.onboarding,
    icon: Rocket,
  },
  {
    title: "Settings",
    description: "Account preferences",
    href: APP_ROUTES.profile,
    icon: Settings,
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick links</CardTitle>
        <CardDescription>Jump to common portal actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                href={link.href}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  "hover:bg-muted/50",
                )}
              >
                <div className="rounded-md bg-muted p-2">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{link.title}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
