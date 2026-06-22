import { NextResponse } from "next/server";

import { createErrorResponse } from "@/lib/api";
import { validateRequestOrigin } from "@/lib/security/validate-origin";

export function rejectInvalidOrigin(request: Request) {
  const validation = validateRequestOrigin(request);

  if (validation.valid) {
    return null;
  }

  return NextResponse.json(
    createErrorResponse("INVALID_ORIGIN", "Request origin is not allowed."),
    { status: 403 },
  );
}
