import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/api-auth";
import {
  ConversationServiceError,
  setConversationFlag,
} from "@/lib/services/conversation-service";

const flagSchema = z.object({
  flagged: z.boolean(),
  note: z.string().max(2000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = flagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const conversation = await setConversationFlag(
      id,
      parsed.data.flagged,
      auth.session.userId,
      parsed.data.note,
    );
    return NextResponse.json({ conversation });
  } catch (error) {
    if (error instanceof ConversationServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    console.error("admin.conversations.flag.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
