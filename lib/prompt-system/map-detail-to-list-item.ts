import type { PromptDetailResponse } from "@/lib/domain/prompt-detail";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
/** Build a table row shape from detail API when the id is not on the current list page. */
export function mapPromptDetailToListItem(
  detail: PromptDetailResponse,
  successRate: number | null = null,
): PromptPipelineListItem {
  return {
    id: detail.id,
    name: detail.name,
    code: detail.code,
    purpose: detail.purpose || "—",
    category: detail.category,
    model: detail.modelConfig.model,
    status: detail.status,
    successRate,
    runs: detail.runs,
    updatedAt: detail.lastUpdated,
    versionNumber: detail.versionNumber,
    ownerEmail: detail.ownerEmail,
  };
}
