import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Link2,
  Phone,
  Rocket,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: APP_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Call Logs",
    href: APP_ROUTES.calls,
    icon: Phone,
  },
  {
    title: "Usage",
    href: APP_ROUTES.usage,
    icon: BarChart3,
  },
  {
    title: "Billing",
    href: APP_ROUTES.billing,
    icon: CreditCard,
  },
  {
    title: "Profile",
    href: APP_ROUTES.profile,
    icon: UserCircle,
  },
  {
    title: "Onboarding",
    href: APP_ROUTES.onboarding,
    icon: Rocket,
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    href: APP_ROUTES.admin.root,
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: APP_ROUTES.admin.clients,
    icon: Building2,
  },
  {
    title: "Users",
    href: APP_ROUTES.admin.users,
    icon: Users,
  },
  {
    title: "All Calls",
    href: APP_ROUTES.admin.calls,
    icon: Phone,
  },
  {
    title: "Billing",
    href: APP_ROUTES.admin.billing,
    icon: CreditCard,
  },
  {
    title: "Onboarding",
    href: APP_ROUTES.admin.onboarding,
    icon: Rocket,
  },
  {
    title: "Integrations",
    href: APP_ROUTES.admin.integrations,
    icon: Link2,
  },
  {
    title: "Metrics",
    href: APP_ROUTES.admin.metrics,
    icon: BarChart3,
  },
];

export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  {
    title: "Client Portal",
    href: APP_ROUTES.dashboard,
    icon: Settings,
  },
];

export function isNavItemActive(pathname: string, href: string) {
  if (href === APP_ROUTES.dashboard || href === APP_ROUTES.admin.root) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
