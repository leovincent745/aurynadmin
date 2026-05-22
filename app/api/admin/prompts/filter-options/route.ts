import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPromptPipelineFilterOptions } from "@/lib/services/prompt-pipeline-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const filterOptions = await getPromptPipelineFilterOptions();
    return NextResponse.json({ filterOptions });
  } catch (error) {
    console.error("admin.prompts.filter-options.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
