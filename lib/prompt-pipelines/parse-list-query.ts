import type {
  PromptPipelineListQuery,
  PromptPipelineSortDirection,
  PromptPipelineSortField,
} from "@/lib/domain/prompt-pipelines";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";

const VALID_STATUS: PromptSummaryStatusFilter[] = [
  "all",
  "active",
  "in_review",
  "archived",
];

const VALID_SORT: PromptPipelineSortField[] = ["version", "updated", "status"];

export function parsePromptPipelineListQuery(
  searchParams: URLSearchParams,
): PromptPipelineListQuery {
  const rawStatus = searchParams.get("status");
  const status =
    rawStatus && VALID_STATUS.includes(rawStatus as PromptSummaryStatusFilter)
      ? (rawStatus as PromptSummaryStatusFilter)
      : "all";

  const rawSort = searchParams.get("sort");
  const sort =
    rawSort && VALID_SORT.includes(rawSort as PromptPipelineSortField)
      ? (rawSort as PromptPipelineSortField)
      : "version";

  const rawDir = searchParams.get("dir");
  const sortDirection: PromptPipelineSortDirection =
    rawDir === "asc" || rawDir === "desc" ? rawDir : "desc";

  const category = searchParams.get("category") ?? "all";
  const owner = searchParams.get("owner") ?? "all";
  const model = searchParams.get("model") ?? "all";
  const search = searchParams.get("q") ?? undefined;

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? "20") || 20),
  );

  return {
    page,
    limit,
    status,
    category: category === "all" ? undefined : category,
    owner: owner === "all" ? undefined : owner,
    model: model === "all" ? undefined : model,
    search: search?.trim() || undefined,
    sort,
    sortDirection,
  };
}
