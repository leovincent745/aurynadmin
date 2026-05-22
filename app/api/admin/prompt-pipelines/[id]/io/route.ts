import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPromptPipelineIo } from "@/lib/services/prompt-pipeline-io-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const io = await getPromptPipelineIo(id);
    if (!io) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ io });
  } catch (error) {
    console.error("admin.prompt-pipelines.io.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
