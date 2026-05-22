import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptApiError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { requirePromptPermission } from "@/lib/auth/api-auth";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import { saveDraftById } from "@/lib/services/instruction-service";
import { instructionContentSchema } from "@/lib/validation/instruction-schema";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: PUT /api/admin/prompts/{id}/draft */
export async function PUT(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "edit");
  if ("response" in auth) {
    return auth.response;
  }

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
    return promptApiError("INVALID_BODY", 400, { message: "Invalid JSON body" });
  }

  const parsed = instructionContentSchema.safeParse(body);
  if (!parsed.success) {
    return promptApiError("VALIDATION_ERROR", 400, {
      message: "Instruction content validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const draft = await saveDraftById(idParsed.id, parsed.data, auth.session.userId);
    return NextResponse.json({ draft, prompt: draft });
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.draft.error");
  }
}
