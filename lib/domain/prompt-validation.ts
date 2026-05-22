import type { ActivationCheckItem } from "@/lib/domain/prompt-activation";

/** Governance validation runs and reviewer workflow for Prompt System. */

export type PromptValidationRunStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "canceled";

export type PromptReviewStatus = "pending" | "approved" | "rejected";

export type ValidationRuleCategory =
  | "input_validation"
  | "output_schema"
  | "safety"
  | "business_rules"
  | "reviewer_approval"
  | "test_cases"
  | "physician_approval";

export interface PromptPhysicianApprovalDto {
  id: string;
  instructionId: string;
  status: PromptReviewStatus;
  physicianEmail: string | null;
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export type ValidationRuleStatus = "pending" | "passed" | "failed" | "skipped";

export interface ValidationRuleResult {
  id: string;
  category: ValidationRuleCategory;
  name: string;
  status: ValidationRuleStatus;
  message?: string;
  expected?: string;
  actual?: string;
}

export interface PromptValidationCommentDto {
  id: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

export interface PromptValidationRunDto {
  id: string;
  instructionId: string;
  status: PromptValidationRunStatus;
  overallPassed: boolean;
  rules: ValidationRuleResult[];
  createdByEmail: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
  comments: PromptValidationCommentDto[];
}

export interface PromptReviewSubmissionDto {
  id: string;
  instructionId: string;
  validationRunId: string | null;
  status: PromptReviewStatus;
  submittedByEmail: string;
  submittedAt: string;
  submitterComment: string | null;
  reviewerEmail: string | null;
  reviewerComment: string | null;
  decidedAt: string | null;
}

export interface PromptGovernanceSnapshot {
  latestRun: PromptValidationRunDto | null;
  review: PromptReviewSubmissionDto | null;
  physicianApproval: PromptPhysicianApprovalDto | null;
  adminTestPassCount: number;
  history: PromptValidationRunDto[];
  activationAllowed: boolean;
  activationBlockReason: string | null;
  activationChecks: ActivationCheckItem[];
}

export const VALIDATION_CATEGORY_LABELS: Record<ValidationRuleCategory, string> = {
  input_validation: "Input validation",
  output_schema: "Output schema",
  safety: "Safety",
  business_rules: "Business rules",
  reviewer_approval: "Reviewer approval",
  test_cases: "Test cases",
  physician_approval: "Physician approval",
};
