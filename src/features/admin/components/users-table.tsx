"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  resetUserPasswordAction,
  toggleUserActiveAction,
} from "@/features/admin/actions/user-actions";
import type { AdminActionState } from "@/features/admin/lib/action-helpers";
import type { AdminUserRecord } from "@/features/admin/types/admin.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminActionState = {};

function UserResetPassword({ user }: { user: AdminUserRecord }) {
  const [state, formAction, isPending] = useActionState(resetUserPasswordAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Password reset link generated.");
    }
  }, [state.success]);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="email" value={user.email} />
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          Reset password
        </Button>
      </form>
      {state.resetLink ? (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Recovery link (share securely):</p>
          <Input readOnly value={state.resetLink} className="text-xs" />
        </div>
      ) : null}
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </div>
  );
}

function UserStatusToggle({ user }: { user: AdminUserRecord }) {
  const [state, formAction, isPending] = useActionState(toggleUserActiveAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(user.is_active ? "User deactivated." : "User activated.");
    }
  }, [state.success, user.is_active]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="isActive" value={user.is_active ? "false" : "true"} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {user.is_active ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}

interface UsersTableProps {
  users: AdminUserRecord[];
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users match your filters.</p>;
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{user.full_name ?? user.email}</p>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant={user.is_active ? "default" : "outline"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.companyName ? (
                <p className="text-sm text-muted-foreground">Company: {user.companyName}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <UserStatusToggle user={user} />
            </div>
          </div>
          <UserResetPassword user={user} />
        </div>
      ))}
    </div>
  );
}
