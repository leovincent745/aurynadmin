"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type {
  ActivePromptFilterChip,
  PromptPipelineFilterOptions,
} from "@/lib/domain/prompt-pipeline-filters";
import type {
  PromptPipelineListQuery,
  PromptPipelineListResponse,
  PromptPipelineSortDirection,
  PromptPipelineSortField,
} from "@/lib/domain/prompt-pipelines";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";
import {
  buildActiveFilterChips,
  hasActiveFilters,
} from "@/lib/prompt-pipelines/active-filter-chips";
import { parsePromptPipelineListQuery } from "@/lib/prompt-pipelines/parse-list-query";
import {
  buildPromptSystemHref,
  mergePromptSystemParams,
  PROMPT_SYSTEM_QUERY_KEYS,
  readPromptSystemUrlState,
} from "@/lib/prompt-system/url-state";

export interface UsePromptPipelinesTableResult {
  data: PromptPipelineListResponse | null;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  filterOptions: PromptPipelineFilterOptions | null;
  filterOptionsLoading: boolean;
  searchInput: string;
  statusFilter: PromptSummaryStatusFilter;
  categoryFilter: string;
  ownerFilter: string;
  modelFilter: string;
  activeChips: ActivePromptFilterChip[];
  hasFilters: boolean;
  sort: PromptPipelineSortField;
  sortDirection: PromptPipelineSortDirection;
  page: number;
  setSearchInput: (value: string) => void;
  setStatusFilter: (value: PromptSummaryStatusFilter) => void;
  setCategoryFilter: (value: string) => void;
  setOwnerFilter: (value: string) => void;
  setModelFilter: (value: string) => void;
  setPage: (page: number) => void;
  toggleSort: (field: PromptPipelineSortField) => void;
  selectRow: (id: string) => void;
  removeFilterChip: (key: ActivePromptFilterChip["key"]) => void;
  clearFilters: () => void;
  clearSelection: () => void;
  retry: () => void;
  refresh: () => void;
}

function listQueryToFetchParams(q: PromptPipelineListQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(q.page ?? 1));
  params.set("limit", String(q.limit ?? 20));
  if (q.status && q.status !== "all") params.set("status", q.status);
  if (q.category) params.set("category", q.category);
  if (q.owner) params.set("owner", q.owner);
  if (q.model) params.set("model", q.model);
  if (q.search) params.set("q", q.search);
  if (q.sort) params.set("sort", q.sort);
  if (q.sortDirection) params.set("dir", q.sortDirection);
  return params;
}

export function usePromptPipelinesTable(): UsePromptPipelinesTableResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const urlState = useMemo(
    () => readPromptSystemUrlState(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );
  const urlQuery = urlState.listQuery;

  const [searchInput, setSearchInput] = useState(urlQuery.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [data, setData] = useState<PromptPipelineListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<PromptPipelineFilterOptions | null>(
    null,
  );
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);

  const selectedId = urlState.selectedId;

  const navigateUrl = useCallback(
    (
      patch: Parameters<typeof mergePromptSystemParams>[1],
      history: "push" | "replace" = "push",
    ) => {
      const params = mergePromptSystemParams(
        new URLSearchParams(searchParamsKey),
        patch,
      );
      const href = buildPromptSystemHref(pathname, params);
      if (history === "replace") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router, searchParamsKey],
  );

  const fetchFilterOptions = useCallback(async () => {
    setFilterOptionsLoading(true);
    try {
      const res = await fetch("/api/admin/prompts/filter-options", {
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as { filterOptions: PromptPipelineFilterOptions };
        setFilterOptions(json.filterOptions);
      }
    } finally {
      setFilterOptionsLoading(false);
    }
  }, []);

  const fetchList = useCallback(async (q: PromptPipelineListQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompts?${listQueryToFetchParams(q).toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load pipelines");
      const json = (await res.json()) as PromptPipelineListResponse;
      setData(json);
      if (json.meta?.filterOptions) {
        setFilterOptions(json.meta.filterOptions);
      }
    } catch {
      setData(null);
      setError(
        typeof navigator !== "undefined" && !navigator.onLine
          ? "You appear to be offline. Reconnect and try again."
          : "Could not load prompt pipelines.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    const urlSearch = urlQuery.search ?? "";
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch);
    }
  }, [urlQuery.search, searchInput]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const current = urlQuery.search ?? "";
    if (trimmed === current) return;
    navigateUrl({ search: trimmed || undefined, page: 1 }, "replace");
  }, [debouncedSearch, urlQuery.search, navigateUrl]);

  useEffect(() => {
    void fetchList(parsePromptPipelineListQuery(new URLSearchParams(searchParamsKey)));
  }, [fetchList, searchParamsKey]);

  /** Default selection only when URL has no `selected` — preserves deep links and back/forward. */
  useEffect(() => {
    if (loading || !data || data.items.length === 0) return;
    if (searchParams.has(PROMPT_SYSTEM_QUERY_KEYS.selected)) return;

    const preferred =
      data.items.find((i) => i.status === "Active")?.id ?? data.items[0]!.id;
    navigateUrl({ selected: preferred, tab: "overview", panel: null }, "replace");
  }, [data, loading, searchParams, navigateUrl]);

  const statusFilter = urlQuery.status ?? "all";
  const categoryFilter = urlQuery.category ?? "all";
  const ownerFilter = urlQuery.owner ?? "all";
  const modelFilter = urlQuery.model ?? "all";

  const activeChips = useMemo(
    () =>
      buildActiveFilterChips({
        ...urlQuery,
        searchInput: urlQuery.search ? undefined : searchInput,
      }),
    [urlQuery, searchInput],
  );

  const hasFilters = useMemo(
    () => hasActiveFilters({ ...urlQuery, searchInput }),
    [urlQuery, searchInput],
  );

  const setStatusFilter = useCallback(
    (status: PromptSummaryStatusFilter) => {
      navigateUrl({ status, page: 1 });
    },
    [navigateUrl],
  );

  const setCategoryFilter = useCallback(
    (category: string) => {
      navigateUrl({
        category: category === "all" ? undefined : category,
        page: 1,
      });
    },
    [navigateUrl],
  );

  const setOwnerFilter = useCallback(
    (owner: string) => {
      navigateUrl({
        owner: owner === "all" ? undefined : owner,
        page: 1,
      });
    },
    [navigateUrl],
  );

  const setModelFilter = useCallback(
    (model: string) => {
      navigateUrl({
        model: model === "all" ? undefined : model,
        page: 1,
      });
    },
    [navigateUrl],
  );

  const setPage = useCallback(
    (page: number) => {
      navigateUrl({ page });
    },
    [navigateUrl],
  );

  const toggleSort = useCallback(
    (field: PromptPipelineSortField) => {
      const nextDir: PromptPipelineSortDirection =
        urlQuery.sort === field && urlQuery.sortDirection === "desc" ? "asc" : "desc";
      navigateUrl({
        sort: field,
        sortDirection: nextDir,
        page: 1,
      });
    },
    [urlQuery.sort, urlQuery.sortDirection, navigateUrl],
  );

  const selectRow = useCallback(
    (id: string) => {
      navigateUrl({ selected: id, tab: "overview", panel: null });
    },
    [navigateUrl],
  );

  const removeFilterChip = useCallback(
    (key: ActivePromptFilterChip["key"]) => {
      switch (key) {
        case "status":
          navigateUrl({ status: "all", page: 1 });
          break;
        case "category":
          navigateUrl({ category: undefined, page: 1 });
          break;
        case "owner":
          navigateUrl({ owner: undefined, page: 1 });
          break;
        case "model":
          navigateUrl({ model: undefined, page: 1 });
          break;
        case "q":
          setSearchInput("");
          navigateUrl({ search: undefined, page: 1 });
          break;
      }
    },
    [navigateUrl],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    const params = new URLSearchParams(searchParamsKey);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.page);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.limit);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.status);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.category);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.owner);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.model);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.search);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.sort);
    params.delete(PROMPT_SYSTEM_QUERY_KEYS.sortDirection);
    router.push(buildPromptSystemHref(pathname, params), { scroll: false });
  }, [pathname, router, searchParamsKey]);

  const clearSelection = useCallback(() => {
    navigateUrl({ selected: null });
  }, [navigateUrl]);

  const retry = useCallback(() => {
    void fetchList(parsePromptPipelineListQuery(new URLSearchParams(searchParamsKey)));
  }, [fetchList, searchParamsKey]);

  return {
    data,
    loading,
    error,
    selectedId,
    filterOptions,
    filterOptionsLoading,
    searchInput,
    statusFilter,
    categoryFilter,
    ownerFilter,
    modelFilter,
    activeChips,
    hasFilters,
    sort: urlQuery.sort ?? "version",
    sortDirection: urlQuery.sortDirection ?? "desc",
    page: urlQuery.page ?? 1,
    setSearchInput,
    setStatusFilter,
    setCategoryFilter,
    setOwnerFilter,
    setModelFilter,
    setPage,
    toggleSort,
    selectRow,
    removeFilterChip,
    clearFilters,
    clearSelection,
    retry,
    refresh: retry,
  };
}
