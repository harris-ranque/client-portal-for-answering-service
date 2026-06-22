"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createContactAction } from "@/features/profile/actions/contact-actions";
import { ContactFormFields } from "@/features/profile/components/contact-form-fields";
import type { ProfileActionState } from "@/features/profile/lib/action-helpers";
import { Button } from "@/components/ui/button";

const initialState: ProfileActionState = {};

export function ContactAddForm() {
  const [state, formAction, isPending] = useActionState(createContactAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Contact added.");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <p className="text-sm font-medium">Add contact</p>
      <ContactFormFields fieldErrors={state.fieldErrors} idPrefix="add-contact" />

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Adding..." : "Add contact"}
      </Button>
    </form>
  );
}
