import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getAiLogDetail } from "@/lib/services/ai-log-service";

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
    const log = await getAiLogDetail(id);
    if (!log) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ log });
  } catch (error) {
    console.error("admin.ai_logs.detail.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
