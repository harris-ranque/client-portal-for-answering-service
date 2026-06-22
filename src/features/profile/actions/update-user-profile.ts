"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireProfileAccess,
  type ProfileActionState,
} from "@/features/profile/lib/action-helpers";
import { updateUserProfile } from "@/features/profile/lib/profile.repository";
import { userProfileSchema } from "@/features/profile/schemas/profile.schema";
import { APP_ROUTES } from "@/lib/constants";

export async function updateUserProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const access = await requireProfileAccess();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = userProfileSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updateUserProfile(access.user.id, parsed.data.fullName);
    revalidatePath(APP_ROUTES.profile);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update account profile.",
    };
  }
}
