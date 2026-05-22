import { NextResponse } from "next/server";

import { promptInternalError } from "@/lib/api/prompt-api-errors";
import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPromptSystemSummary } from "@/lib/services/prompt-system-summary-service";
import { promptSummaryQuerySchema } from "@/lib/validation/prompt-api-common";

/** Spec: GET /api/admin/prompts/summary */
export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const parsed = promptSummaryQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION",
        message: "Invalid summary query",
        errors: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const summary = await getPromptSystemSummary({ status: parsed.data.status });
    return NextResponse.json(summary);
  } catch (error) {
    return promptInternalError("admin.prompts.summary.error", error);
  }
}
