import { AiLogEventType, MessageSender } from "@prisma/client";

import { buildChatSystemPrompt } from "@/lib/ai/build-system-prompt";
import { callOpenAI } from "@/lib/ai/openai";
import {
  SAFETY_ESCALATION_REPLY,
  SAFETY_REFUSAL_REPLY,
  checkUserMessageSafety,
} from "@/lib/ai/safety";
import { prisma } from "@/lib/db/prisma";
import { createAiLog } from "@/lib/services/ai-log-service";
import type { InstructionSetForChat } from "@/lib/services/instruction-service";
import {
  getDraftInstructionSetForChat,
  getInstructionSetForChatById,
  getPublishedInstructionSetForChat,
  InstructionServiceError,
} from "@/lib/services/instruction-service";

import type { TestChatMode } from "@/lib/domain/test-chat";
import {
  assertPublicChatInstructionSet,
  instructionVersionIdForAurynMessage,
  PublicChatInstructionError,
} from "@/lib/services/public-chat-instructions";

export type { TestChatMode } from "@/lib/domain/test-chat";

export interface PublicChatInput {
  message: string;
  conversationId?: string;
  userId?: string;
  anonymousSessionId?: string;
}

export interface AdminTestChatInput {
  message: string;
  mode: TestChatMode;
  conversationId?: string;
  /** When set (e.g. from Prompt System Run Test), uses this version's content. */
  instructionId?: string;
  adminUserId: string;
}

export interface ChatTurnResult {
  conversationId: string;
  reply: string;
  instructionVersionId: string | null;
  instructionVersionNumber: number | null;
  instructionSource: "published" | "draft" | "default";
  safetyHandled: boolean;
  isAdminTest: boolean;
}

async function resolveConversationId(params: {
  conversationId?: string;
  isAdminTest: boolean;
  userId?: string | null;
  anonymousSessionId?: string | null;
}): Promise<string> {
  if (params.conversationId) {
    const existing = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
    });
    if (existing && existing.isAdminTest === params.isAdminTest) {
      return existing.id;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId: params.userId ?? null,
      anonymousSessionId: params.anonymousSessionId ?? null,
      isAdminTest: params.isAdminTest,
    },
  });
  return conversation.id;
}

async function executeChatTurn(params: {
  message: string;
  conversationId?: string;
  instructionSet: InstructionSetForChat;
  isAdminTest: boolean;
  userId?: string | null;
  anonymousSessionId?: string | null;
  logStatusPrefix: string;
}): Promise<ChatTurnResult> {
  const systemPrompt = buildChatSystemPrompt(params.instructionSet.content);

  const conversationId = await resolveConversationId({
    conversationId: params.conversationId,
    isAdminTest: params.isAdminTest,
    userId: params.userId,
    anonymousSessionId: params.anonymousSessionId,
  });

  await prisma.message.create({
    data: {
      conversationId,
      sender: MessageSender.user,
      content: params.message,
    },
  });

  const safety = checkUserMessageSafety(params.message);
  let reply: string;
  let safetyHandled = false;
  let eventType: AiLogEventType = AiLogEventType.chat_success;

  if (safety.action === "escalation") {
    reply = SAFETY_ESCALATION_REPLY;
    safetyHandled = true;
    eventType = AiLogEventType.safety_escalation;
  } else if (safety.action === "refusal") {
    reply = SAFETY_REFUSAL_REPLY;
    safetyHandled = true;
    eventType = AiLogEventType.safety_refusal;
  } else {
    try {
      reply = await callOpenAI(systemPrompt, params.message);
    } catch (error) {
      const summary = error instanceof Error ? error.message : "Unknown chat error";
      await createAiLog({
        eventType: AiLogEventType.chat_error,
        conversationId,
        userId: params.userId ?? undefined,
        anonymousSessionId: params.anonymousSessionId ?? undefined,
        instructionVersionId: params.instructionSet.instructionId,
        status: `${params.logStatusPrefix}_error`,
        errorSummary: summary,
      });
      throw error;
    }
  }

  const aurynInstructionVersionId = instructionVersionIdForAurynMessage(
    params.instructionSet,
  );

  await prisma.message.create({
    data: {
      conversationId,
      sender: MessageSender.auryn,
      content: reply,
      instructionVersionId: aurynInstructionVersionId,
    },
  });

  const safetyReason = safety.action !== "allow" ? safety.reason : undefined;

  await createAiLog({
    eventType,
    conversationId,
    userId: params.userId ?? undefined,
    anonymousSessionId: params.anonymousSessionId ?? undefined,
    instructionVersionId: params.instructionSet.instructionId,
    status: safetyHandled
      ? `${params.logStatusPrefix}_safety_handled`
      : `${params.logStatusPrefix}_ok`,
    errorSummary: safetyReason,
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return {
    conversationId,
    reply,
    instructionVersionId: params.instructionSet.instructionId,
    instructionVersionNumber: params.instructionSet.versionNumber,
    instructionSource: params.instructionSet.source,
    safetyHandled,
    isAdminTest: params.isAdminTest,
  };
}

export async function handlePublicChat(input: PublicChatInput): Promise<ChatTurnResult> {
  const instructionSet = await getPublishedInstructionSetForChat();
  assertPublicChatInstructionSet(instructionSet);

  return executeChatTurn({
    message: input.message,
    conversationId: input.conversationId,
    instructionSet,
    isAdminTest: false,
    userId: input.userId ?? null,
    anonymousSessionId: input.anonymousSessionId ?? null,
    logStatusPrefix: "public",
  });
}

export async function handleAdminTestChat(input: AdminTestChatInput): Promise<ChatTurnResult> {
  let instructionSet: InstructionSetForChat;

  try {
    if (input.instructionId) {
      instructionSet = await getInstructionSetForChatById(input.instructionId);
      if (input.mode === "draft" && instructionSet.source !== "draft") {
        throw new TestChatError(
          "MODE_MISMATCH",
          "Switch to Published mode to test this active instruction version.",
        );
      }
      if (input.mode === "published" && instructionSet.source !== "published") {
        throw new TestChatError(
          "MODE_MISMATCH",
          "Switch to Draft mode to test this in-review instruction version.",
        );
      }
    } else if (input.mode === "draft") {
      const draft = await getDraftInstructionSetForChat();
      if (!draft) {
        throw new TestChatError(
          "NO_DRAFT",
          "Save a draft in AI Instructions before testing draft mode.",
        );
      }
      instructionSet = draft;
    } else {
      instructionSet = await getPublishedInstructionSetForChat();
    }
  } catch (error) {
    if (error instanceof InstructionServiceError) {
      const code =
        error.code === "NOT_FOUND"
          ? "NOT_FOUND"
          : error.code === "VALIDATION"
            ? "ARCHIVED"
            : "CHAT_ERROR";
      throw new TestChatError(code, error.message);
    }
    throw error;
  }

  return executeChatTurn({
    message: input.message,
    conversationId: input.conversationId,
    instructionSet,
    isAdminTest: true,
    userId: input.adminUserId,
    anonymousSessionId: null,
    logStatusPrefix: "admin_test",
  });
}

export class TestChatError extends Error {
  constructor(
    public readonly code:
      | "NO_DRAFT"
      | "RATE_LIMITED"
      | "NOT_FOUND"
      | "ARCHIVED"
      | "MODE_MISMATCH",
    message: string,
  ) {
    super(message);
    this.name = "TestChatError";
  }
}
