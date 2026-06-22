"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { createClientAction } from "@/features/admin/actions/client-actions";
import type { AdminActionState } from "@/features/admin/lib/action-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AdminActionState = {};

export function ClientCreateForm() {
  const [state, formAction, isPending] = useActionState(createClientAction, initialState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Client created.");
      setIsOpen(false);
    }
  }, [state.success]);

  if (!isOpen) {
    return (
      <Button type="button" onClick={() => setIsOpen(true)}>
        Add client
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add client</CardTitle>
        <CardDescription>Create a new client organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <Field data-invalid={Boolean(state.fieldErrors?.name)}>
              <FieldLabel htmlFor="create-name">Company name</FieldLabel>
              <Input id="create-name" name="name" required />
              <FieldError errors={state.fieldErrors?.name?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.email)}>
              <FieldLabel htmlFor="create-email">Email</FieldLabel>
              <Input id="create-email" name="email" type="email" />
              <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.phone)}>
              <FieldLabel htmlFor="create-phone">Phone</FieldLabel>
              <Input id="create-phone" name="phone" type="tel" />
              <FieldError errors={state.fieldErrors?.phone?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={Boolean(state.fieldErrors?.address)}>
              <FieldLabel htmlFor="create-address">Address</FieldLabel>
              <textarea
                id="create-address"
                name="address"
                rows={3}
                className={cn(
                  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
              <FieldError errors={state.fieldErrors?.address?.map((message) => ({ message }))} />
            </Field>
          </FieldGroup>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create client"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
