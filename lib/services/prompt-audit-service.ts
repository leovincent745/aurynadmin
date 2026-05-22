import {
  AdminInstructionStatus,
  PromptAuditEventType,
  type Prisma,
} from "@prisma/client";

import type { PromptAuditEventType as PromptAuditEventTypeDto } from "@/lib/domain/prompt-history";
import { prisma } from "@/lib/db/prisma";
import { logPromptAuditEvent } from "@/lib/auth/audit-log";

export class PromptAuditServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "IMMUTABLE" | "VALIDATION",
  ) {
    super(message);
    this.name = "PromptAuditServiceError";
  }
}

/** Published/archived instruction rows must not be updated in place. */
export async function assertInstructionMutable(instructionId: string): Promise<void> {
  const row = await prisma.adminInstruction.findUnique({
    where: { id: instructionId },
    select: { status: true },
  });
  if (!row) {
    throw new PromptAuditServiceError("Instruction version not found", "NOT_FOUND");
  }
  if (
    row.status === AdminInstructionStatus.published ||
    row.status === AdminInstructionStatus.archived
  ) {
    throw new PromptAuditServiceError(
      `Version is immutable (${row.status}). Use rollback to copy into a new draft.`,
      "IMMUTABLE",
    );
  }
}

export async function recordPromptAuditEvent(params: {
  instructionId: string;
  eventType: PromptAuditEventType | PromptAuditEventTypeDto;
  actorUserId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const actor = await prisma.user.findUnique({
    where: { id: params.actorUserId },
    select: { email: true },
  });

  await prisma.promptAuditEvent.create({
    data: {
      instructionId: params.instructionId,
      eventType: params.eventType as PromptAuditEventType,
      actorUserId: params.actorUserId,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  logPromptAuditEvent(params.eventType, {
    instructionId: params.instructionId,
    actorUserId: params.actorUserId,
    actorEmail: actor?.email,
    metadata: params.metadata,
  });
}
