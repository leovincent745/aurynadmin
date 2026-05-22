import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptApiError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { requirePromptPermission } from "@/lib/auth/api-auth";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import {
  addValidationComment,
  cancelValidationRun,
  startValidationRun,
} from "@/lib/services/prompt-validation-service";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";
import { promptValidateBodySchema } from "@/lib/validation/prompt-validation-api-schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: POST /api/admin/prompts/{id}/validate */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "validate");
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

  const parsed = promptValidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return promptApiError("VALIDATION", 400, {
      message: "Invalid validation request",
      errors: parsed.error.flatten(),
    });
  }

  try {
    if (parsed.data.cancelRunId) {
      const run = await cancelValidationRun(parsed.data.cancelRunId, idParsed.id);
      return NextResponse.json({ run });
    }

    const run = await startValidationRun({
      instructionId: idParsed.id,
      createdBy: auth.session.userId,
      testInput: parsed.data.testInput,
      testOutput: parsed.data.testOutput,
    });

    if (parsed.data.comment?.trim()) {
      const withComment = await addValidationComment({
        runId: run.id,
        instructionId: idParsed.id,
        authorId: auth.session.userId,
        body: parsed.data.comment,
      });
      return NextResponse.json({ run: withComment });
    }

    return NextResponse.json({ run });
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.validate.error");
  }
}
