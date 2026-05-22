import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptApiError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { requirePromptPermission } from "@/lib/auth/api-auth";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import { submitPromptReview } from "@/lib/services/prompt-validation-service";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";
import { promptSubmitReviewBodySchema } from "@/lib/validation/prompt-validation-api-schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: POST /api/admin/prompts/{id}/submit-review */
export async function POST(request: Request, context: RouteContext) {
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

  const parsed = promptSubmitReviewBodySchema.safeParse(body);
  if (!parsed.success) {
    return promptApiError("VALIDATION", 400, {
      message: "Invalid review request",
      errors: parsed.error.flatten(),
    });
  }

  const reviewPermission =
    parsed.data.action === "submit" ? ("submit-review" as const) : ("approve" as const);
  const auth = await requirePromptPermission(request, reviewPermission);
  if ("response" in auth) return auth.response;

  if (!checkPromptMutationRateLimit(auth.session.userId)) {
    return promptRateLimited();
  }

  try {
    const result = await submitPromptReview({
      instructionId: idParsed.id,
      submittedBy: auth.session.userId,
      action: parsed.data.action,
      comment: parsed.data.comment,
      reviewerId: auth.session.userId,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.submit-review.error");
  }
}
