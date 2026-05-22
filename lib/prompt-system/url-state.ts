import type { PromptPipelineListQuery } from "@/lib/domain/prompt-pipelines";
import {
  PROMPT_DETAIL_TAB_QUERY_KEY,
  parsePromptDetailTabSlug,
  type PromptDetailTabSlug,
} from "@/lib/domain/prompt-detail-tabs";
import { parsePromptPipelineListQuery } from "@/lib/prompt-pipelines/parse-list-query";

/** URL query keys for the Prompt System page (`/prompt-system`). */
export const PROMPT_SYSTEM_QUERY_KEYS = {
  selected: "selected",
  tab: PROMPT_DETAIL_TAB_QUERY_KEY,
  page: "page",
  limit: "limit",
  status: "status",
  category: "category",
  owner: "owner",
  model: "model",
  search: "q",
  sort: "sort",
  sortDirection: "dir",
} as const;

export interface PromptSystemUrlState {
  listQuery: PromptPipelineListQuery;
  selectedId: string | null;
  tab: PromptDetailTabSlug;
}

export function readPromptSystemUrlState(
  searchParams: URLSearchParams,
): PromptSystemUrlState {
  return {
    listQuery: parsePromptPipelineListQuery(searchParams),
    selectedId: searchParams.get(PROMPT_SYSTEM_QUERY_KEYS.selected),
    tab: parsePromptDetailTabSlug(searchParams.get(PROMPT_SYSTEM_QUERY_KEYS.tab)),
  };
}

export type PromptSystemUrlPatch = Partial<PromptPipelineListQuery> & {
  selected?: string | null;
  tab?: PromptDetailTabSlug | null;
};

/** Merge list filters, selection, and tab into URLSearchParams (defaults omitted). */
export function mergePromptSystemParams(
  base: URLSearchParams,
  patch: PromptSystemUrlPatch,
): URLSearchParams {
  const params = new URLSearchParams(base.toString());

  if (patch.page != null) params.set(PROMPT_SYSTEM_QUERY_KEYS.page, String(patch.page));

  if (patch.limit != null) params.set(PROMPT_SYSTEM_QUERY_KEYS.limit, String(patch.limit));

  if (patch.status != null) {
    if (patch.status === "all") params.delete(PROMPT_SYSTEM_QUERY_KEYS.status);
    else params.set(PROMPT_SYSTEM_QUERY_KEYS.status, patch.status);
  }

  if (patch.category != null) {
    if (!patch.category || patch.category === "all") {
      params.delete(PROMPT_SYSTEM_QUERY_KEYS.category);
    } else {
      params.set(PROMPT_SYSTEM_QUERY_KEYS.category, patch.category);
    }
  }

  if (patch.owner != null) {
    if (!patch.owner || patch.owner === "all") {
      params.delete(PROMPT_SYSTEM_QUERY_KEYS.owner);
    } else {
      params.set(PROMPT_SYSTEM_QUERY_KEYS.owner, patch.owner);
    }
  }

  if (patch.model != null) {
    if (!patch.model || patch.model === "all") {
      params.delete(PROMPT_SYSTEM_QUERY_KEYS.model);
    } else {
      params.set(PROMPT_SYSTEM_QUERY_KEYS.model, patch.model);
    }
  }

  if (patch.search != null) {
    if (patch.search) params.set(PROMPT_SYSTEM_QUERY_KEYS.search, patch.search);
    else params.delete(PROMPT_SYSTEM_QUERY_KEYS.search);
  }

  if (patch.sort != null) {
    if (patch.sort === "version") params.delete(PROMPT_SYSTEM_QUERY_KEYS.sort);
    else params.set(PROMPT_SYSTEM_QUERY_KEYS.sort, patch.sort);
  }

  if (patch.sortDirection != null) {
    if (patch.sortDirection === "desc") {
      params.delete(PROMPT_SYSTEM_QUERY_KEYS.sortDirection);
    } else {
      params.set(PROMPT_SYSTEM_QUERY_KEYS.sortDirection, patch.sortDirection);
    }
  }

  if ("selected" in patch) {
    if (patch.selected) params.set(PROMPT_SYSTEM_QUERY_KEYS.selected, patch.selected);
    else params.delete(PROMPT_SYSTEM_QUERY_KEYS.selected);
  }

  if ("tab" in patch) {
    if (!patch.tab || patch.tab === "overview") {
      params.delete(PROMPT_SYSTEM_QUERY_KEYS.tab);
    } else {
      params.set(PROMPT_SYSTEM_QUERY_KEYS.tab, patch.tab);
    }
  }

  return params;
}

export function buildPromptSystemHref(
  pathname: string,
  params: URLSearchParams,
): string {
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
