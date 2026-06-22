"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireAdminAction,
  type AdminActionState,
} from "@/features/admin/lib/action-helpers";
import {
  generateAdminPasswordResetLink,
  inviteAdminUser,
  resendAdminUserInvitation,
  revokeAdminUserSessions,
  setAdminUserActive,
} from "@/features/admin/lib/users.repository";
import { inviteUserSchema, userIdSchema } from "@/features/admin/schemas/user.schema";
import { writeAuditLog } from "@/lib/audit/audit-log.service";
import { APP_ROUTES } from "@/lib/constants";

export async function inviteUserAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = inviteUserSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.role === "client" && !parsed.data.companyId) {
    return { error: "Client users must be assigned to a company." };
  }

  try {
    const invited = await inviteAdminUser(parsed.data);
    await writeAuditLog({
      actorId: access.user.id,
      companyId: parsed.data.companyId ?? null,
      action: "user.invite",
      entityType: "user",
      entityId: invited.userId ?? null,
      metadata: { email: parsed.data.email, role: parsed.data.role },
    });
    revalidatePath(APP_ROUTES.admin.users);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to invite user.",
    };
  }
}

export async function resetUserPasswordAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const email = formData.get("email")?.toString();

  if (!email) {
    return { error: "User email is required." };
  }

  try {
    const resetLink = await generateAdminPasswordResetLink(email);
    await writeAuditLog({
      actorId: access.user.id,
      action: "user.password_reset",
      entityType: "user",
      metadata: { email },
    });
    return { success: true, resetLink };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to generate reset link.",
    };
  }
}

export async function toggleUserActiveAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = userIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const isActive = formData.get("isActive") === "true";

  try {
    await setAdminUserActive(parsed.data.userId, isActive);

    if (!isActive) {
      await revokeAdminUserSessions(parsed.data.userId);
    }

    await writeAuditLog({
      actorId: access.user.id,
      action: isActive ? "user.activate" : "user.deactivate",
      entityType: "user",
      entityId: parsed.data.userId,
    });
    revalidatePath(APP_ROUTES.admin.users);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update user status.",
    };
  }
}

export async function resendInvitationAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const email = formData.get("email")?.toString();

  if (!email) {
    return { error: "User email is required." };
  }

  try {
    const inviteLink = await resendAdminUserInvitation(email);
    await writeAuditLog({
      actorId: access.user.id,
      action: "user.invite_resend",
      entityType: "user",
      metadata: { email },
    });
    return { success: true, resetLink: inviteLink };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to resend invitation.",
    };
  }
}
