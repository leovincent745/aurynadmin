import { NextResponse } from "next/server";

import { promptInternalError, promptNotFound } from "@/lib/api/prompt-api-errors";
import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPromptVersionHistory } from "@/lib/services/prompt-history-service";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: GET /api/admin/prompts/{id}/history */
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
    const history = await getPromptVersionHistory(idParsed.id);
    if (!history) {
      return promptNotFound("Prompt version history not found");
    }
    return NextResponse.json({ history });
  } catch (error) {
    return promptInternalError("admin.prompts.history.error", error);
  }
}
