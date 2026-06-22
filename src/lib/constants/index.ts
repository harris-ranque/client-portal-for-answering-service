export const APP_ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  acceptInvitation: "/accept-invitation",
  dashboard: "/dashboard",
  calls: "/calls",
  usage: "/usage",
  billing: "/billing",
  profile: "/profile",
  onboarding: "/onboarding",
  admin: {
    root: "/admin",
    clients: "/admin/clients",
    users: "/admin/users",
    calls: "/admin/calls",
    billing: "/admin/billing",
    onboarding: "/admin/onboarding",
    integrations: "/admin/integrations",
    metrics: "/admin/metrics",
    audit: "/admin/audit",
  },
} as const;

export const API_ROUTES = {
  health: "/api/health",
  auth: {
    logout: "/api/auth/logout",
    session: "/api/auth/session",
  },
  calls: "/api/calls",
  usage: "/api/usage",
  billing: "/api/billing",
  billingPortal: "/api/billing/portal",
  profile: "/api/profile",
  admin: "/api/admin",
  adminMetrics: "/api/admin/metrics",
  justcall: "/api/admin/integrations/justcall",
  justcallSync: "/api/admin/integrations/justcall/sync",
  justcallRetry: "/api/admin/integrations/justcall/retry",
  hubspot: "/api/admin/integrations/hubspot",
  hubspotSync: "/api/admin/integrations/hubspot/sync",
  hubspotRetry: "/api/admin/integrations/hubspot/retry",
  stripe: "/api/admin/integrations/stripe",
  stripeSync: "/api/admin/integrations/stripe/sync",
  stripeRetry: "/api/admin/integrations/stripe/retry",
  webhooks: {
    stripe: "/api/webhooks/stripe",
  },
} as const;

export const USER_ROLES = {
  admin: "admin",
  client: "client",
} as const;

export const USER_ROLE_LABELS: Record<(typeof USER_ROLES)[keyof typeof USER_ROLES], string> = {
  admin: "System Admin",
  client: "Client User",
};

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/auth/callback",
] as const;

export const AUTH_ONLY_ROUTES = ["/login", "/forgot-password"] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/calls",
  "/usage",
  "/billing",
  "/profile",
  "/onboarding",
] as const;

export const ADMIN_ROUTE_PREFIX = "/admin";

export const DEFAULT_AUTH_REDIRECT = "/dashboard";

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 25,
  maxPageSize: 100,
} as const;
