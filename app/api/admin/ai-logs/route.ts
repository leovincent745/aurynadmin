import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { listAiLogs } from "@/lib/services/ai-log-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listAiLogs({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "25"),
      eventType: searchParams.get("eventType") ?? undefined,
      conversationId: searchParams.get("conversationId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("admin.ai_logs.list.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
