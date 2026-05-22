import {
  PromptAuditEventType,
  PromptReviewStatus,
  PromptValidationRunStatus,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { recordPromptAuditEvent } from "@/lib/services/prompt-audit-service";

/**
 * After draft body changes (save, rollback restore), prior validation/approvals
 * must not count toward activation until re-run.
 */
export async function invalidateGovernanceAfterDraftContentChange(
  instructionId: string,
  actorUserId: string,
  client: Prisma.TransactionClient = prisma,
): Promise<void> {
  const instruction = await client.adminInstruction.findUnique({
    where: { id: instructionId },
    select: { updatedAt: true, status: true },
  });
  if (!instruction) return;

  const contentChangedAt = instruction.updatedAt;

  const activeRuns = await client.promptValidationRun.findMany({
    where: {
      instructionId,
      status: { in: [PromptValidationRunStatus.queued, PromptValidationRunStatus.running] },
    },
    select: { id: true },
  });
  for (const run of activeRuns) {
    await client.promptValidationRun.update({
      where: { id: run.id },
      data: {
        status: PromptValidationRunStatus.canceled,
        canceledAt: new Date(),
        completedAt: new Date(),
      },
    });
  }

  const staleRuns = await client.promptValidationRun.findMany({
    where: {
      instructionId,
      status: PromptValidationRunStatus.passed,
      completedAt: { lt: contentChangedAt },
    },
    select: { id: true },
  });
  if (staleRuns.length > 0) {
    await recordPromptAuditEvent({
      instructionId,
      eventType: PromptAuditEventType.validation_run,
      actorUserId,
      metadata: {
        action: "governance_stale",
        staleRunIds: staleRuns.map((r) => r.id),
        reason: "draft_content_changed",
      },
    });
  }

  const pendingReview = await client.promptReviewSubmission.findFirst({
    where: { instructionId, status: PromptReviewStatus.pending },
  });
  if (pendingReview) {
    await client.promptReviewSubmission.update({
      where: { id: pendingReview.id },
      data: {
        status: PromptReviewStatus.rejected,
        reviewerId: actorUserId,
        reviewerComment: "Superseded — draft content changed; submit for review again",
        decidedAt: new Date(),
      },
    });
    await recordPromptAuditEvent({
      instructionId,
      eventType: PromptAuditEventType.review_decided,
      actorUserId,
      metadata: { reviewId: pendingReview.id, decision: "rejected", reason: "content_changed" },
    });
  }

  const staleApprovals = await client.promptReviewSubmission.findMany({
    where: {
      instructionId,
      status: PromptReviewStatus.approved,
      decidedAt: { lt: contentChangedAt },
    },
    select: { id: true },
  });
  for (const review of staleApprovals) {
    await client.promptReviewSubmission.update({
      where: { id: review.id },
      data: {
        status: PromptReviewStatus.rejected,
        reviewerComment: "Approval invalidated — draft content changed after sign-off",
        decidedAt: new Date(),
      },
    });
  }

  const stalePhysician = await client.promptPhysicianApproval.findMany({
    where: {
      instructionId,
      status: PromptReviewStatus.approved,
      decidedAt: { lt: contentChangedAt },
    },
    select: { id: true },
  });
  for (const row of stalePhysician) {
    await client.promptPhysicianApproval.update({
      where: { id: row.id },
      data: {
        status: "rejected",
        comment: "Invalidated — draft content changed after physician approval",
        decidedAt: new Date(),
      },
    });
  }
}
