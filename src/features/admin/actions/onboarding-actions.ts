"use server";

import { revalidatePath } from "next/cache";

import {
  formDataToObject,
  requireAdminAction,
  type AdminActionState,
} from "@/features/admin/lib/action-helpers";
import { updateAdminOnboarding } from "@/features/admin/lib/onboarding.repository";
import { updateOnboardingSchema } from "@/features/admin/schemas/onboarding.schema";
import { writeAuditLog } from "@/lib/audit/audit-log.service";
import { APP_ROUTES } from "@/lib/constants";

export async function updateOnboardingAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const access = await requireAdminAction();

  if ("error" in access) {
    return { error: access.error };
  }

  const parsed = updateOnboardingSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const updated = await updateAdminOnboarding(parsed.data.onboardingId, {
      status: parsed.data.status,
      currentStep: parsed.data.currentStep ?? null,
      notes: parsed.data.notes ?? null,
      completedStep: parsed.data.completedStep ?? null,
    });

    await writeAuditLog({
      actorId: access.user.id,
      companyId: updated.company_id,
      action: "onboarding.update",
      entityType: "onboarding",
      entityId: updated.id,
      metadata: {
        status: updated.status,
        currentStep: updated.current_step,
        completedStep: parsed.data.completedStep ?? null,
      },
    });

    revalidatePath(APP_ROUTES.admin.onboarding);
    revalidatePath(APP_ROUTES.onboarding);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update onboarding.",
    };
  }
}
