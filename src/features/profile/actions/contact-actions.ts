"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireProfileAccess,
  type ProfileActionState,
} from "@/features/profile/lib/action-helpers";
import {
  createCompanyContact,
  deleteCompanyContact,
  updateCompanyContact,
} from "@/features/profile/lib/profile.repository";
import { contactIdSchema, contactSchema } from "@/features/profile/schemas/profile.schema";
import { APP_ROUTES } from "@/lib/constants";

export async function createContactAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const access = await requireProfileAccess();

  if ("error" in access) {
    return { error: access.error };
  }

  if (!access.user.companyId) {
    return { error: "No company is assigned to this account." };
  }

  const parsed = contactSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createCompanyContact(access.user.companyId, parsed.data);
    revalidatePath(APP_ROUTES.profile);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add contact.",
    };
  }
}

export async function updateContactAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const access = await requireProfileAccess();

  if ("error" in access) {
    return { error: access.error };
  }

  if (!access.user.companyId) {
    return { error: "No company is assigned to this account." };
  }

  const idParsed = contactIdSchema.safeParse(formDataToObject(formData));

  if (!idParsed.success) {
    return { fieldErrors: idParsed.error.flatten().fieldErrors };
  }

  const parsed = contactSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateCompanyContact(
      access.user.companyId,
      idParsed.data.contactId,
      parsed.data,
    );
    revalidatePath(APP_ROUTES.profile);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update contact.",
    };
  }
}

export async function deleteContactAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const access = await requireProfileAccess();

  if ("error" in access) {
    return { error: access.error };
  }

  if (!access.user.companyId) {
    return { error: "No company is assigned to this account." };
  }

  const parsed = contactIdSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await deleteCompanyContact(access.user.companyId, parsed.data.contactId);
    revalidatePath(APP_ROUTES.profile);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete contact.",
    };
  }
}
