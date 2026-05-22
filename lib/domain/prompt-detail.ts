import type { InstructionRecord } from "@/lib/domain/admin-instructions";
import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";

export const PROMPT_PIPELINE_TASKS = [
  "Loads this instruction version for admin test chat when selected",
  "Published version drives live public /api/chat",
  "Stores instruction_version_id on Auryn messages",
  "Runs deterministic safety checks before OpenAI",
] as const;

export interface PromptModelConfig {
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  temperatureNote: string;
  maxTokensNote: string;
}

export interface PromptDetailResponse {
  id: string;
  name: string;
  code: string;
  purpose: string;
  category: string;
  status: PromptPipelineStatusLabel;
  versionNumber: number;
  ownerEmail: string;
  lastUpdated: string;
  modelConfig: PromptModelConfig;
  tasks: readonly string[];
  runs: number;
  successRate: number | null;
  instruction: InstructionRecord;
}
