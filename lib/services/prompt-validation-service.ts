import {
  AdminInstructionStatus,
  PromptReviewStatus,
  PromptValidationRunStatus,
  type Prisma,
} from "@prisma/client";

import type { InstructionContent } from "@/lib/domain/admin-instructions";
import type {
  PromptGovernanceSnapshot,
  PromptReviewSubmissionDto,
  PromptValidationRunDto,
  ValidationRuleResult,
} from "@/lib/domain/prompt-validation";
import { prisma } from "@/lib/db/prisma";
import { REQUIRED_ADMIN_TEST_PASSES } from "@/lib/domain/prompt-activation";
import { recordPromptAuditEvent } from "@/lib/services/prompt-audit-service";
import {
  countAdminTestPasses,
  evaluatePromptActivation,
} from "@/lib/services/prompt-activation-service";
import { buildChatInstructionsPipelineIo } from "@/lib/services/prompt-pipeline-io-service";
import { PromptAuditEventType } from "@prisma/client";
import { instructionContentSchema } from "@/lib/validation/instruction-schema";
import { validatePayloadAgainstSchema } from "@/lib/validation/prompt-io-payload";
import { validateChatOutputResponse } from "@/lib/validation/prompt-io-output";
import { evaluatePromptSafetyRules } from "@/lib/validation/prompt-safety-rules";

export class PromptValidationServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION" | "CONFLICT",
  ) {
    super(message);
    this.name = "PromptValidationServiceError";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rule(
  partial: Omit<ValidationRuleResult, "id"> & { id?: string },
): ValidationRuleResult {
  return {
    id: partial.id ?? `${partial.category}-${partial.name.toLowerCase().replace(/\s+/g, "-")}`,
    ...partial,
  };
}

function isTerminalStatus(status: PromptValidationRunStatus): boolean {
  return (
    status === PromptValidationRunStatus.passed ||
    status === PromptValidationRunStatus.failed ||
    status === PromptValidationRunStatus.canceled
  );
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
  }>,
): PromptValidationRunDto {
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

/** @deprecated Use evaluatePromptActivation / canActivatePromptVersion */
export function computeActivationGate(
  _latestRun: PromptValidationRunDto | null,
  _review: PromptReviewSubmissionDto | null,
): { activationAllowed: boolean; activationBlockReason: string | null } {
  return { activationAllowed: false, activationBlockReason: "Use evaluatePromptActivation" };
}

async function executeValidationRules(params: {
  instructionId: string;
  versionNumber: number;
  status: AdminInstructionStatus;
  content: InstructionContent;
  testInput?: Record<string, unknown>;
  testOutput?: Record<string, unknown>;
}): Promise<ValidationRuleResult[]> {
  const io = buildChatInstructionsPipelineIo({
    instructionId: params.instructionId,
    versionNumber: params.versionNumber,
    status: params.status,
  });

  const rules: ValidationRuleResult[] = [];

  const inputPayload = params.testInput ?? io.inputs.exampleJson;
  const inputResult = validatePayloadAgainstSchema(
    io.inputs.fields,
    inputPayload,
    "chat_instructions",
  );
  rules.push(
    rule({
      category: "input_validation",
      name: "Chat input payload",
      status: inputResult.valid ? "passed" : "failed",
      message: inputResult.valid
        ? "Test input matches POST /api/chat schema"
        : inputResult.issues[0]?.message ?? "Input validation failed",
      expected: "Valid chat request object (message + userId or anonymousSessionId)",
      actual: inputResult.valid
        ? "Valid"
        : inputResult.issues.map((i) => `${i.path}: ${i.message}`).join("; "),
    }),
  );

  const outputPayload = params.testOutput ?? io.outputs.exampleJson;
  const outputResult = validateChatOutputResponse(io.outputs.fields, outputPayload, {
    instructionVersionId: io.outputs.instructionVersionId,
    versionNumber: params.versionNumber,
  });
  rules.push(
    rule({
      category: "output_schema",
      name: "Chat output schema",
      status: outputResult.valid ? "passed" : "failed",
      message: outputResult.valid
        ? "Output matches version-bound response schema"
        : outputResult.issues[0]?.message ?? "Output schema validation failed",
      expected: `instructionVersionId=${params.instructionId}`,
      actual: outputResult.valid
        ? "Valid"
        : outputResult.issues.map((i) => `${i.path}: ${i.message}`).join("; "),
    }),
  );

  const safety = evaluatePromptSafetyRules(params.content);
  rules.push(
    rule({
      category: "safety",
      name: "Instruction safety guardrails",
      status: safety.passed ? "passed" : "failed",
      message: safety.message,
      expected: safety.expected,
      actual: safety.actual,
    }),
  );

  const businessIssues: string[] = [];
  if (params.status !== AdminInstructionStatus.draft) {
    businessIssues.push(`Status must be draft (current: ${params.status})`);
  }
  const zod = instructionContentSchema.safeParse(params.content);
  if (!zod.success) {
    businessIssues.push(zod.error.errors[0]?.message ?? "Instruction content invalid");
  }
  rules.push(
    rule({
      category: "business_rules",
      name: "Publish readiness",
      status: businessIssues.length === 0 ? "passed" : "failed",
      message:
        businessIssues.length === 0
          ? "Draft version with complete instruction fields"
          : businessIssues[0],
      expected: "draft status + all instruction fields ≥ 10 chars",
      actual: businessIssues.length === 0 ? "Ready" : businessIssues.join("; "),
    }),
  );

  const latestReview = await prisma.promptReviewSubmission.findFirst({
    where: { instructionId: params.instructionId },
    orderBy: { submittedAt: "desc" },
  });

  let reviewStatus: ValidationRuleResult["status"] = "skipped";
  let reviewMessage = "Not yet submitted — required before publish";
  const reviewExpected = "Review status: approved";
  let reviewActual = latestReview?.status ?? "none";

  if (latestReview?.status === PromptReviewStatus.approved) {
    reviewStatus = "passed";
    reviewMessage = "Reviewer approved this version";
    reviewActual = "approved";
  } else if (latestReview?.status === PromptReviewStatus.pending) {
    reviewStatus = "skipped";
    reviewMessage = "Review pending — awaiting approver decision";
    reviewActual = "pending";
  } else if (latestReview?.status === PromptReviewStatus.rejected) {
    reviewStatus = "failed";
    reviewMessage = "Reviewer rejected — address feedback and resubmit";
    reviewActual = "rejected";
  }

  rules.push(
    rule({
      category: "reviewer_approval",
      name: "Reviewer sign-off",
      status: reviewStatus,
      message: reviewMessage,
      expected: reviewExpected,
      actual: String(reviewActual),
    }),
  );

  const adminTestPassCount = await countAdminTestPasses(params.instructionId);
  rules.push(
    rule({
      category: "test_cases",
      name: "Admin test chat runs",
      status:
        adminTestPassCount >= REQUIRED_ADMIN_TEST_PASSES ? "passed" : "failed",
      message:
        adminTestPassCount >= REQUIRED_ADMIN_TEST_PASSES
          ? `${adminTestPassCount} successful admin test run(s)`
          : `Need ${REQUIRED_ADMIN_TEST_PASSES}+ successful admin test chat (have ${adminTestPassCount})`,
      expected: `≥ ${REQUIRED_ADMIN_TEST_PASSES} admin_test chat_success logs`,
      actual: String(adminTestPassCount),
    }),
  );

  const physicianRow = await prisma.promptPhysicianApproval.findFirst({
    where: { instructionId: params.instructionId },
    orderBy: { createdAt: "desc" },
  });
  let physicianRuleStatus: ValidationRuleResult["status"] = "skipped";
  let physicianMessage = "Physician approval required before activation";
  if (physicianRow?.status === PromptReviewStatus.approved) {
    physicianRuleStatus = "passed";
    physicianMessage = "Physician approved";
  } else if (physicianRow?.status === PromptReviewStatus.rejected) {
    physicianRuleStatus = "failed";
    physicianMessage = "Physician rejected this version";
  }
  rules.push(
    rule({
      category: "physician_approval",
      name: "Physician sign-off",
      status: physicianRuleStatus,
      message: physicianMessage,
      expected: "Physician approval: approved",
      actual: physicianRow?.status ?? "none",
    }),
  );

  return rules;
}

function validationRunOverallPassed(rules: ValidationRuleResult[]): boolean {
  const required: ValidationRuleResult["category"][] = [
    "input_validation",
    "output_schema",
    "safety",
    "business_rules",
    "test_cases",
  ];
  for (const cat of required) {
    const r = rules.find((x) => x.category === cat);
    if (!r || r.status !== "passed") return false;
  }
  const physician = rules.find((x) => x.category === "physician_approval");
  const reviewer = rules.find((x) => x.category === "reviewer_approval");
  if (physician?.status === "failed" || reviewer?.status === "failed") return false;
  return true;
}

export async function getPromptGovernanceSnapshot(
  instructionId: string,
): Promise<PromptGovernanceSnapshot | null> {
  const instruction = await prisma.adminInstruction.findUnique({
    where: { id: instructionId },
    select: { id: true },
  });
  if (!instruction) return null;

  const activationEval = await evaluatePromptActivation(instructionId);

  const [runs, reviewRow, physicianRow, adminTestPassCount] = await Promise.all([
    prisma.promptValidationRun.findMany({
      where: { instructionId },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        creator: { select: { email: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { email: true } } },
        },
      },
    }),
    prisma.promptReviewSubmission.findFirst({
      where: { instructionId },
      orderBy: { submittedAt: "desc" },
      include: {
        submitter: { select: { email: true } },
        reviewer: { select: { email: true } },
      },
    }),
    prisma.promptPhysicianApproval.findFirst({
      where: { instructionId },
      orderBy: { createdAt: "desc" },
      include: { physician: { select: { email: true } } },
    }),
    countAdminTestPasses(instructionId),
  ]);

  const mapped = runs.map(mapRun);
  const latestRun = mapped[0] ?? null;
  const review = mapReview(reviewRow);
  const physicianApproval = physicianRow
    ? {
        id: physicianRow.id,
        instructionId: physicianRow.instructionId,
        status: physicianRow.status as PromptReviewSubmissionDto["status"],
        physicianEmail: physicianRow.physician?.email ?? null,
        comment: physicianRow.comment,
        decidedAt: physicianRow.decidedAt?.toISOString() ?? null,
        createdAt: physicianRow.createdAt.toISOString(),
      }
    : null;

  return {
    latestRun,
    review,
    physicianApproval,
    adminTestPassCount,
    history: mapped,
    activationAllowed: activationEval?.allowed ?? false,
    activationBlockReason: activationEval?.blockReason ?? null,
    activationChecks: activationEval?.checks ?? [],
  };
}

export async function getValidationRunById(runId: string): Promise<PromptValidationRunDto | null> {
  const row = await prisma.promptValidationRun.findUnique({
    where: { id: runId },
    include: {
      creator: { select: { email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      },
    },
  });
  return row ? mapRun(row) : null;
}

export async function cancelValidationRun(
  runId: string,
  instructionId: string,
): Promise<PromptValidationRunDto> {
  const row = await prisma.promptValidationRun.findFirst({
    where: { id: runId, instructionId },
  });
  if (!row) {
    throw new PromptValidationServiceError("Validation run not found", "NOT_FOUND");
  }
  if (isTerminalStatus(row.status)) {
    throw new PromptValidationServiceError("Run already finished", "CONFLICT");
  }

  const updated = await prisma.promptValidationRun.update({
    where: { id: runId },
    data: {
      status: PromptValidationRunStatus.canceled,
      canceledAt: new Date(),
      completedAt: new Date(),
      overallPassed: false,
    },
    include: {
      creator: { select: { email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      },
    },
  });
  return mapRun(updated);
}

export async function startValidationRun(params: {
  instructionId: string;
  createdBy: string;
  testInput?: Record<string, unknown>;
  testOutput?: Record<string, unknown>;
}): Promise<PromptValidationRunDto> {
  const instruction = await prisma.adminInstruction.findUnique({
    where: { id: params.instructionId },
    include: { creator: { select: { email: true } } },
  });
  if (!instruction) {
    throw new PromptValidationServiceError("Prompt not found", "NOT_FOUND");
  }

  const run = await prisma.promptValidationRun.create({
    data: {
      instructionId: params.instructionId,
      status: PromptValidationRunStatus.queued,
      overallPassed: false,
      ruleResults: [],
      createdBy: params.createdBy,
    },
    include: {
      creator: { select: { email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      },
    },
  });

  await prisma.promptValidationRun.update({
    where: { id: run.id },
    data: {
      status: PromptValidationRunStatus.running,
      startedAt: new Date(),
    },
  });

  await delay(400);

  const active = await prisma.promptValidationRun.findUnique({ where: { id: run.id } });
  if (active?.status === PromptValidationRunStatus.canceled) {
    return getValidationRunById(run.id) as Promise<PromptValidationRunDto>;
  }

  const rules = await executeValidationRules({
    instructionId: instruction.id,
    versionNumber: instruction.versionNumber,
    status: instruction.status,
    content: {
      masterInstructions: instruction.masterInstructions,
      companyGuardrails: instruction.companyGuardrails,
      productProtocolRules: instruction.productProtocolRules,
    },
    testInput: params.testInput,
    testOutput: params.testOutput,
  });

  const overallPassed = validationRunOverallPassed(rules);

  const completed = await prisma.promptValidationRun.update({
    where: { id: run.id },
    data: {
      status: overallPassed
        ? PromptValidationRunStatus.passed
        : PromptValidationRunStatus.failed,
      overallPassed,
      ruleResults: rules as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
    include: {
      creator: { select: { email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      },
    },
  });

  await recordPromptAuditEvent({
    instructionId: params.instructionId,
    eventType: PromptAuditEventType.validation_run,
    actorUserId: params.createdBy,
    metadata: {
      runId: completed.id,
      status: completed.status,
      overallPassed,
      ruleCount: rules.length,
    },
  });

  return mapRun(completed);
}

export async function addValidationComment(params: {
  runId: string;
  instructionId: string;
  authorId: string;
  body: string;
}): Promise<PromptValidationRunDto> {
  const run = await prisma.promptValidationRun.findFirst({
    where: { id: params.runId, instructionId: params.instructionId },
  });
  if (!run) {
    throw new PromptValidationServiceError("Validation run not found", "NOT_FOUND");
  }

  await prisma.promptValidationComment.create({
    data: {
      runId: params.runId,
      authorId: params.authorId,
      body: params.body.trim(),
    },
  });

  const updated = await prisma.promptValidationRun.findUniqueOrThrow({
    where: { id: params.runId },
    include: {
      creator: { select: { email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { email: true } } },
      },
    },
  });
  return mapRun(updated);
}

export async function submitPromptReview(params: {
  instructionId: string;
  submittedBy: string;
  action: "submit" | "approve" | "reject";
  comment?: string;
  reviewerId?: string;
}): Promise<{ review: PromptReviewSubmissionDto; governance: PromptGovernanceSnapshot }> {
  const instruction = await prisma.adminInstruction.findUnique({
    where: { id: params.instructionId },
  });
  if (!instruction) {
    throw new PromptValidationServiceError("Prompt not found", "NOT_FOUND");
  }

  if (params.action === "submit") {
    const latestRun = await prisma.promptValidationRun.findFirst({
      where: { instructionId: params.instructionId },
      orderBy: { createdAt: "desc" },
    });
    if (!latestRun || latestRun.status !== PromptValidationRunStatus.passed) {
      throw new PromptValidationServiceError(
        "Validation must pass before submitting for review",
        "VALIDATION",
      );
    }

    const pending = await prisma.promptReviewSubmission.findFirst({
      where: {
        instructionId: params.instructionId,
        status: PromptReviewStatus.pending,
      },
    });
    if (pending) {
      throw new PromptValidationServiceError(
        "A review is already pending for this version",
        "CONFLICT",
      );
    }

    const created = await prisma.promptReviewSubmission.create({
      data: {
        instructionId: params.instructionId,
        validationRunId: latestRun.id,
        status: PromptReviewStatus.pending,
        submittedBy: params.submittedBy,
        submitterComment: params.comment?.trim() || null,
      },
      include: {
        submitter: { select: { email: true } },
        reviewer: { select: { email: true } },
      },
    });

    await recordPromptAuditEvent({
      instructionId: params.instructionId,
      eventType: PromptAuditEventType.review_submitted,
      actorUserId: params.submittedBy,
      metadata: {
        reviewId: created.id,
        validationRunId: latestRun.id,
        comment: params.comment ?? null,
      },
    });

    const governance = (await getPromptGovernanceSnapshot(params.instructionId))!;
    return { review: mapReview(created)!, governance };
  }

  const pending = await prisma.promptReviewSubmission.findFirst({
    where: {
      instructionId: params.instructionId,
      status: PromptReviewStatus.pending,
    },
    orderBy: { submittedAt: "desc" },
  });
  if (!pending) {
    throw new PromptValidationServiceError("No pending review to decide", "NOT_FOUND");
  }

  const reviewerId = params.reviewerId ?? params.submittedBy;
  const updated = await prisma.promptReviewSubmission.update({
    where: { id: pending.id },
    data: {
      status:
        params.action === "approve"
          ? PromptReviewStatus.approved
          : PromptReviewStatus.rejected,
      reviewerId,
      reviewerComment: params.comment?.trim() || null,
      decidedAt: new Date(),
    },
    include: {
      submitter: { select: { email: true } },
      reviewer: { select: { email: true } },
    },
  });

  await recordPromptAuditEvent({
    instructionId: params.instructionId,
    eventType: PromptAuditEventType.review_decided,
    actorUserId: reviewerId,
    metadata: {
      reviewId: updated.id,
      decision: params.action,
      comment: params.comment ?? null,
    },
  });

  const governance = (await getPromptGovernanceSnapshot(params.instructionId))!;
  return { review: mapReview(updated)!, governance };
}
