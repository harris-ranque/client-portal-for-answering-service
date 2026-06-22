"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateOnboardingAction } from "@/features/admin/actions/onboarding-actions";
import type { AdminActionState } from "@/features/admin/lib/action-helpers";
import type { AdminOnboardingRow } from "@/features/admin/types/admin.types";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const initialState: AdminActionState = {};

const STATUS_OPTIONS = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
] as const;

interface AdminOnboardingEditSheetProps {
  row: AdminOnboardingRow;
}

export function AdminOnboardingEditSheet({ row }: AdminOnboardingEditSheetProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateOnboardingAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Onboarding updated.");
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit onboarding</SheetTitle>
            <SheetDescription>{row.company.name}</SheetDescription>
          </SheetHeader>

          <form action={formAction} className="flex flex-1 flex-col gap-4 px-4 pb-4">
            <input type="hidden" name="onboardingId" value={row.onboarding.id} />

            <FieldGroup>
              <Field data-invalid={Boolean(state.fieldErrors?.status)}>
                <FieldLabel htmlFor={`status-${row.onboarding.id}`}>Status</FieldLabel>
                <select
                  id={`status-${row.onboarding.id}`}
                  name="status"
                  defaultValue={row.onboarding.status}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <FieldError errors={state.fieldErrors?.status?.map((message) => ({ message }))} />
              </Field>

              <Field data-invalid={Boolean(state.fieldErrors?.currentStep)}>
                <FieldLabel htmlFor={`current-step-${row.onboarding.id}`}>Current step</FieldLabel>
                <Input
                  id={`current-step-${row.onboarding.id}`}
                  name="currentStep"
                  defaultValue={row.onboarding.current_step ?? ""}
                  placeholder="profile, billing, launch..."
                />
                <FieldError
                  errors={state.fieldErrors?.currentStep?.map((message) => ({ message }))}
                />
              </Field>

              <Field data-invalid={Boolean(state.fieldErrors?.completedStep)}>
                <FieldLabel htmlFor={`completed-step-${row.onboarding.id}`}>
                  Mark step complete
                </FieldLabel>
                <Input
                  id={`completed-step-${row.onboarding.id}`}
                  name="completedStep"
                  placeholder="Optional step to append"
                />
                <FieldError
                  errors={state.fieldErrors?.completedStep?.map((message) => ({ message }))}
                />
              </Field>

              <Field data-invalid={Boolean(state.fieldErrors?.notes)}>
                <FieldLabel htmlFor={`notes-${row.onboarding.id}`}>Notes</FieldLabel>
                <textarea
                  id={`notes-${row.onboarding.id}`}
                  name="notes"
                  defaultValue={row.onboarding.notes ?? ""}
                  rows={4}
                  className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <FieldError errors={state.fieldErrors?.notes?.map((message) => ({ message }))} />
              </Field>
            </FieldGroup>

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
