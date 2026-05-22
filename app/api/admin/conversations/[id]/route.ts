import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getConversationDetail } from "@/lib/services/conversation-service";

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
    const conversation = await getConversationDetail(id);
    if (!conversation) {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("admin.conversations.detail.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
