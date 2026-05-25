import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import { checkTestChatRateLimit } from "@/lib/auth/test-chat-rate-limit";
import {
  TestChatError,
  handleAdminTestChat,
} from "@/lib/services/chat-service";

const testChatSchema = z.object({
  message: z.string().trim().min(1).max(8_000),
  mode: z.enum(["draft", "published"]),
  conversationId: z.string().cuid().optional(),
  instructionId: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requirePromptPermission(request, "validate");
  if ("response" in auth) {
    return auth.response;
  }

  if (!checkTestChatRateLimit(auth.session.userId)) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many test messages. Try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = testChatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const result = await handleAdminTestChat({
      message: parsed.data.message,
      mode: parsed.data.mode,
      conversationId: parsed.data.conversationId,
      instructionId: parsed.data.instructionId,
      adminUserId: auth.session.userId,
    });

    return NextResponse.json({
      ...result,
      label: "Admin Test",
    });
  } catch (error) {
    if (error instanceof TestChatError) {
      const status =
        error.code === "NO_DRAFT" ||
        error.code === "MODE_MISMATCH" ||
        error.code === "ARCHIVED" ||
        error.code === "NOT_FOUND"
          ? 400
          : 500;
      return NextResponse.json({ code: error.code, message: error.message }, { status });
    }
    console.error("admin.test-chat.error", error);
    return NextResponse.json({ code: "CHAT_ERROR", message: "Test chat failed" }, { status: 500 });
  }
}
