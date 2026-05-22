import { NextResponse } from "next/server";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import {
  PromptValidationServiceError,
  addValidationComment,
  getPromptGovernanceSnapshot,
} from "@/lib/services/prompt-validation-service";
import { promptValidationCommentSchema } from "@/lib/validation/prompt-validation-api-schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "validate");
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "VALIDATION", message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = promptValidationCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const run = await addValidationComment({
      runId: parsed.data.runId,
      instructionId: id,
      authorId: auth.session.userId,
      body: parsed.data.body,
    });
    const governance = await getPromptGovernanceSnapshot(id);
    return NextResponse.json({ run, governance });
  } catch (error) {
    if (error instanceof PromptValidationServiceError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    console.error("admin.prompts.validation.comment.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
