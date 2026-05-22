import {
  AdminInstructionStatus,
  Prisma,
  PromptAuditEventType,
  type AdminInstruction,
} from "@prisma/client";

import {
  defaultInstructionTemplate,
  emptyInstructionTemplate,
} from "@/lib/constants/default-instructions";
import type { AdminDashboardSummary, ProductionStatus } from "@/lib/domain/admin-dashboard";
import type {
  CurrentDraftResponse,
  InstructionContent,
  InstructionHistoryListItem,
  InstructionHistoryResponse,
  InstructionRecord,
} from "@/lib/domain/admin-instructions";
import { logInstructionEvent } from "@/lib/auth/audit-log";
import { prisma } from "@/lib/db/prisma";
import { recordPromptAuditEvent } from "@/lib/services/prompt-audit-service";
import { evaluatePromptActivation } from "@/lib/services/prompt-activation-service";
import { invalidateGovernanceAfterDraftContentChange } from "@/lib/services/prompt-governance-invalidation";
import type { InstructionContentInput } from "@/lib/validation/instruction-schema";

export type { AdminDashboardSummary, ProductionStatus } from "@/lib/domain/admin-dashboard";

export class InstructionServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION" | "CONFLICT",
  ) {
    super(message);
    this.name = "InstructionServiceError";
  }
}

function instructionContentEquals(
  a: InstructionContentInput,
  b: Pick<
    AdminInstruction,
    "masterInstructions" | "companyGuardrails" | "productProtocolRules"
  >,
): boolean {
  return (
    a.masterInstructions === b.masterInstructions &&
    a.companyGuardrails === b.companyGuardrails &&
    a.productProtocolRules === b.productProtocolRules
  );
}

function mapInstructionRecord(
  row: AdminInstruction & { creator: { email: string } },
): InstructionRecord {
  return {
    id: row.id,
    versionNumber: row.versionNumber,
    status: row.status,
    masterInstructions: row.masterInstructions,
    companyGuardrails: row.companyGuardrails,
    productProtocolRules: row.productProtocolRules,
    createdByEmail: row.creator.email,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function getNextVersionNumber(
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  const result = await tx.adminInstruction.aggregate({ _max: { versionNumber: true } });
  return (result._max.versionNumber ?? 0) + 1;
}

export async function getActivePublished() {
  return prisma.adminInstruction.findFirst({
    where: { status: AdminInstructionStatus.published },
    orderBy: { publishedAt: "desc" },
    include: {
      creator: {
        select: { email: true },
      },
    },
  });
}

export async function getCurrentWorkingDraft() {
  return prisma.adminInstruction.findFirst({
    where: { status: AdminInstructionStatus.draft },
    orderBy: { updatedAt: "desc" },
    include: {
      creator: {
        select: { email: true },
      },
    },
  });
}

export async function getCurrentDraftResponse(): Promise<CurrentDraftResponse> {
  const [draft, activePublished, nextVersionNumber] = await Promise.all([
    getCurrentWorkingDraft(),
    getActivePublished(),
    getNextVersionNumber(),
  ]);

  return {
    draft: draft ? mapInstructionRecord(draft) : null,
    isNew: !draft,
    nextVersionNumber: draft?.versionNumber ?? nextVersionNumber,
    activePublished: activePublished
      ? {
          versionNumber: activePublished.versionNumber,
          publishedAt:
            activePublished.publishedAt?.toISOString() ?? activePublished.updatedAt.toISOString(),
          publishedByEmail: activePublished.creator.email,
        }
      : null,
  };
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [activePublished, totalInstructionCount, draftCount] = await Promise.all([
    getActivePublished(),
    prisma.adminInstruction.count(),
    prisma.adminInstruction.count({ where: { status: AdminInstructionStatus.draft } }),
  ]);

  let productionStatus: ProductionStatus;
  if (activePublished) {
    productionStatus = "active";
  } else if (totalInstructionCount === 0) {
    productionStatus = "needs_setup";
  } else {
    productionStatus = "no_published_instructions";
  }

  return {
    productionStatus,
    activePublished: activePublished
      ? {
          id: activePublished.id,
          versionNumber: activePublished.versionNumber,
          publishedAt:
            activePublished.publishedAt?.toISOString() ?? activePublished.updatedAt.toISOString(),
          publishedByEmail: activePublished.creator.email,
          updatedAt: activePublished.updatedAt.toISOString(),
        }
      : null,
    hasDraft: draftCount > 0,
    totalInstructionCount,
  };
}

export async function saveDraft(
  content: InstructionContentInput,
  adminUserId: string,
): Promise<InstructionRecord> {
  const existing = await getCurrentWorkingDraft();

  if (existing) {
    const contentChanged = !instructionContentEquals(content, existing);
    const updated = await prisma.adminInstruction.update({
      where: { id: existing.id },
      data: {
        masterInstructions: content.masterInstructions,
        companyGuardrails: content.companyGuardrails,
        productProtocolRules: content.productProtocolRules,
      },
      include: { creator: { select: { email: true } } },
    });

    if (contentChanged) {
      await invalidateGovernanceAfterDraftContentChange(updated.id, adminUserId);
    }

    logInstructionEvent("instruction.draft.saved", {
      instructionId: updated.id,
      versionNumber: updated.versionNumber,
      adminUserId,
    });
    await recordPromptAuditEvent({
      instructionId: updated.id,
      eventType: PromptAuditEventType.draft_saved,
      actorUserId: adminUserId,
      metadata: { versionNumber: updated.versionNumber },
    });

    return mapInstructionRecord(updated);
  }

  const versionNumber = await getNextVersionNumber();
  const created = await prisma.adminInstruction.create({
    data: {
      versionNumber,
      masterInstructions: content.masterInstructions,
      companyGuardrails: content.companyGuardrails,
      productProtocolRules: content.productProtocolRules,
      status: AdminInstructionStatus.draft,
      createdBy: adminUserId,
    },
    include: { creator: { select: { email: true } } },
  });

  logInstructionEvent("instruction.draft.saved", {
    instructionId: created.id,
    versionNumber: created.versionNumber,
    adminUserId,
  });
  await recordPromptAuditEvent({
    instructionId: created.id,
    eventType: PromptAuditEventType.version_created,
    actorUserId: adminUserId,
    metadata: { versionNumber: created.versionNumber, status: "draft" },
  });

  return mapInstructionRecord(created);
}

/**
 * Persists content on a specific draft row. Only the current working draft (latest
 * draft by updatedAt) may be edited — published/archived rows are rejected.
 */
export async function saveDraftById(
  draftId: string,
  content: InstructionContentInput,
  adminUserId: string,
): Promise<InstructionRecord> {
  const row = await prisma.adminInstruction.findUnique({
    where: { id: draftId },
    include: { creator: { select: { email: true } } },
  });

  if (!row) {
    throw new InstructionServiceError("Draft not found", "NOT_FOUND");
  }

  if (row.status !== AdminInstructionStatus.draft) {
    throw new InstructionServiceError(
      "Only in-review drafts can be edited. Published and archived versions are read-only.",
      "VALIDATION",
    );
  }

  const workingDraft = await getCurrentWorkingDraft();
  if (!workingDraft || workingDraft.id !== draftId) {
    throw new InstructionServiceError(
      "Only the current working draft can be edited",
      "VALIDATION",
    );
  }

  const contentChanged = !instructionContentEquals(content, row);
  const updated = await prisma.adminInstruction.update({
    where: { id: draftId },
    data: {
      masterInstructions: content.masterInstructions,
      companyGuardrails: content.companyGuardrails,
      productProtocolRules: content.productProtocolRules,
    },
    include: { creator: { select: { email: true } } },
  });

  if (contentChanged) {
    await invalidateGovernanceAfterDraftContentChange(updated.id, adminUserId);
  }

  logInstructionEvent("instruction.draft.saved", {
    instructionId: updated.id,
    versionNumber: updated.versionNumber,
    adminUserId,
  });
  await recordPromptAuditEvent({
    instructionId: updated.id,
    eventType: PromptAuditEventType.draft_saved,
    actorUserId: adminUserId,
    metadata: { versionNumber: updated.versionNumber },
  });

  return mapInstructionRecord(updated);
}

/**
 * Copies a historical or live version into the single working draft under Serializable
 * isolation. Published/archived source rows are never mutated.
 */
export async function restoreWorkingDraftFromSource(
  sourceId: string,
  adminUserId: string,
): Promise<InstructionRecord> {
  return prisma.$transaction(
    async (tx) => {
      const source = await tx.adminInstruction.findUnique({
        where: { id: sourceId },
      });
      if (!source) {
        throw new InstructionServiceError("Instruction version not found", "NOT_FOUND");
      }

      const content: InstructionContentInput = {
        masterInstructions: source.masterInstructions,
        companyGuardrails: source.companyGuardrails,
        productProtocolRules: source.productProtocolRules,
      };

      const working = await tx.adminInstruction.findFirst({
        where: { status: AdminInstructionStatus.draft },
        orderBy: { updatedAt: "desc" },
        include: { creator: { select: { email: true } } },
      });

      let draftRow: AdminInstruction & { creator: { email: string } };
      if (working) {
        const contentChanged = !instructionContentEquals(content, working);
        draftRow = await tx.adminInstruction.update({
          where: { id: working.id },
          data: content,
          include: { creator: { select: { email: true } } },
        });
        if (contentChanged) {
          await invalidateGovernanceAfterDraftContentChange(draftRow.id, adminUserId, tx);
        }
      } else {
        const versionNumber = await getNextVersionNumber(tx);
        draftRow = await tx.adminInstruction.create({
          data: {
            versionNumber,
            ...content,
            status: AdminInstructionStatus.draft,
            createdBy: adminUserId,
          },
          include: { creator: { select: { email: true } } },
        });
      }

      return mapInstructionRecord(draftRow);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 8000,
      timeout: 15000,
    },
  );
}

/** Spec alias: POST /admin/prompts — create a new in-review draft version. */
export async function createPromptDraft(adminUserId: string): Promise<InstructionRecord> {
  return createNewInstructionDraft(adminUserId);
}

/** Creates a new draft row (new pipeline version) from the default template. */
export async function createNewInstructionDraft(
  adminUserId: string,
): Promise<InstructionRecord> {
  const versionNumber = await getNextVersionNumber();
  const created = await prisma.adminInstruction.create({
    data: {
      versionNumber,
      masterInstructions: emptyInstructionTemplate.masterInstructions,
      companyGuardrails: emptyInstructionTemplate.companyGuardrails,
      productProtocolRules: emptyInstructionTemplate.productProtocolRules,
      status: AdminInstructionStatus.draft,
      createdBy: adminUserId,
    },
    include: { creator: { select: { email: true } } },
  });

  logInstructionEvent("instruction.draft.saved", {
    instructionId: created.id,
    versionNumber: created.versionNumber,
    adminUserId,
  });
  await recordPromptAuditEvent({
    instructionId: created.id,
    eventType: PromptAuditEventType.version_created,
    actorUserId: adminUserId,
    metadata: { versionNumber: created.versionNumber, status: "draft", newDraft: true },
  });

  return mapInstructionRecord(created);
}

export async function publishDraft(
  draftId: string,
  adminUserId: string,
): Promise<InstructionRecord> {
  return prisma.$transaction(
    async (tx) => {
    const draft = await tx.adminInstruction.findFirst({
      where: { id: draftId, status: AdminInstructionStatus.draft },
      include: { creator: { select: { email: true } } },
    });

    if (!draft) {
      const exists = await tx.adminInstruction.findUnique({
        where: { id: draftId },
        select: { status: true },
      });
      if (exists?.status === AdminInstructionStatus.published) {
        throw new InstructionServiceError(
          "Published (live) versions cannot be activated directly. Edit the working draft, pass validation, then activate.",
          "VALIDATION",
        );
      }
      if (exists?.status === AdminInstructionStatus.archived) {
        throw new InstructionServiceError(
          "Archived versions cannot be activated directly. Roll back into the working draft, re-validate, then activate.",
          "VALIDATION",
        );
      }
      throw new InstructionServiceError("Draft not found", "NOT_FOUND");
    }

    const workingDraft = await tx.adminInstruction.findFirst({
      where: { status: AdminInstructionStatus.draft },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (!workingDraft || workingDraft.id !== draftId) {
      throw new InstructionServiceError(
        "Only the current working draft can be published to production",
        "VALIDATION",
      );
    }

    const latestRun = await tx.promptValidationRun.findFirst({
      where: { instructionId: draftId },
      orderBy: { createdAt: "desc" },
      select: { completedAt: true },
    });
    if (
      latestRun?.completedAt &&
      draft.updatedAt.getTime() > latestRun.completedAt.getTime()
    ) {
      throw new InstructionServiceError(
        "Draft changed after last validation — re-run validation suite",
        "VALIDATION",
      );
    }

    const activation = await evaluatePromptActivation(draftId, tx);
    if (!activation?.allowed) {
      throw new InstructionServiceError(
        activation?.blockReason ?? "Activation requirements not met",
        "VALIDATION",
      );
    }

    const previousPublishedRows = await tx.adminInstruction.findMany({
      where: { status: AdminInstructionStatus.published },
      select: { id: true },
    });

    await tx.adminInstruction.updateMany({
      where: { status: AdminInstructionStatus.published },
      data: { status: AdminInstructionStatus.archived },
    });

    const versionNumber = await getNextVersionNumber(tx);

    const published = await tx.adminInstruction.create({
      data: {
        versionNumber,
        masterInstructions: draft.masterInstructions,
        companyGuardrails: draft.companyGuardrails,
        productProtocolRules: draft.productProtocolRules,
        status: AdminInstructionStatus.published,
        createdBy: adminUserId,
        publishedAt: new Date(),
      },
      include: { creator: { select: { email: true } } },
    });

    const nextDraftVersion = versionNumber + 1;
    await tx.adminInstruction.update({
      where: { id: draft.id },
      data: { versionNumber: nextDraftVersion },
    });

    logInstructionEvent("instruction.published", {
      instructionId: published.id,
      versionNumber: published.versionNumber,
      adminUserId,
      previousPublishedId: previousPublishedRows[0]?.id,
    });

    for (const prev of previousPublishedRows) {
      await recordPromptAuditEvent({
        instructionId: prev.id,
        eventType: PromptAuditEventType.archived,
        actorUserId: adminUserId,
        metadata: { supersededBy: published.id },
      });
    }
    await recordPromptAuditEvent({
      instructionId: published.id,
      eventType: PromptAuditEventType.published,
      actorUserId: adminUserId,
      metadata: { versionNumber: published.versionNumber },
    });
    await recordPromptAuditEvent({
      instructionId: published.id,
      eventType: PromptAuditEventType.activated,
      actorUserId: adminUserId,
      metadata: { versionNumber: published.versionNumber },
    });

    const publishedCount = await tx.adminInstruction.count({
      where: { status: AdminInstructionStatus.published },
    });
    if (publishedCount !== 1) {
      throw new InstructionServiceError("Publish invariant failed", "CONFLICT");
    }

    return mapInstructionRecord(published);
  },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 8000,
      timeout: 15000,
    },
  );
}

export function emptyDraftContent(): InstructionContent {
  return { ...defaultInstructionTemplate };
}

export interface InstructionSetForChat {
  instructionId: string | null;
  versionNumber: number | null;
  content: InstructionContent;
  source: "published" | "draft" | "default";
}

/** Production chat — published only, else safe defaults. */
export async function getPublishedInstructionSetForChat(): Promise<InstructionSetForChat> {
  const published = await getActivePublished();

  if (published) {
    return {
      instructionId: published.id,
      versionNumber: published.versionNumber,
      content: {
        masterInstructions: published.masterInstructions,
        companyGuardrails: published.companyGuardrails,
        productProtocolRules: published.productProtocolRules,
      },
      source: "published",
    };
  }

  return {
    instructionId: null,
    versionNumber: null,
    content: emptyDraftContent(),
    source: "default",
  };
}

/** Admin test chat draft mode only — never used by public /api/chat. */
export async function getDraftInstructionSetForChat(): Promise<InstructionSetForChat | null> {
  const draft = await getCurrentWorkingDraft();
  if (!draft) return null;

  return {
    instructionId: draft.id,
    versionNumber: draft.versionNumber,
    content: {
      masterInstructions: draft.masterInstructions,
      companyGuardrails: draft.companyGuardrails,
      productProtocolRules: draft.productProtocolRules,
    },
    source: "draft",
  };
}

/** Ensures at most one published row (defensive invariant). */
export async function assertSinglePublishedInvariant(): Promise<void> {
  const count = await prisma.adminInstruction.count({
    where: { status: AdminInstructionStatus.published },
  });
  if (count > 1) {
    throw new InstructionServiceError(
      "Multiple published instructions detected",
      "CONFLICT",
    );
  }
}

const HISTORY_DEFAULT_LIMIT = 20;
const HISTORY_MAX_LIMIT = 100;

export async function listInstructionHistory(
  page = 1,
  limit = HISTORY_DEFAULT_LIMIT,
): Promise<InstructionHistoryResponse> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), HISTORY_MAX_LIMIT);
  const skip = (safePage - 1) * safeLimit;

  const [rows, total] = await Promise.all([
    prisma.adminInstruction.findMany({
      orderBy: [{ versionNumber: "desc" }, { createdAt: "desc" }],
      skip,
      take: safeLimit,
      include: { creator: { select: { email: true } } },
    }),
    prisma.adminInstruction.count(),
  ]);

  const items: InstructionHistoryListItem[] = rows.map((row) => ({
    id: row.id,
    versionNumber: row.versionNumber,
    status: row.status,
    createdByEmail: row.creator.email,
    createdAt: row.createdAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }));

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

export async function getInstructionById(id: string): Promise<InstructionRecord | null> {
  const row = await prisma.adminInstruction.findUnique({
    where: { id },
    include: { creator: { select: { email: true } } },
  });
  if (!row) return null;
  return mapInstructionRecord(row);
}

/** Copy any version into the single working draft (create draft if missing). */
export async function cloneInstructionToDraft(
  sourceId: string,
  adminUserId: string,
): Promise<InstructionRecord> {
  return restoreWorkingDraftFromSource(sourceId, adminUserId);
}
