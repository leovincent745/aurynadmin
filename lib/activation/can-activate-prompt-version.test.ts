import { AdminInstructionStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { canActivatePromptVersion } from "@/lib/activation/can-activate-prompt-version";

const now = new Date().toISOString();

const baseCtx = {
  instructionId: "cl00000000000000000000001",
  versionNumber: 3,
  instructionUpdatedAt: now,
  dbStatus: AdminInstructionStatus.draft,
  pipelineStatusLabel: "In Review" as const,
  outputSchemaValid: true,
  latestValidationRun: {
    id: "run1",
    instructionId: "cl00000000000000000000001",
    status: "passed" as const,
    overallPassed: true,
    rules: [
      { id: "1", category: "output_schema" as const, name: "o", status: "passed" as const },
      { id: "2", category: "safety" as const, name: "s", status: "passed" as const },
      { id: "3", category: "business_rules" as const, name: "b", status: "passed" as const },
    ],
    createdByEmail: "a@test.com",
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: new Date().toISOString(),
    canceledAt: null,
    comments: [],
  },
  review: {
    id: "rev1",
    instructionId: "cl00000000000000000000001",
    validationRunId: "run1",
    status: "approved" as const,
    submittedByEmail: "a@test.com",
    submittedAt: new Date().toISOString(),
    submitterComment: null,
    reviewerEmail: "r@test.com",
    reviewerComment: null,
    decidedAt: new Date().toISOString(),
  },
  physicianApproval: {
    id: "phy1",
    instructionId: "cl00000000000000000000001",
    status: "approved" as const,
    physicianEmail: "md@test.com",
    comment: null,
    decidedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  adminTestPassCount: 1,
};

describe("canActivatePromptVersion", () => {
  it("allows when all checks pass", () => {
    const result = canActivatePromptVersion(baseCtx);
    expect(result.allowed).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it("blocks published versions", () => {
    const result = canActivatePromptVersion({
      ...baseCtx,
      dbStatus: AdminInstructionStatus.published,
      pipelineStatusLabel: "Active",
    });
    expect(result.allowed).toBe(false);
    expect(result.checks.find((c) => c.id === "in_review_only")?.passed).toBe(false);
  });

  it("blocks without physician approval", () => {
    const result = canActivatePromptVersion({
      ...baseCtx,
      physicianApproval: null,
    });
    expect(result.allowed).toBe(false);
  });

  it("blocks stale physician approval after draft edit", () => {
    const draftEditedAt = new Date("2026-05-21T12:00:00.000Z").toISOString();
    const result = canActivatePromptVersion({
      ...baseCtx,
      instructionUpdatedAt: draftEditedAt,
      physicianApproval: {
        ...baseCtx.physicianApproval!,
        decidedAt: new Date("2026-05-21T10:00:00.000Z").toISOString(),
      },
    });
    expect(result.allowed).toBe(false);
    expect(result.checks.find((c) => c.id === "physician_approval")?.message).toContain(
      "stale",
    );
  });

  it("blocks stale validation after draft edit", () => {
    const draftEditedAt = new Date("2026-05-21T12:00:00.000Z").toISOString();
    const result = canActivatePromptVersion({
      ...baseCtx,
      instructionUpdatedAt: draftEditedAt,
      latestValidationRun: {
        ...baseCtx.latestValidationRun!,
        completedAt: new Date("2026-05-21T10:00:00.000Z").toISOString(),
      },
    });
    expect(result.allowed).toBe(false);
    expect(result.checks.find((c) => c.id === "validation_suite")?.message).toContain(
      "Draft changed",
    );
  });
});
