"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteContactAction,
  updateContactAction,
} from "@/features/profile/actions/contact-actions";
import { ContactFormFields } from "@/features/profile/components/contact-form-fields";
import type { ProfileActionState } from "@/features/profile/lib/action-helpers";
import type { ProfileContact } from "@/features/profile/types/profile.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialState: ProfileActionState = {};

interface ContactsListProps {
  contacts: ProfileContact[];
}

function ContactRow({ contact }: { contact: ProfileContact }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction, isUpdating] = useActionState(updateContactAction, initialState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteContactAction, initialState);

  useEffect(() => {
    if (updateState.success) {
      toast.success("Contact updated.");
      setIsEditing(false);
    }
  }, [updateState.success]);

  useEffect(() => {
    if (deleteState.success) {
      toast.success("Contact removed.");
    }
  }, [deleteState.success]);

  if (isEditing) {
    return (
      <li className="space-y-4 rounded-lg border p-4">
        <form action={updateAction} className="space-y-4">
          <input type="hidden" name="contactId" value={contact.id} />
          <ContactFormFields
            contact={contact}
            fieldErrors={updateState.fieldErrors}
            idPrefix={`edit-${contact.id}`}
          />

          {updateState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {updateState.error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{contact.name}</p>
          {contact.is_primary ? <Badge variant="secondary">Primary</Badge> : null}
        </div>
        {contact.title ? <p className="text-sm text-muted-foreground">{contact.title}</p> : null}
        <div className="text-sm text-muted-foreground">
          {contact.email ? <p>{contact.email}</p> : null}
          {contact.phone ? <p>{contact.phone}</p> : null}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil />
          Edit
        </Button>
        <form action={deleteAction}>
          <input type="hidden" name="contactId" value={contact.id} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={(event) => {
              if (!window.confirm(`Remove ${contact.name} from contacts?`)) {
                event.preventDefault();
              }
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </form>
      </div>

      {deleteState.error ? (
        <p className="text-sm text-destructive sm:col-span-2" role="alert">
          {deleteState.error}
        </p>
      ) : null}
    </li>
  );
}

export function ContactsList({ contacts }: ContactsListProps) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No contacts added yet. Add your first contact below.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {contacts.map((contact) => (
        <ContactRow key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}
