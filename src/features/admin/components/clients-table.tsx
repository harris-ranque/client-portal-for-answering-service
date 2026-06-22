"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  toggleClientActiveAction,
  updateClientAction,
} from "@/features/admin/actions/client-actions";
import type { AdminActionState } from "@/features/admin/lib/action-helpers";
import type { AdminCompanyListItem } from "@/features/admin/types/admin.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: AdminActionState = {};

function ClientEditForm({ client }: { client: AdminCompanyListItem }) {
  const [state, formAction, isPending] = useActionState(updateClientAction, initialState);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Client updated.");
      setIsEditing(false);
    }
  }, [state.success]);

  if (!isEditing) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        <Pencil />
        Edit
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-lg border p-4">
      <input type="hidden" name="clientId" value={client.id} />
      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors?.name)}>
          <FieldLabel htmlFor={`name-${client.id}`}>Company name</FieldLabel>
          <Input id={`name-${client.id}`} name="name" defaultValue={client.name} required />
          <FieldError errors={state.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`email-${client.id}`}>Email</FieldLabel>
          <Input
            id={`email-${client.id}`}
            name="email"
            type="email"
            defaultValue={client.email ?? ""}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`phone-${client.id}`}>Phone</FieldLabel>
          <Input id={`phone-${client.id}`} name="phone" defaultValue={client.phone ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`address-${client.id}`}>Address</FieldLabel>
          <textarea
            id={`address-${client.id}`}
            name="address"
            rows={2}
            defaultValue={client.address ?? ""}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
            )}
          />
        </Field>
      </FieldGroup>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ClientStatusToggle({ client }: { client: AdminCompanyListItem }) {
  const [state, formAction, isPending] = useActionState(toggleClientActiveAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(client.is_active ? "Client deactivated." : "Client activated.");
    }
  }, [state.success, client.is_active]);

  return (
    <form action={formAction}>
      <input type="hidden" name="clientId" value={client.id} />
      <input type="hidden" name="isActive" value={client.is_active ? "false" : "true"} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {client.is_active ? "Deactivate" : "Activate"}
      </Button>
      {state.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}

interface ClientsTableProps {
  clients: AdminCompanyListItem[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (clients.length === 0) {
    return <p className="text-sm text-muted-foreground">No clients match your filters.</p>;
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{client.name}</p>
                <Badge variant={client.is_active ? "default" : "secondary"}>
                  {client.is_active ? "Active" : "Inactive"}
                </Badge>
                {client.onboardingStatus ? (
                  <Badge variant="outline" className="capitalize">
                    {client.onboardingStatus.replace(/_/g, " ")}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {client.email ?? "No email"} · {client.memberCount} users
              </p>
              {client.phone ? <p className="text-sm text-muted-foreground">{client.phone}</p> : null}
            </div>
            <div className="flex gap-2">
              <ClientEditForm client={client} />
              <ClientStatusToggle client={client} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
