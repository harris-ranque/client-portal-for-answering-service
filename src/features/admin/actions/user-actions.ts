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
  setAdminUserActive,
} from "@/features/admin/lib/users.repository";
import { inviteUserSchema, userIdSchema } from "@/features/admin/schemas/user.schema";
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
    await inviteAdminUser(parsed.data);
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
    revalidatePath(APP_ROUTES.admin.users);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update user status.",
    };
  }
}
