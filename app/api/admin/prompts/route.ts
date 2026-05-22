import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptInternalError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { requireAdminSession, requirePromptPermission } from "@/lib/auth/api-auth";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import { createPromptDraft } from "@/lib/services/instruction-service";
import { listPromptPipelines } from "@/lib/services/prompt-pipeline-service";
import { parsePromptPipelineListQuery } from "@/lib/prompt-pipelines/parse-list-query";

/** Spec: GET /api/admin/prompts — list with filter, search, sort, pagination. */
export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  try {
    const query = parsePromptPipelineListQuery(searchParams);
    const result = await listPromptPipelines(query);
    return NextResponse.json(result);
  } catch (error) {
    return promptInternalError("admin.prompts.list.error", error);
  }
}

/** Spec: POST /api/admin/prompts — create in-review draft. */
export async function POST(request: Request) {
  const auth = await requirePromptPermission(request, "create");
  if ("response" in auth) {
    return auth.response;
  }

  if (!checkPromptMutationRateLimit(auth.session.userId)) {
    return promptRateLimited();
  }

  try {
    const draft = await createPromptDraft(auth.session.userId);
    return NextResponse.json({ prompt: draft, draft }, { status: 201 });
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.create.error");
  }
}
