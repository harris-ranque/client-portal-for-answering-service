import { NextResponse } from "next/server";

import { requireApiAuth } from "@/features/auth/lib/api-auth";
import { getProfileData } from "@/features/profile/lib/profile.repository";
import { createErrorResponse, createSuccessResponse } from "@/lib/api";

export async function GET() {
  const authResult = await requireApiAuth();

  if ("response" in authResult) {
    return authResult.response;
  }

  const { user } = authResult;
  const companyId = user.companyId;

  try {
    const data = await getProfileData(user.id, companyId);

    if (!data) {
      return NextResponse.json(createErrorResponse("PROFILE_NOT_FOUND", "Profile not found."), {
        status: 404,
      });
    }

    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile.";
    return NextResponse.json(createErrorResponse("PROFILE_FETCH_FAILED", message), {
      status: 500,
    });
  }
}
