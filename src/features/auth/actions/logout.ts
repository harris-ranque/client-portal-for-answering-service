"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/constants";
import { createServerActionClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createServerActionClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect(APP_ROUTES.login);
}
