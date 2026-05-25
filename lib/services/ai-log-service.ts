import type { AiLogEventType as PrismaAiLogEventType, Prisma } from "@prisma/client";

import type {
  AiLogDetail,
  AiLogEventType,
  AiLogListItem,
  AiLogListResponse,
} from "@/lib/domain/ai-logs";
import { aiLogEventTypes } from "@/lib/domain/ai-logs";
import { sanitizeErrorSummary } from "@/lib/ai/redact-secrets";
import { prisma } from "@/lib/db/prisma";

export { sanitizeErrorSummary } from "@/lib/ai/redact-secrets";

export class AiLogServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND",
  ) {
    super(message);
    this.name = "AiLogServiceError";
  }
}

export interface CreateAiLogInput {
  eventType: PrismaAiLogEventType;
  conversationId: string;
  userId?: string;
  anonymousSessionId?: string;
  instructionVersionId: string | null;
  status: string;
  errorSummary?: string;
}

export interface ListAiLogsQuery {
  page?: number;
  limit?: number;
  eventType?: string;
  conversationId?: string;
  instructionVersionId?: string;
  from?: string;
  to?: string;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const SUMMARY_PREVIEW_MAX = 120;

function previewSummary(summary: string | null): string | null {
  if (!summary) return null;
  if (summary.length <= SUMMARY_PREVIEW_MAX) return summary;
  return `${summary.slice(0, SUMMARY_PREVIEW_MAX)}…`;
}

function participantFromLog(row: {
  userId: string | null;
  anonymousSessionId: string | null;
  user: { email: string } | null;
  conversation: {
    isAdminTest: boolean;
    anonymousSessionId: string | null;
    user: { email: string } | null;
  };
}): { participant: string; participantType: "user" | "guest" | "admin" } {
  if (row.conversation.isAdminTest) {
    const email = row.user?.email ?? "Admin test";
    return { participant: email, participantType: "admin" };
  }

  const email = row.conversation.user?.email ?? row.user?.email;
  if (email) {
    return { participant: email, participantType: "user" };
  }

  const guestId = row.anonymousSessionId ?? row.conversation.anonymousSessionId;
  if (guestId) {
    return { participant: guestId, participantType: "guest" };
  }

  return { participant: "Unknown", participantType: "guest" };
}

function toListItem(row: {
  id: string;
  eventType: AiLogEventType;
  createdAt: Date;
  status: string;
  conversationId: string;
  errorSummary: string | null;
  userId: string | null;
  anonymousSessionId: string | null;
  user: { email: string } | null;
  instructionVersionId: string | null;
  instructionVersion: { id: string; versionNumber: number } | null;
  conversation: {
    isAdminTest: boolean;
    anonymousSessionId: string | null;
    user: { email: string } | null;
  };
}): AiLogListItem {
  const { participant, participantType } = participantFromLog(row);
  const sanitized = sanitizeErrorSummary(row.errorSummary);

  return {
    id: row.id,
    eventType: row.eventType,
    createdAt: row.createdAt.toISOString(),
    status: row.status,
    conversationId: row.conversationId,
    isAdminTest: row.conversation.isAdminTest,
    participant,
    participantType,
    instructionVersionId: row.instructionVersionId,
    instructionVersionNumber: row.instructionVersion?.versionNumber ?? null,
    errorSummaryPreview: previewSummary(sanitized),
  };
}

function toDetail(row: Parameters<typeof toListItem>[0] & {
  instructionVersionId: string | null;
}): AiLogDetail {
  const { participant, participantType } = participantFromLog(row);
  const sanitized = sanitizeErrorSummary(row.errorSummary);

  return {
    id: row.id,
    eventType: row.eventType,
    createdAt: row.createdAt.toISOString(),
    status: row.status,
    conversationId: row.conversationId,
    isAdminTest: row.conversation.isAdminTest,
    participant,
    participantType,
    userId: row.userId,
    anonymousSessionId: row.anonymousSessionId ?? row.conversation.anonymousSessionId,
    instructionVersionId: row.instructionVersionId,
    instructionVersionNumber: row.instructionVersion?.versionNumber ?? null,
    errorSummary: sanitized,
  };
}

const logInclude = {
  user: { select: { email: true } },
  instructionVersion: { select: { id: true, versionNumber: true } },
  conversation: {
    select: {
      isAdminTest: true,
      anonymousSessionId: true,
      user: { select: { email: true } },
    },
  },
} satisfies Prisma.AiLogInclude;

export async function createAiLog(input: CreateAiLogInput): Promise<void> {
  const errorSummary = sanitizeErrorSummary(input.errorSummary);

  try {
    await prisma.aiLog.create({
      data: {
        eventType: input.eventType,
        conversationId: input.conversationId,
        userId: input.userId ?? null,
        anonymousSessionId: input.anonymousSessionId ?? null,
        instructionVersionId: input.instructionVersionId,
        status: input.status,
        errorSummary,
      },
    });

    console.info(
      JSON.stringify({
        type: "ai_log",
        eventType: input.eventType,
        conversationId: input.conversationId,
        status: input.status,
        hasErrorSummary: Boolean(errorSummary),
      }),
    );
  } catch (error) {
    console.error("ai_log.write.failed", {
      eventType: input.eventType,
      conversationId: input.conversationId,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

function parseEventType(value: string | undefined): AiLogEventType | undefined {
  if (!value) return undefined;
  if ((aiLogEventTypes as readonly string[]).includes(value)) {
    return value as AiLogEventType;
  }
  return undefined;
}

export async function listAiLogs(query: ListAiLogsQuery): Promise<AiLogListResponse> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const where: Prisma.AiLogWhereInput = {};

  const eventType = parseEventType(query.eventType);
  if (eventType) {
    where.eventType = eventType as PrismaAiLogEventType;
  }

  if (query.conversationId) {
    where.conversationId = query.conversationId;
  }

  if (query.instructionVersionId) {
    where.instructionVersionId = query.instructionVersionId;
  }

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [rows, total] = await Promise.all([
    prisma.aiLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: logInclude,
    }),
    prisma.aiLog.count({ where }),
  ]);

  return {
    items: rows.map(toListItem),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAiLogDetail(id: string): Promise<AiLogDetail | null> {
  const row = await prisma.aiLog.findUnique({
    where: { id },
    include: logInclude,
  });

  if (!row) return null;
  return toDetail(row);
}
