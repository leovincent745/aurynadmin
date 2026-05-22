import { NextResponse } from "next/server";

import { promptInternalError, promptNotFound } from "@/lib/api/prompt-api-errors";
import { requireAdminSession } from "@/lib/auth/api-auth";
import { evaluatePromptActivation } from "@/lib/services/prompt-activation-service";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/admin/prompts/{id}/activation — activation checklist (read-only). */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;

  const { id: rawId } = await context.params;
  const idParsed = parsePromptIdParam(rawId);
  if (!idParsed.ok) {
    return NextResponse.json(
      {
        code: "VALIDATION",
        message: "Invalid prompt id",
        errors: idParsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const activation = await evaluatePromptActivation(idParsed.id);
    if (!activation) {
      return promptNotFound();
    }
    return NextResponse.json({ activation });
  } catch (error) {
    return promptInternalError("admin.prompts.activation.error", error);
  }
}
