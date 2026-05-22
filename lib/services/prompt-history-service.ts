import { AdminInstructionStatus, PromptAuditEventType } from "@prisma/client";

import type {
  PromptAuditEventDto,
  PromptHistoryResponse,
  PromptReviewerHistoryDto,
  PromptRollbackDto,
  PromptValidationEvidenceDto,
  PromptVersionTimelineEntry,
} from "@/lib/domain/prompt-history";
import { prisma } from "@/lib/db/prisma";
import { recordPromptAuditEvent } from "@/lib/services/prompt-audit-service";
import {
  InstructionServiceError,
  getCurrentWorkingDraft,
  restoreWorkingDraftFromSource,
} from "@/lib/services/instruction-service";

export class PromptHistoryServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "IMMUTABLE",
  ) {
    super(message);
    this.name = "PromptHistoryServiceError";
  }
}

const PIPELINE_NAME = "Auryn Chat Instructions";

function mapAuditEvent(
  row: {
    id: string;
    instructionId: string;
    eventType: string;
    createdAt: Date;
    metadata: unknown;
    actor: { email: string };
  },
): PromptAuditEventDto {
  return {
    id: row.id,
    instructionId: row.instructionId,
    eventType: row.eventType as PromptAuditEventDto["eventType"],
    actorEmail: row.actor.email,
    createdAt: row.createdAt.toISOString(),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

function syntheticAuditEvents(
  row: {
    id: string;
    status: AdminInstructionStatus;
    versionNumber: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    creator: { email: string };
  },
): PromptAuditEventDto[] {
  const base: PromptAuditEventDto[] = [
    {
      id: `synthetic-created-${row.id}`,
      instructionId: row.id,
      eventType: "version_created",
      actorEmail: row.creator.email,
      createdAt: row.createdAt.toISOString(),
      metadata: { versionNumber: row.versionNumber, status: row.status, synthetic: true },
    },
  ];
  if (row.publishedAt) {
    base.push({
      id: `synthetic-published-${row.id}`,
      instructionId: row.id,
      eventType: "published",
      actorEmail: row.creator.email,
      createdAt: row.publishedAt.toISOString(),
      metadata: { versionNumber: row.versionNumber, synthetic: true },
    });
    base.push({
      id: `synthetic-activated-${row.id}`,
      instructionId: row.id,
      eventType: "activated",
      actorEmail: row.creator.email,
      createdAt: row.publishedAt.toISOString(),
      metadata: { versionNumber: row.versionNumber, synthetic: true },
    });
  }
  if (row.status === AdminInstructionStatus.archived) {
    base.push({
      id: `synthetic-archived-${row.id}`,
      instructionId: row.id,
      eventType: "archived",
      actorEmail: row.creator.email,
      createdAt: row.updatedAt?.toISOString() ?? row.createdAt.toISOString(),
      metadata: { versionNumber: row.versionNumber, synthetic: true },
    });
  }
  return base;
}

function mergeAuditEvents(
  stored: PromptAuditEventDto[],
  synthetic: PromptAuditEventDto[],
): PromptAuditEventDto[] {
  const byKey = new Map<string, PromptAuditEventDto>();
  for (const e of [...synthetic, ...stored]) {
    const key = `${e.eventType}-${e.createdAt.slice(0, 19)}`;
    if (!byKey.has(key) || !e.id.startsWith("synthetic")) {
      byKey.set(key, e);
    }
  }
  return [...byKey.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getPromptVersionHistory(
  promptId: string,
): Promise<PromptHistoryResponse | null> {
  const selected = await prisma.adminInstruction.findUnique({
    where: { id: promptId },
    select: { id: true, versionNumber: true },
  });
  if (!selected) return null;

  const versions = await prisma.adminInstruction.findMany({
    orderBy: [{ versionNumber: "desc" }, { createdAt: "desc" }],
    include: { creator: { select: { email: true } } },
  });

  const versionIds = versions.map((v) => v.id);

  const [auditRows, validationRows, reviewRows, rollbackRows] = await Promise.all([
    prisma.promptAuditEvent.findMany({
      where: { instructionId: { in: versionIds } },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { email: true } } },
    }),
    prisma.promptValidationRun.findMany({
      where: { instructionId: { in: versionIds } },
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { email: true } } },
    }),
    prisma.promptReviewSubmission.findMany({
      where: { instructionId: { in: versionIds } },
      orderBy: { submittedAt: "desc" },
      include: {
        submitter: { select: { email: true } },
        reviewer: { select: { email: true } },
      },
    }),
    prisma.promptRollbackRecord.findMany({
      where: {
        OR: [
          { sourceInstructionId: { in: versionIds } },
          { targetDraftId: { in: versionIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { performer: { select: { email: true } } },
    }),
  ]);

  const auditByInstruction = new Map<string, PromptAuditEventDto[]>();
  for (const row of auditRows) {
    const list = auditByInstruction.get(row.instructionId) ?? [];
    list.push(mapAuditEvent(row));
    auditByInstruction.set(row.instructionId, list);
  }

  const validationByInstruction = new Map<string, PromptValidationEvidenceDto[]>();
  for (const row of validationRows) {
    const list = validationByInstruction.get(row.instructionId) ?? [];
    list.push({
      runId: row.id,
      status: row.status,
      overallPassed: row.overallPassed,
      completedAt: row.completedAt?.toISOString() ?? null,
      createdByEmail: row.creator.email,
    });
    validationByInstruction.set(row.instructionId, list);
  }

  const reviewByInstruction = new Map<string, PromptReviewerHistoryDto[]>();
  for (const row of reviewRows) {
    const list = reviewByInstruction.get(row.instructionId) ?? [];
    list.push({
      reviewId: row.id,
      status: row.status,
      submittedByEmail: row.submitter.email,
      submittedAt: row.submittedAt.toISOString(),
      reviewerEmail: row.reviewer?.email ?? null,
      reviewerComment: row.reviewerComment,
      decidedAt: row.decidedAt?.toISOString() ?? null,
    });
    reviewByInstruction.set(row.instructionId, list);
  }

  const rollbackDtos: PromptRollbackDto[] = rollbackRows.map((r) => ({
    id: r.id,
    sourceInstructionId: r.sourceInstructionId,
    targetDraftId: r.targetDraftId,
    sourceVersionNumber: r.sourceVersionNumber,
    sourceStatus: r.sourceStatus,
    performedByEmail: r.performer.email,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
  }));

  const rollbacksBySource = new Map<string, PromptRollbackDto[]>();
  for (const rb of rollbackDtos) {
    const list = rollbacksBySource.get(rb.sourceInstructionId) ?? [];
    list.push(rb);
    rollbacksBySource.set(rb.sourceInstructionId, list);
  }

  const timeline: PromptVersionTimelineEntry[] = versions.map((row) => {
    const stored = auditByInstruction.get(row.id) ?? [];
    const synthetic = syntheticAuditEvents(row);

    return {
      instructionId: row.id,
      versionNumber: row.versionNumber,
      status: row.status,
      createdByEmail: row.creator.email,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      immutable:
        row.status === AdminInstructionStatus.published ||
        row.status === AdminInstructionStatus.archived,
      isSelected: row.id === promptId,
      auditEvents: mergeAuditEvents(stored, synthetic),
      validationEvidence: validationByInstruction.get(row.id) ?? [],
      reviewerHistory: reviewByInstruction.get(row.id) ?? [],
      rollbacksFrom: rollbacksBySource.get(row.id) ?? [],
    };
  });

  const activationHistory = timeline
    .flatMap((t) => t.auditEvents)
    .filter((e) =>
      ["published", "activated", "archived"].includes(e.eventType),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const globalAuditEvents = [...auditRows.map(mapAuditEvent)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    promptId,
    pipelineName: PIPELINE_NAME,
    selectedVersionNumber: selected.versionNumber,
    timeline,
    activationHistory,
    globalAuditEvents,
  };
}

export async function rollbackPromptVersion(params: {
  sourceInstructionId: string;
  performedBy: string;
  reason?: string;
}): Promise<{
  draftId: string;
  rollbackId: string;
  versionNumber: number;
}> {
  const source = await prisma.adminInstruction.findUnique({
    where: { id: params.sourceInstructionId },
    include: { creator: { select: { email: true } } },
  });

  if (!source) {
    throw new PromptHistoryServiceError("Source version not found", "NOT_FOUND");
  }

  const currentDraft = await getCurrentWorkingDraft();
  if (currentDraft?.id === source.id && source.status === AdminInstructionStatus.draft) {
    throw new PromptHistoryServiceError(
      "Selected version is already the working draft",
      "CONFLICT",
    );
  }

  let draft;
  try {
    draft = await restoreWorkingDraftFromSource(
      params.sourceInstructionId,
      params.performedBy,
    );
  } catch (e) {
    if (e instanceof InstructionServiceError) {
      const code = e.code === "NOT_FOUND" ? "NOT_FOUND" : "VALIDATION";
      throw new PromptHistoryServiceError(e.message, code);
    }
    throw e;
  }

  const contentSnapshot = {
    masterInstructions: source.masterInstructions,
    companyGuardrails: source.companyGuardrails,
    productProtocolRules: source.productProtocolRules,
  };

  const rollback = await prisma.promptRollbackRecord.create({
    data: {
      sourceInstructionId: source.id,
      targetDraftId: draft.id,
      performedBy: params.performedBy,
      reason: params.reason?.trim() || null,
      sourceVersionNumber: source.versionNumber,
      sourceStatus: source.status,
      metadata: {
        sourceCreatedAt: source.createdAt.toISOString(),
        targetVersionNumber: draft.versionNumber,
        contentSnapshot,
      },
    },
  });

  await recordPromptAuditEvent({
    instructionId: source.id,
    eventType: PromptAuditEventType.rollback,
    actorUserId: params.performedBy,
    metadata: {
      rollbackId: rollback.id,
      targetDraftId: draft.id,
      sourceVersionNumber: source.versionNumber,
      sourceStatus: source.status,
      reason: params.reason ?? null,
      livePromptUnchanged: source.status === AdminInstructionStatus.published,
    },
  });

  await recordPromptAuditEvent({
    instructionId: draft.id,
    eventType: PromptAuditEventType.draft_saved,
    actorUserId: params.performedBy,
    metadata: {
      rollbackId: rollback.id,
      restoredFromInstructionId: source.id,
      restoredFromVersion: source.versionNumber,
      action: "rollback_restore",
      contentSnapshot,
    },
  });

  return {
    draftId: draft.id,
    rollbackId: rollback.id,
    versionNumber: source.versionNumber,
  };
}
