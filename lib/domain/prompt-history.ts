import type { AdminInstructionStatus } from "@prisma/client";

export type PromptAuditEventType =
  | "version_created"
  | "draft_saved"
  | "published"
  | "archived"
  | "activated"
  | "rollback"
  | "validation_run"
  | "review_submitted"
  | "review_decided";

export interface PromptAuditEventDto {
  id: string;
  instructionId: string;
  eventType: PromptAuditEventType;
  actorEmail: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface PromptValidationEvidenceDto {
  runId: string;
  status: string;
  overallPassed: boolean;
  completedAt: string | null;
  createdByEmail: string;
}

export interface PromptReviewerHistoryDto {
  reviewId: string;
  status: string;
  submittedByEmail: string;
  submittedAt: string;
  reviewerEmail: string | null;
  reviewerComment: string | null;
  decidedAt: string | null;
}

export interface PromptRollbackDto {
  id: string;
  sourceInstructionId: string;
  targetDraftId: string;
  sourceVersionNumber: number;
  sourceStatus: string;
  performedByEmail: string;
  reason: string | null;
  createdAt: string;
}

export interface PromptVersionTimelineEntry {
  instructionId: string;
  versionNumber: number;
  status: AdminInstructionStatus;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** Published/archived rows are immutable; draft is mutable. */
  immutable: boolean;
  isSelected: boolean;
  auditEvents: PromptAuditEventDto[];
  validationEvidence: PromptValidationEvidenceDto[];
  reviewerHistory: PromptReviewerHistoryDto[];
  rollbacksFrom: PromptRollbackDto[];
}

export interface PromptHistoryResponse {
  promptId: string;
  pipelineName: string;
  selectedVersionNumber: number;
  timeline: PromptVersionTimelineEntry[];
  activationHistory: PromptAuditEventDto[];
  globalAuditEvents: PromptAuditEventDto[];
}

export const AUDIT_EVENT_LABELS: Record<PromptAuditEventType, string> = {
  version_created: "Version created",
  draft_saved: "Draft saved",
  published: "Published live",
  archived: "Archived (deactivated)",
  activated: "Activated in production",
  rollback: "Rolled back to draft",
  validation_run: "Validation run",
  review_submitted: "Submitted for review",
  review_decided: "Review decision",
};
