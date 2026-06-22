import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock,
  Headphones,
  Phone,
  Receipt,
  Shield,
  UserCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import type { SessionUser } from "@/types";

const FEATURES = [
  {
    icon: Phone,
    title: "Call history",
    description:
      "Search, filter, and export every call your answering service handles — with recordings, notes, and agent details.",
  },
  {
    icon: BarChart3,
    title: "Usage tracking",
    description:
      "Monitor monthly minutes, call volume, and plan allowance with clear charts and period comparisons.",
  },
  {
    icon: Receipt,
    title: "Billing & invoices",
    description:
      "View your subscription, payment status, and invoice history. Manage billing through Stripe when enabled.",
  },
  {
    icon: UserCircle,
    title: "Company profile",
    description:
      "Keep business details and contact information up to date so your answering team always has the right context.",
  },
  {
    icon: Clock,
    title: "Always current",
    description:
      "Dashboard summaries refresh with your latest calls, usage, and account status every time you sign in.",
  },
  {
    icon: Shield,
    title: "Secure access",
    description:
      "Role-based sign-in keeps your company data private. Only your team sees your account information.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Sign in securely",
    description: "Use the credentials provided by your answering service provider.",
  },
  {
    step: "02",
    title: "Review your activity",
    description: "Check recent calls, monthly usage, and messages handled on your behalf.",
  },
  {
    step: "03",
    title: "Manage your account",
    description: "Update company details, download records, and handle billing in one place.",
  },
] as const;

interface LandingPageProps {
  user: SessionUser | null;
}

export function LandingPage({ user }: LandingPageProps) {
  const primaryHref = user ? APP_ROUTES.dashboard : APP_ROUTES.login;
  const primaryLabel = user ? "Go to dashboard" : "Sign in to your portal";

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--color-primary)/0.08,transparent)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
              <Headphones className="size-4 text-primary" />
              <span>Client portal for answering service customers</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Your calls, usage, and billing —{" "}
              <span className="text-muted-foreground">in one place</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              {clientEnv.NEXT_PUBLIC_APP_NAME} gives your business a secure window into call
              activity handled by your answering service. Track minutes, review messages, and manage
              your account without waiting on reports.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href={primaryHref} />}>
                {primaryLabel}
                <ArrowRight className="ml-1" />
              </Button>
              <Button variant="outline" size="lg" render={<Link href="#features" />}>
                See what&apos;s included
              </Button>
            </div>
          </div>

          <dl className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              { label: "Call records", value: "Searchable history" },
              { label: "Usage insights", value: "Monthly minutes & volume" },
              { label: "Account control", value: "Profile & billing" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border bg-card/60 px-5 py-4 text-center backdrop-blur-sm"
              >
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 text-base font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">
            Built for businesses that rely on a professional answering service and want transparency
            into every interaction.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="border bg-card/50">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-pretty">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Get started in minutes with the access credentials from your service provider.
            </p>
          </div>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="relative">
                <p className="text-4xl font-semibold tracking-tight text-primary/20">{item.step}</p>
                <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-12">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to review your answering service activity?
            </h2>
            <p className="max-w-lg text-primary-foreground/80">
              Sign in to access your dashboard, call logs, usage reports, and billing information.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-foreground"
              render={<Link href={primaryHref} />}
            >
              {primaryLabel}
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {clientEnv.NEXT_PUBLIC_APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href={APP_ROUTES.login} className="hover:text-foreground hover:underline">
              Sign in
            </Link>
            {user ? (
              <Link href={APP_ROUTES.dashboard} className="hover:text-foreground hover:underline">
                Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    </>
  );
}
