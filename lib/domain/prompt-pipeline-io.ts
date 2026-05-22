/** Inputs/Outputs tab payload — see docs/requirements/prompt-system-page-developer-guide.md */

export type {
  PayloadValidationResult,
  PromptIoFieldKind,
  PromptIoFieldSchema,
  PromptPipelineIoSection,
  ValidationIssue,
} from "@/lib/domain/prompt-io-schema";

/** @deprecated Use PromptIoFieldSchema */
export type PromptIoField = import("@/lib/domain/prompt-io-schema").PromptIoFieldSchema;

export type PromptPipelineType = "chat_instructions";

export interface PromptPipelineIoResponse {
  pipelineType: PromptPipelineType;
  instructionId: string;
  versionNumber: number;
  status: string;
  pipelineName: string;
  pipelineCode: string;
  inputs: import("@/lib/domain/prompt-io-schema").PromptPipelineIoSection;
  outputs: import("@/lib/domain/prompt-io-schema").PromptPipelineIoSection;
}
