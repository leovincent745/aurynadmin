import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { listConversations } from "@/lib/services/conversation-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listConversations({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      userId: searchParams.get("userId") ?? undefined,
      guestId: searchParams.get("guestId") ?? undefined,
      email: searchParams.get("email") ?? undefined,
      instructionVersionId: searchParams.get("instructionVersionId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("admin.conversations.list.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
