import type { PromptPipelineFilterOptions } from "@/lib/domain/prompt-pipeline-filters";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";

export type PromptPipelineStatusLabel = "Active" | "In Review" | "Archived";

export type PromptPipelineSortField = "version" | "updated" | "status";

export type PromptPipelineSortDirection = "asc" | "desc";

export interface PromptPipelineListItem {
  id: string;
  name: string;
  code: string;
  purpose: string;
  category: string;
  model: string;
  status: PromptPipelineStatusLabel;
  successRate: number | null;
  runs: number;
  updatedAt: string;
  versionNumber: number;
  ownerEmail: string;
}

export interface PromptPipelineListMeta {
  categories: string[];
  sort: PromptPipelineSortField;
  sortDirection: PromptPipelineSortDirection;
  filterOptions: PromptPipelineFilterOptions;
}

export interface PromptPipelineListResponse {
  items: PromptPipelineListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  meta: PromptPipelineListMeta;
}

export interface PromptPipelineListQuery {
  page?: number;
  limit?: number;
  status?: PromptSummaryStatusFilter;
  category?: string;
  owner?: string;
  model?: string;
  search?: string;
  sort?: PromptPipelineSortField;
  sortDirection?: PromptPipelineSortDirection;
}
