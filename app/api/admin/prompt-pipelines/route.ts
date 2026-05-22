import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { listPromptPipelines } from "@/lib/services/prompt-pipeline-service";
import { parsePromptPipelineListQuery } from "@/lib/prompt-pipelines/parse-list-query";

/** Alias of GET /api/admin/prompts for backward compatibility. */
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
    console.error("admin.prompt_pipelines.list.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
