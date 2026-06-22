"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireProfileAccess,
  type ProfileActionState,
} from "@/features/profile/lib/action-helpers";
import { updateCompanyProfile } from "@/features/profile/lib/profile.repository";
import { companyProfileSchema } from "@/features/profile/schemas/profile.schema";
import { APP_ROUTES } from "@/lib/constants";

export async function updateCompanyProfileAction(
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

  const parsed = companyProfileSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateCompanyProfile(access.user.companyId, parsed.data);
    revalidatePath(APP_ROUTES.profile);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update company profile.",
    };
  }
}
