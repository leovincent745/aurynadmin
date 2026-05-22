import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptApiError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { requirePromptPermission } from "@/lib/auth/api-auth";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import {
  getPromptVersionHistory,
  rollbackPromptVersion,
} from "@/lib/services/prompt-history-service";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";
import { promptRollbackBodySchema } from "@/lib/validation/prompt-history-api-schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: POST /api/admin/prompts/{id}/rollback */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "rollback");
  if ("response" in auth) return auth.response;

  if (!checkPromptMutationRateLimit(auth.session.userId)) {
    return promptRateLimited();
  }

  const { id: rawId } = await context.params;
  const idParsed = parsePromptIdParam(rawId);
  if (!idParsed.ok) {
    return promptApiError("VALIDATION", 400, {
      message: "Invalid prompt id",
      errors: idParsed.error.flatten(),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = promptRollbackBodySchema.safeParse(body);
  if (!parsed.success) {
    return promptApiError("VALIDATION", 400, {
      message: "Invalid rollback request",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await rollbackPromptVersion({
      sourceInstructionId: idParsed.id,
      performedBy: auth.session.userId,
      reason: parsed.data.reason,
    });
    const history = await getPromptVersionHistory(idParsed.id);
    return NextResponse.json({ rollback: result, history });
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.rollback.error");
  }
}
