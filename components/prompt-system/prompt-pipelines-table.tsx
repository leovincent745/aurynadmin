"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, FlaskConical, MoreHorizontal } from "lucide-react";

import { PipelineStatusBadge } from "@/components/prompt-system/pipeline-status-badge";
import { PromptPipelineFiltersBar } from "@/components/prompt-system/prompt-pipeline-filters-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ActivePromptFilterChip, PromptPipelineFilterOptions } from "@/lib/domain/prompt-pipeline-filters";
import type {
  PromptPipelineListItem,
  PromptPipelineSortDirection,
  PromptPipelineSortField,
} from "@/lib/domain/prompt-pipelines";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function formatSuccess(rate: number | null): string {
  if (rate == null) return "—";
  return `${rate.toFixed(1)}%`;
}

function TableSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 10 }).map((__, j) => (
            <td key={j} className="px-2 py-3">
              <div className="h-4 rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SortableHeader({
  label,
  field,
  activeSort,
  activeDirection,
  onSort,
}: {
  label: string;
  field: PromptPipelineSortField;
  activeSort: PromptPipelineSortField;
  activeDirection: PromptPipelineSortDirection;
  onSort: (field: PromptPipelineSortField) => void;
}) {
  const active = activeSort === field;
  const Icon = active
    ? activeDirection === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className="px-2 py-3 font-semibold"
      scope="col"
      aria-sort={
        active ? (activeDirection === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
        onClick={() => onSort(field)}
      >
        {label}
        <Icon className="h-3 w-3" aria-hidden />
      </button>
    </th>
  );
}

export interface PromptPipelinesTableProps {
  items: PromptPipelineListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  page: number;
  total: number;
  totalPages: number;
  limit: number;
  loading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  filterOptions?: PromptPipelineFilterOptions | null;
  filterOptionsLoading?: boolean;
  statusFilter?: PromptSummaryStatusFilter;
  onStatusFilterChange?: (filter: PromptSummaryStatusFilter) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (category: string) => void;
  ownerFilter?: string;
  onOwnerFilterChange?: (owner: string) => void;
  modelFilter?: string;
  onModelFilterChange?: (model: string) => void;
  searchInput?: string;
  onSearchChange?: (value: string) => void;
  activeChips?: ActivePromptFilterChip[];
  onRemoveChip?: (key: ActivePromptFilterChip["key"]) => void;
  hasFilters?: boolean;
  sort?: PromptPipelineSortField;
  sortDirection?: PromptPipelineSortDirection;
  onSort?: (field: PromptPipelineSortField) => void;
  onClearFilters?: () => void;
}

export function PromptPipelinesTable({
  items,
  selectedId,
  onSelect,
  page,
  total,
  totalPages,
  limit,
  loading,
  error,
  onPageChange,
  onRetry,
  filterOptions = null,
  filterOptionsLoading,
  statusFilter = "all",
  onStatusFilterChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  ownerFilter = "all",
  onOwnerFilterChange,
  modelFilter = "all",
  onModelFilterChange,
  searchInput = "",
  onSearchChange,
  activeChips = [],
  onRemoveChip,
  hasFilters = false,
  sort = "version",
  sortDirection = "desc",
  onSort,
  onClearFilters,
}: PromptPipelinesTableProps) {
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const focusRow = useCallback((id: string) => {
    rowRefs.current.get(id)?.focus();
  }, []);

  useEffect(() => {
    if (selectedId) focusRow(selectedId);
  }, [selectedId, items, focusRow]);

  const handleRowKeyDown = (
    event: React.KeyboardEvent,
    prompt: PromptPipelineListItem,
    index: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(prompt.id);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = items[index + 1];
      if (next) {
        onSelect(next.id);
        focusRow(next.id);
      }
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = items[index - 1];
      if (prev) {
        onSelect(prev.id);
        focusRow(prev.id);
      }
    }
  };

  return (
    <Card className="min-w-0 overflow-hidden bg-white">
      <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base text-slate-950">Prompt Pipelines</CardTitle>
          <p className="text-xs text-slate-500">
            API-driven from <code className="text-[10px]">admin_instructions</code> ·{" "}
            <code className="text-[10px]">GET /api/admin/prompts</code>
          </p>
        </div>
        <PromptPipelineFiltersBar
          filterOptions={filterOptions}
          optionsLoading={filterOptionsLoading}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          ownerFilter={ownerFilter}
          modelFilter={modelFilter}
          searchInput={searchInput}
          activeChips={activeChips}
          onStatusChange={(v) => onStatusFilterChange?.(v)}
          onCategoryChange={(v) => onCategoryFilterChange?.(v)}
          onOwnerChange={(v) => onOwnerFilterChange?.(v)}
          onModelChange={(v) => onModelFilterChange?.(v)}
          onSearchChange={(v) => onSearchChange?.(v)}
          onRemoveChip={(k) => onRemoveChip?.(k)}
          onClearAll={() => onClearFilters?.()}
        />
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            {onRetry ? (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
          </div>
        ) : loading ? (
          <div className="hidden overflow-x-auto lg:block" aria-busy="true" aria-label="Loading pipelines">
            <table className="min-w-[1200px] table-auto text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-2 py-3">Prompt / Pipeline</th>
                  <th className="px-2 py-3">Purpose</th>
                  <th className="px-2 py-3">Category</th>
                  <th className="px-2 py-3">Version</th>
                  <th className="px-2 py-3">Owner</th>
                  <th className="px-2 py-3">Model</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Success</th>
                  <th className="px-2 py-3">Runs</th>
                  <th className="px-2 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeletonRows />
              </tbody>
            </table>
            <p className="p-4 text-center text-sm text-slate-500 lg:hidden">Loading pipelines…</p>
          </div>
        ) : total === 0 && !hasFilters ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No instruction versions yet. Use <span className="font-semibold">New Prompt</span> to
            create a draft.
          </p>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No prompts match these filters.{" "}
            <button
              type="button"
              className="font-semibold text-violet-700 underline"
              onClick={onClearFilters}
            >
              Clear filters
            </button>
          </p>
        ) : (
          <>
            <div className="divide-y lg:hidden" role="listbox" aria-label="Prompt pipelines">
              {items.map((prompt, index) => {
                const isSelected = selectedId === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full space-y-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                      isSelected ? "bg-violet-50" : ""
                    }`}
                    onClick={() => onSelect(prompt.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, prompt, index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-2">
                        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-slate-900">{prompt.name}</p>
                          <p className="text-xs text-slate-400">
                            {prompt.code} · v{prompt.versionNumber}
                          </p>
                        </div>
                      </div>
                      <PipelineStatusBadge status={prompt.status} />
                    </div>
                    <p className="text-xs leading-5 text-slate-600">{prompt.purpose}</p>
                    <p className="text-xs text-slate-500">
                      {prompt.ownerEmail} · {formatUpdated(prompt.updatedAt)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table
                className="min-w-[1200px] table-auto text-left text-xs"
                aria-label="Prompt pipelines"
              >
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Prompt / Pipeline
                    </th>
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Purpose
                    </th>
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Category
                    </th>
                    {onSort ? (
                      <SortableHeader
                        label="Version"
                        field="version"
                        activeSort={sort}
                        activeDirection={sortDirection}
                        onSort={onSort}
                      />
                    ) : (
                      <th className="px-2 py-3 font-semibold" scope="col">
                        Version
                      </th>
                    )}
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Owner
                    </th>
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Model
                    </th>
                    {onSort ? (
                      <SortableHeader
                        label="Status"
                        field="status"
                        activeSort={sort}
                        activeDirection={sortDirection}
                        onSort={onSort}
                      />
                    ) : (
                      <th className="px-2 py-3 font-semibold" scope="col">
                        Status
                      </th>
                    )}
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Success
                    </th>
                    <th className="px-2 py-3 font-semibold" scope="col">
                      Runs
                    </th>
                    {onSort ? (
                      <SortableHeader
                        label="Updated"
                        field="updated"
                        activeSort={sort}
                        activeDirection={sortDirection}
                        onSort={onSort}
                      />
                    ) : (
                      <th className="px-2 py-3 font-semibold" scope="col">
                        Updated
                      </th>
                    )}
                    <th className="px-2 py-3 font-semibold" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((prompt, index) => {
                    const isSelected = selectedId === prompt.id;
                    return (
                      <tr
                        key={prompt.id}
                        ref={(el) => {
                          if (el) rowRefs.current.set(prompt.id, el);
                          else rowRefs.current.delete(prompt.id);
                        }}
                        tabIndex={0}
                        aria-current={isSelected ? "true" : undefined}
                        className={`cursor-pointer align-top transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 ${
                          isSelected ? "bg-violet-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => onSelect(prompt.id)}
                        onKeyDown={(e) => handleRowKeyDown(e, prompt, index)}
                      >
                        <td className="px-2 py-3 font-semibold text-slate-900">
                          <div className="flex min-w-0 gap-2">
                            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <div className="min-w-0">
                              <p className="break-words">{prompt.name}</p>
                              <p className="font-normal text-slate-400">{prompt.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-slate-600">
                          <p className="leading-5">{prompt.purpose}</p>
                        </td>
                        <td className="px-2 py-3">
                          <span className="block break-words rounded bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                            {prompt.category}
                          </span>
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-800">
                          v{prompt.versionNumber}
                        </td>
                        <td className="px-2 py-3 text-slate-700">
                          <p className="break-words">{prompt.ownerEmail}</p>
                        </td>
                        <td className="px-2 py-3 text-slate-700">{prompt.model}</td>
                        <td className="px-2 py-3">
                          <PipelineStatusBadge status={prompt.status} />
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-800">
                          {formatSuccess(prompt.successRate)}
                        </td>
                        <td className="px-2 py-3 text-slate-700">{prompt.runs.toLocaleString()}</td>
                        <td className="px-2 py-3 text-slate-600">
                          {formatUpdated(prompt.updatedAt)}
                        </td>
                        <td className="px-2 py-3">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" aria-hidden />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-slate-500">
              <span>
                Showing {from} to {to} of {total} pipeline{total === 1 ? "" : "s"}
              </span>
              {totalPages > 1 && onPageChange ? (
                <nav className="flex gap-2" aria-label="Pipeline table pagination">
                  <button
                    type="button"
                    className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
                    disabled={page <= 1}
                    aria-label="Previous page"
                    onClick={() => onPageChange(page - 1)}
                  >
                    Previous
                  </button>
                  <span aria-current="page">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    onClick={() => onPageChange(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
