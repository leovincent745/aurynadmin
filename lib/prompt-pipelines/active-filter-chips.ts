import type { ActivePromptFilterChip } from "@/lib/domain/prompt-pipeline-filters";
import type { PromptPipelineListQuery } from "@/lib/domain/prompt-pipelines";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";

const STATUS_LABELS: Record<PromptSummaryStatusFilter, string> = {
  all: "All Status",
  active: "Active",
  in_review: "In Review",
  archived: "Archived",
};

export function buildActiveFilterChips(
  query: PromptPipelineListQuery & { searchInput?: string },
): ActivePromptFilterChip[] {
  const chips: ActivePromptFilterChip[] = [];

  if (query.status && query.status !== "all") {
    chips.push({
      key: "status",
      label: "Status",
      value: STATUS_LABELS[query.status] ?? query.status,
    });
  }

  if (query.category) {
    chips.push({ key: "category", label: "Category", value: query.category });
  }

  if (query.owner) {
    chips.push({ key: "owner", label: "Owner", value: query.owner });
  }

  if (query.model) {
    chips.push({ key: "model", label: "Model", value: query.model });
  }

  const q = query.search?.trim() || query.searchInput?.trim();
  if (q) {
    chips.push({ key: "q", label: "Search", value: q });
  }

  return chips;
}

export function hasActiveFilters(
  query: PromptPipelineListQuery & { searchInput?: string },
): boolean {
  return buildActiveFilterChips(query).length > 0;
}
