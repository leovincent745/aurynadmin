export interface PromptFilterOption {
  value: string;
  label: string;
}

export interface PromptPipelineFilterOptions {
  pipelineName: string;
  statuses: PromptFilterOption[];
  categories: PromptFilterOption[];
  owners: PromptFilterOption[];
  models: PromptFilterOption[];
}

export interface ActivePromptFilterChip {
  key: "status" | "category" | "owner" | "model" | "q";
  label: string;
  value: string;
}
