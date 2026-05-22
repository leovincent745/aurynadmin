import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import {
  PromptValidationServiceError,
  getPromptGovernanceSnapshot,
  getValidationRunById,
} from "@/lib/services/prompt-validation-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET governance snapshot + optional run by id (polling). */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const url = new URL(request.url);
  const runId = url.searchParams.get("runId");

  try {
    if (runId) {
      const run = await getValidationRunById(runId);
      if (!run || run.instructionId !== id) {
        return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({ run });
    }

    const governance = await getPromptGovernanceSnapshot(id);
    if (!governance) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ governance });
  } catch (error) {
    if (error instanceof PromptValidationServiceError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    console.error("admin.prompts.validation.get.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
