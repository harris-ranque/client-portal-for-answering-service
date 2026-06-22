import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Link2,
  Phone,
  Rocket,
  UserCircle,
  Users,
} from "lucide-react";

import { APP_ROUTES, USER_ROLES } from "@/lib/constants";

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
  {
    title: "Audit Log",
    href: APP_ROUTES.admin.audit,
    icon: ClipboardList,
  },
];

export function getNavItemsForRole(role: "admin" | "client") {
  return role === "admin" ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;
}

export function getNavItemsForPath(pathname: string, role: "admin" | "client") {
  const isAdminArea =
    pathname === APP_ROUTES.admin.root || pathname.startsWith(`${APP_ROUTES.admin.root}/`);

  if (isAdminArea && role === USER_ROLES.admin) {
    return ADMIN_NAV_ITEMS;
  }

  return CLIENT_NAV_ITEMS;
}

export function getHomeRouteForRole(role: "admin" | "client") {
  return role === "admin" ? APP_ROUTES.admin.root : APP_ROUTES.dashboard;
}

export function isNavItemActive(pathname: string, href: string) {
  if (href === APP_ROUTES.dashboard || href === APP_ROUTES.admin.root) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
