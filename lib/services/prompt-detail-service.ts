import { getChatModelConfig } from "@/lib/ai/model-config";
import {
  PROMPT_PIPELINE_TASKS,
  type PromptDetailResponse,
} from "@/lib/domain/prompt-detail";
import {
  PROMPT_PIPELINE_CATEGORY,
  PROMPT_PIPELINE_NAME,
} from "@/lib/domain/prompt-pipeline-meta";
import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";
import { getInstructionById } from "@/lib/services/instruction-service";
import { AdminInstructionStatus, AiLogEventType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

function pipelineCode(versionNumber: number): string {
  return `PROMPT-CHAT-${String(versionNumber).padStart(3, "0")}`;
}

function purposePreview(masterInstructions: string): string {
  const line = masterInstructions.replace(/\s+/g, " ").trim();
  if (!line) return "";
  if (line.length <= 120) return line;
  return `${line.slice(0, 120)}…`;
}

function statusLabel(status: AdminInstructionStatus): PromptPipelineStatusLabel {
  switch (status) {
    case AdminInstructionStatus.published:
      return "Active";
    case AdminInstructionStatus.draft:
      return "In Review";
    case AdminInstructionStatus.archived:
      return "Archived";
    default:
      return "Archived";
  }
}

async function loadRunStats(id: string): Promise<{ runs: number; success: number }> {
  const groups = await prisma.aiLog.groupBy({
    by: ["eventType"],
    where: { instructionVersionId: id },
    _count: { _all: true },
  });

  let runs = 0;
  let success = 0;
  for (const row of groups) {
    const count = row._count._all;
    runs += count;
    if (row.eventType === AiLogEventType.chat_success) {
      success += count;
    }
  }
  return { runs, success };
}

export async function getPromptDetailById(id: string): Promise<PromptDetailResponse | null> {
  const instruction = await getInstructionById(id);
  if (!instruction) return null;

  const { runs, success } = await loadRunStats(id);
  const successRate = runs === 0 ? null : Math.round((success / runs) * 1000) / 10;

  return {
    id: instruction.id,
    name: PROMPT_PIPELINE_NAME,
    code: pipelineCode(instruction.versionNumber),
    purpose: purposePreview(instruction.masterInstructions),
    category: PROMPT_PIPELINE_CATEGORY,
    status: statusLabel(instruction.status),
    versionNumber: instruction.versionNumber,
    ownerEmail: instruction.createdByEmail,
    lastUpdated: instruction.updatedAt,
    modelConfig: getChatModelConfig(),
    tasks: PROMPT_PIPELINE_TASKS,
    runs,
    successRate,
    instruction,
  };
}
