import type { AdminInstructionStatus } from "@prisma/client";

import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";
import type {
  PromptPhysicianApprovalDto,
  PromptReviewSubmissionDto,
  PromptValidationRunDto,
} from "@/lib/domain/prompt-validation";

/** Minimum successful admin test chat turns tied to this instruction version. */
export const REQUIRED_ADMIN_TEST_PASSES = 1;

export type ActivationCheckId =
  | "in_review_only"
  | "output_schema"
  | "safety"
  | "business_rules"
  | "test_cases"
  | "validation_suite"
  | "reviewer_approval"
  | "physician_approval";

export interface ActivationCheckItem {
  id: ActivationCheckId;
  label: string;
  passed: boolean;
  message: string;
}

export interface PromptVersionActivationContext {
  instructionId: string;
  versionNumber: number;
  /** Draft row `updated_at` — approvals/validation must be newer than this. */
  instructionUpdatedAt: string;
  dbStatus: AdminInstructionStatus;
  pipelineStatusLabel: PromptPipelineStatusLabel;
  outputSchemaValid: boolean;
  latestValidationRun: PromptValidationRunDto | null;
  review: PromptReviewSubmissionDto | null;
  physicianApproval: PromptPhysicianApprovalDto | null;
  adminTestPassCount: number;
}

export interface CanActivatePromptVersionResult {
  allowed: boolean;
  blockReason: string | null;
  checks: ActivationCheckItem[];
}

