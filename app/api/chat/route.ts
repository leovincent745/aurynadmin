import { NextResponse } from "next/server";

import { handlePublicChat } from "@/lib/services/chat-service";
import { PublicChatInstructionError } from "@/lib/services/public-chat-instructions";
import { publicChatRequestSchema } from "@/lib/validation/chat-api-schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = publicChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message:
          "Invalid chat request. Send message and participant ids only — instructions are applied server-side.",
      },
      { status: 400 },
    );
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
    if (error instanceof PublicChatInstructionError) {
      return NextResponse.json(
        { code: "INSTRUCTION_ERROR", message: error.message },
        { status: 500 },
      );
    }
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
