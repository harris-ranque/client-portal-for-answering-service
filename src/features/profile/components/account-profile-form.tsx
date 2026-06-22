"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateUserProfileAction } from "@/features/profile/actions/update-user-profile";
import type { ProfileActionState } from "@/features/profile/lib/action-helpers";
import type { ProfileUser } from "@/features/profile/types/profile.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: ProfileActionState = {};

interface AccountProfileFormProps {
  user: ProfileUser;
}

export function AccountProfileForm({ user }: AccountProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateUserProfileAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Account profile updated.");
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your account</CardTitle>
        <CardDescription>Update your personal name shown in the portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <FieldGroup>
            <Field data-invalid={Boolean(state.fieldErrors?.fullName)}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={user.full_name ?? ""}
                required
                aria-invalid={Boolean(state.fieldErrors?.fullName)}
              />
              <FieldError errors={state.fieldErrors?.fullName?.map((message) => ({ message }))} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                Contact support to change your sign-in email.
              </p>
            </Field>
          </FieldGroup>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
