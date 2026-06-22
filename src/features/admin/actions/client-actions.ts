"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireAdminAction,
  type AdminActionState,
} from "@/features/admin/lib/action-helpers";
import {
  createAdminClient,
  setAdminClientActive,
  updateAdminClient,
} from "@/features/admin/lib/clients.repository";
import { clientFormSchema, clientIdSchema } from "@/features/admin/schemas/client.schema";
import { APP_ROUTES } from "@/lib/constants";

export async function createClientAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = clientFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createAdminClient(parsed.data);
    revalidatePath(APP_ROUTES.admin.clients);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create client.",
    };
  }
}

export async function updateClientAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const idParsed = clientIdSchema.safeParse(formDataToObject(formData));

  if (!idParsed.success) {
    return { fieldErrors: idParsed.error.flatten().fieldErrors };
  }

  const parsed = clientFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateAdminClient(idParsed.data.clientId, parsed.data);
    revalidatePath(APP_ROUTES.admin.clients);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update client.",
    };
  }
}

export async function toggleClientActiveAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = clientIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const isActive = formData.get("isActive") === "true";

  try {
    await setAdminClientActive(parsed.data.clientId, isActive);
    revalidatePath(APP_ROUTES.admin.clients);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update client status.",
    };
  }
}
