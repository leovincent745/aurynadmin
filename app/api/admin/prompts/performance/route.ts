import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPipelinePerformance30d } from "@/lib/services/prompt-performance-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "12"), 50);

  try {
    const performance = await getPipelinePerformance30d(limit);
    return NextResponse.json(performance);
  } catch (error) {
    console.error("admin.prompts.performance.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
