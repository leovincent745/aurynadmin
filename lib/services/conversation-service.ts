import type { Prisma } from "@prisma/client";
import { MessageSender } from "@prisma/client";

import { logConversationFlagged } from "@/lib/auth/audit-log";
import type {
  ConversationDetail,
  ConversationListItem,
  ConversationListResponse,
  ConversationMessageItem,
} from "@/lib/domain/conversation-review";
import { prisma } from "@/lib/db/prisma";

export class ConversationServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND",
  ) {
    super(message);
    this.name = "ConversationServiceError";
  }
}

export interface ListConversationsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  guestId?: string;
  email?: string;
  from?: string;
  to?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function previewText(content: string, max = 120): string {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function participantFromConversation(row: {
  userId: string | null;
  anonymousSessionId: string | null;
  user: { email: string } | null;
}): { participant: string; participantType: "user" | "guest" } {
  if (row.user?.email) {
    return { participant: row.user.email, participantType: "user" };
  }
  if (row.anonymousSessionId) {
    return { participant: row.anonymousSessionId, participantType: "guest" };
  }
  return { participant: "Unknown participant", participantType: "guest" };
}

export async function listConversations(
  query: ListConversationsQuery,
): Promise<ConversationListResponse> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const where: Prisma.ConversationWhereInput = {
    isAdminTest: false,
  };

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.guestId) {
    where.anonymousSessionId = { contains: query.guestId, mode: "insensitive" };
  }

  if (query.email) {
    where.user = { email: { contains: query.email, mode: "insensitive" } };
  }

  if (query.from || query.to) {
    where.updatedAt = {};
    if (query.from) where.updatedAt.gte = new Date(query.from);
    if (query.to) where.updatedAt.lte = new Date(query.to);
  }

  const [rows, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            instructionVersion: { select: { versionNumber: true } },
          },
        },
        _count: { select: { messages: true } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  const items: ConversationListItem[] = rows.map((row) => {
    const { participant, participantType } = participantFromConversation(row);
    const last = row.messages[0];

    return {
      id: row.id,
      participant,
      participantType,
      updatedAt: row.updatedAt.toISOString(),
      lastMessageAt: last?.createdAt.toISOString() ?? null,
      lastMessagePreview: last ? previewText(last.content) : null,
      lastInstructionVersion:
        last?.sender === MessageSender.auryn
          ? (last.instructionVersion?.versionNumber ?? null)
          : null,
      messageCount: row._count.messages,
      flaggedForReview: row.flaggedForReview,
    };
  });

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getConversationDetail(id: string): Promise<ConversationDetail | null> {
  const row = await prisma.conversation.findFirst({
    where: { id, isAdminTest: false },
    include: {
      user: { select: { email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          instructionVersion: { select: { id: true, versionNumber: true } },
        },
      },
    },
  });

  if (!row) return null;

  const { participant, participantType } = participantFromConversation(row);

  const messages: ConversationMessageItem[] = row.messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    instructionVersionId: msg.instructionVersionId,
    instructionVersionNumber: msg.instructionVersion?.versionNumber ?? null,
  }));

  return {
    id: row.id,
    participant,
    participantType,
    userId: row.userId,
    anonymousSessionId: row.anonymousSessionId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    flaggedForReview: row.flaggedForReview,
    flaggedAt: row.flaggedAt?.toISOString() ?? null,
    flaggedNote: row.flaggedNote,
    messages,
  };
}

export async function setConversationFlag(
  id: string,
  flagged: boolean,
  adminUserId: string,
  note?: string,
): Promise<ConversationDetail> {
  const existing = await prisma.conversation.findFirst({
    where: { id, isAdminTest: false },
  });

  if (!existing) {
    throw new ConversationServiceError("Conversation not found", "NOT_FOUND");
  }

  await prisma.conversation.update({
    where: { id },
    data: {
      flaggedForReview: flagged,
      flaggedAt: flagged ? new Date() : null,
      flaggedBy: flagged ? adminUserId : null,
      flaggedNote: flagged ? (note?.trim() || null) : null,
    },
  });

  logConversationFlagged({ conversationId: id, adminUserId, flagged });

  const detail = await getConversationDetail(id);
  if (!detail) {
    throw new ConversationServiceError("Conversation not found", "NOT_FOUND");
  }
  return detail;
}
