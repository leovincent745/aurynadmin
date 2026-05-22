import {
  AdminInstructionStatus,
  AiLogEventType,
  type Prisma,
} from "@prisma/client";

import { canActivatePromptVersion } from "@/lib/activation/can-activate-prompt-version";
import type {
  CanActivatePromptVersionResult,
  PromptVersionActivationContext,
} from "@/lib/domain/prompt-activation";
import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";
import type {
  PromptGovernanceSnapshot,
  PromptPhysicianApprovalDto,
  PromptReviewSubmissionDto,
  PromptValidationRunDto,
  ValidationRuleResult,
} from "@/lib/domain/prompt-validation";
import { prisma } from "@/lib/db/prisma";
import { buildChatInstructionsPipelineIo } from "@/lib/services/prompt-pipeline-io-service";
import { validateChatOutputResponse } from "@/lib/validation/prompt-io-output";

function pipelineStatusLabel(status: AdminInstructionStatus): PromptPipelineStatusLabel {
  switch (status) {
    case AdminInstructionStatus.published:
      return "Active";
    case AdminInstructionStatus.draft:
      return "In Review";
    default:
      return "Archived";
  }
}

function mapPhysician(
  row: {
    id: string;
    instructionId: string;
    status: string;
    comment: string | null;
    createdAt: Date;
    decidedAt: Date | null;
    physician: { email: string } | null;
  } | null,
): PromptPhysicianApprovalDto | null {
  if (!row) return null;
  return {
    id: row.id,
    instructionId: row.instructionId,
    status: row.status as PromptPhysicianApprovalDto["status"],
    physicianEmail: row.physician?.email ?? null,
    comment: row.comment,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapReview(
  row: Prisma.PromptReviewSubmissionGetPayload<{
    include: {
      submitter: { select: { email: true } };
      reviewer: { select: { email: true } };
    };
  }> | null,
): PromptReviewSubmissionDto | null {
  if (!row) return null;
  return {
    id: row.id,
    instructionId: row.instructionId,
    validationRunId: row.validationRunId,
    status: row.status as PromptReviewSubmissionDto["status"],
    submittedByEmail: row.submitter.email,
    submittedAt: row.submittedAt.toISOString(),
    submitterComment: row.submitterComment,
    reviewerEmail: row.reviewer?.email ?? null,
    reviewerComment: row.reviewerComment,
    decidedAt: row.decidedAt?.toISOString() ?? null,
  };
}

function mapRun(
  row: Prisma.PromptValidationRunGetPayload<{
    include: {
      creator: { select: { email: true } };
      comments: {
        include: { author: { select: { email: true } } };
        orderBy: { createdAt: "desc" };
      };
    };
  }> | null,
): PromptValidationRunDto | null {
  if (!row) return null;
  return {
    id: row.id,
    instructionId: row.instructionId,
    status: row.status as PromptValidationRunDto["status"],
    overallPassed: row.overallPassed,
    rules: row.ruleResults as unknown as ValidationRuleResult[],
    createdByEmail: row.creator.email,
    createdAt: row.createdAt.toISOString(),
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    canceledAt: row.canceledAt?.toISOString() ?? null,
    comments: row.comments.map((c) => ({
      id: c.id,
      authorEmail: c.author.email,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function countAdminTestPasses(
  instructionId: string,
  client?: Prisma.TransactionClient,
): Promise<number> {
  const db = client ?? prisma;
  return db.aiLog.count({
    where: {
      instructionVersionId: instructionId,
      eventType: AiLogEventType.chat_success,
      status: { startsWith: "admin_test" },
    },
  });
}

export async function buildActivationContext(
  instructionId: string,
  client?: Prisma.TransactionClient,
): Promise<PromptVersionActivationContext | null> {
  const db = client ?? prisma;

  const instruction = await db.adminInstruction.findUnique({
    where: { id: instructionId },
    select: { id: true, versionNumber: true, status: true, updatedAt: true },
  });
  if (!instruction) return null;

  const [latestRunRow, reviewRow, physicianRow, adminTestPassCount, outputSchemaValid] =
    await Promise.all([
      db.promptValidationRun.findFirst({
        where: { instructionId },
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { email: true } },
          comments: {
            orderBy: { createdAt: "desc" },
            include: { author: { select: { email: true } } },
          },
        },
      }),
      db.promptReviewSubmission.findFirst({
        where: { instructionId },
        orderBy: { submittedAt: "desc" },
        include: {
          submitter: { select: { email: true } },
          reviewer: { select: { email: true } },
        },
      }),
      db.promptPhysicianApproval.findFirst({
        where: { instructionId },
        orderBy: { createdAt: "desc" },
        include: { physician: { select: { email: true } } },
      }),
      countAdminTestPasses(instructionId, client),
      (async () => {
        const io = buildChatInstructionsPipelineIo({
          instructionId: instruction.id,
          versionNumber: instruction.versionNumber,
          status: instruction.status,
        });
        const out = validateChatOutputResponse(
          io.outputs.fields,
          io.outputs.exampleJson,
          {
            instructionVersionId: io.outputs.instructionVersionId,
            versionNumber: instruction.versionNumber,
          },
        );
        return out.valid;
      })(),
    ]);

  return {
    instructionId: instruction.id,
    versionNumber: instruction.versionNumber,
    instructionUpdatedAt: instruction.updatedAt.toISOString(),
    dbStatus: instruction.status,
    pipelineStatusLabel: pipelineStatusLabel(instruction.status),
    outputSchemaValid,
    latestValidationRun: mapRun(latestRunRow),
    review: mapReview(reviewRow),
    physicianApproval: mapPhysician(physicianRow),
    adminTestPassCount,
  };
}

export async function evaluatePromptActivation(
  instructionId: string,
  client?: Prisma.TransactionClient,
): Promise<CanActivatePromptVersionResult | null> {
  const ctx = await buildActivationContext(instructionId, client);
  if (!ctx) return null;
  return canActivatePromptVersion(ctx);
}

export async function getActivationGovernanceSnapshot(
  instructionId: string,
): Promise<Pick<
  PromptGovernanceSnapshot,
  | "activationAllowed"
  | "activationBlockReason"
  | "activationChecks"
  | "physicianApproval"
  | "adminTestPassCount"
> | null> {
  const evaluation = await evaluatePromptActivation(instructionId);
  if (!evaluation) return null;

  const ctx = await buildActivationContext(instructionId);
  if (!ctx) return null;

  return {
    activationAllowed: evaluation.allowed,
    activationBlockReason: evaluation.blockReason,
    activationChecks: evaluation.checks,
    physicianApproval: ctx.physicianApproval,
    adminTestPassCount: ctx.adminTestPassCount,
  };
}

export async function recordPhysicianApproval(params: {
  instructionId: string;
  physicianUserId: string;
  action: "approve" | "reject";
  comment?: string;
}): Promise<PromptPhysicianApprovalDto> {
  const instruction = await prisma.adminInstruction.findUnique({
    where: { id: params.instructionId },
    select: { id: true, status: true },
  });
  if (!instruction) {
    throw new Error("NOT_FOUND");
  }
  if (instruction.status !== AdminInstructionStatus.draft) {
    throw new Error("ONLY_IN_REVIEW");
  }

  const row = await prisma.promptPhysicianApproval.create({
    data: {
      instructionId: params.instructionId,
      status: params.action === "approve" ? "approved" : "rejected",
      physicianId: params.physicianUserId,
      comment: params.comment?.trim() || null,
      decidedAt: new Date(),
    },
    include: { physician: { select: { email: true } } },
  });

  return mapPhysician(row)!;
}
