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
import { writeAuditLog } from "@/lib/audit/audit-log.service";
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
    const created = await createAdminClient(parsed.data);
    await writeAuditLog({
      actorId: access.user.id,
      companyId: created.id,
      action: "client.create",
      entityType: "company",
      entityId: created.id,
      metadata: { name: parsed.data.name },
    });
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
    await writeAuditLog({
      actorId: access.user.id,
      companyId: idParsed.data.clientId,
      action: "client.update",
      entityType: "company",
      entityId: idParsed.data.clientId,
      metadata: { name: parsed.data.name },
    });
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
    await writeAuditLog({
      actorId: access.user.id,
      companyId: parsed.data.clientId,
      action: isActive ? "client.activate" : "client.deactivate",
      entityType: "company",
      entityId: parsed.data.clientId,
    });
    revalidatePath(APP_ROUTES.admin.clients);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update client status.",
    };
  }
}
