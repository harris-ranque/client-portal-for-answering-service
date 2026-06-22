"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { inviteUserAction } from "@/features/admin/actions/user-actions";
import type { AdminActionState } from "@/features/admin/lib/action-helpers";
import { USER_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AdminActionState = {};

interface UserInviteFormProps {
  companies: Array<{ id: string; name: string; is_active: boolean }>;
}

export function UserInviteForm({ companies }: UserInviteFormProps) {
  const [state, formAction, isPending] = useActionState(inviteUserAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Invitation sent.");
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite user</CardTitle>
        <CardDescription>Send an email invitation to join the portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={Boolean(state.fieldErrors?.fullName)}>
              <FieldLabel htmlFor="invite-fullName">Full name</FieldLabel>
              <Input id="invite-fullName" name="fullName" required />
              <FieldError errors={state.fieldErrors?.fullName?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.email)}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input id="invite-email" name="email" type="email" required />
              <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <select
                id="invite-role"
                name="role"
                defaultValue={USER_ROLES.client}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value={USER_ROLES.client}>Client User</option>
                <option value={USER_ROLES.admin}>System Admin</option>
              </select>
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.companyId)}>
              <FieldLabel htmlFor="invite-companyId">Company</FieldLabel>
              <select
                id="invite-companyId"
                name="companyId"
                defaultValue=""
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">Select company (required for clients)</option>
                {companies
                  .filter((company) => company.is_active)
                  .map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
              </select>
              <FieldError errors={state.fieldErrors?.companyId?.map((message) => ({ message }))} />
            </Field>
          </FieldGroup>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending..." : "Send invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
