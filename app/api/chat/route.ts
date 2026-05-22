import { NextResponse } from "next/server";
import { z } from "zod";

import { handlePublicChat } from "@/lib/services/chat-service";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(8_000),
  conversationId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  anonymousSessionId: z.string().min(1).max(128).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (!parsed.data.userId && !parsed.data.anonymousSessionId) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "userId or anonymousSessionId required" },
      { status: 400 },
    );
  }

  try {
    const result = await handlePublicChat(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("chat.error", error);
    return NextResponse.json(
      {
        code: "CHAT_ERROR",
        message: "Unable to complete chat request",
      },
      { status: 500 },
    );
  }
}
