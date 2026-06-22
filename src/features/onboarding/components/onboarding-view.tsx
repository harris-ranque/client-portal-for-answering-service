import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import {
  formatOnboardingStatus,
  getOnboardingChecklistSteps,
  getOnboardingProgressPercent,
} from "@/features/onboarding/lib/formatters";
import type { OnboardingRecord } from "@/features/onboarding/types/onboarding.types";
import { PageContainer, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnboardingViewProps {
  onboarding: OnboardingRecord | null;
}

export function OnboardingView({ onboarding }: OnboardingViewProps) {
  if (!onboarding) {
    return (
      <PageContainer className="space-y-6">
        <PageHeader
          title="Onboarding"
          description="Track your onboarding progress and next steps."
        />
        <Card>
          <CardHeader>
            <CardTitle>Onboarding not started</CardTitle>
            <CardDescription>
              Your onboarding record has not been created yet. Contact your account manager if you
              expected to see progress here.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageContainer>
    );
  }

  const completedSteps = Array.isArray(onboarding.completed_steps)
    ? onboarding.completed_steps.filter((step): step is string => typeof step === "string")
    : [];
  const checklist = getOnboardingChecklistSteps(completedSteps, onboarding.current_step);
  const progressPercent = getOnboardingProgressPercent(completedSteps);

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Track your onboarding progress and next steps."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Progress</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {formatOnboardingStatus(onboarding.status)}
              </Badge>
            </div>
            <CardDescription>
              {onboarding.current_step
                ? `Current step: ${onboarding.current_step.replace(/_/g, " ")}`
                : "Your onboarding workflow is being prepared."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} />
            </div>

            <ul className="space-y-3">
              {checklist.map((item) => (
                <li
                  key={item.step}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    item.current && "border-primary/40 bg-primary/5",
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : item.current ? (
                    <CircleDot className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.completed
                        ? "Completed"
                        : item.current
                          ? "In progress"
                          : "Pending"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {onboarding.completed_at ? (
              <div>
                <p className="text-muted-foreground">Completed on</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(onboarding.completed_at))}
                </p>
              </div>
            ) : null}

            {onboarding.notes ? (
              <div>
                <p className="text-muted-foreground">Notes from your team</p>
                <p className="whitespace-pre-wrap font-medium">{onboarding.notes}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No additional notes at this time.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
