"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromptPipelineFilterOptions } from "@/lib/domain/prompt-pipeline-filters";
import type { ActivePromptFilterChip } from "@/lib/domain/prompt-pipeline-filters";
import type { PromptSummaryStatusFilter } from "@/lib/domain/prompt-system-summary";

export interface PromptPipelineFiltersBarProps {
  filterOptions: PromptPipelineFilterOptions | null;
  optionsLoading?: boolean;
  statusFilter: PromptSummaryStatusFilter;
  categoryFilter: string;
  ownerFilter: string;
  modelFilter: string;
  searchInput: string;
  activeChips: ActivePromptFilterChip[];
  onStatusChange: (value: PromptSummaryStatusFilter) => void;
  onCategoryChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRemoveChip: (key: ActivePromptFilterChip["key"]) => void;
  onClearAll: () => void;
}

export function PromptPipelineFiltersBar({
  filterOptions,
  optionsLoading,
  statusFilter,
  categoryFilter,
  ownerFilter,
  modelFilter,
  searchInput,
  activeChips,
  onStatusChange,
  onCategoryChange,
  onOwnerChange,
  onModelChange,
  onSearchChange,
  onRemoveChip,
  onClearAll,
}: PromptPipelineFiltersBarProps) {
  const statuses = filterOptions?.statuses ?? [];
  const categories = filterOptions?.categories ?? [];
  const owners = filterOptions?.owners ?? [];
  const models = filterOptions?.models ?? [];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <label className="sr-only" htmlFor="pipeline-status-filter">
          Filter by status
        </label>
        <select
          id="pipeline-status-filter"
          className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600"
          value={statusFilter}
          disabled={optionsLoading}
          onChange={(e) => onStatusChange(e.target.value as PromptSummaryStatusFilter)}
        >
          {statuses.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pipeline-category-filter">
          Filter by category
        </label>
        <select
          id="pipeline-category-filter"
          className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600"
          value={categoryFilter}
          disabled={optionsLoading}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pipeline-owner-filter">
          Filter by owner
        </label>
        <select
          id="pipeline-owner-filter"
          className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600 lg:max-w-[200px]"
          value={ownerFilter}
          disabled={optionsLoading}
          onChange={(e) => onOwnerChange(e.target.value)}
        >
          {owners.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pipeline-model-filter">
          Filter by model
        </label>
        <select
          id="pipeline-model-filter"
          className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600"
          value={modelFilter}
          disabled={optionsLoading}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {models.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="pipeline-search">
          Search prompts
        </label>
        <div className="relative sm:col-span-2 lg:min-w-[12rem] lg:flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            id="pipeline-search"
            className="h-9 w-full rounded-md border pl-8 pr-3 text-xs"
            placeholder="Name, ID, owner, category…"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">Active filters:</span>
          {activeChips.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-800 hover:bg-violet-100"
              onClick={() => onRemoveChip(chip.key)}
              aria-label={`Remove ${chip.label} filter ${chip.value}`}
            >
              <span>
                {chip.label}: {chip.value}
              </span>
              <X className="h-3 w-3" aria-hidden />
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] text-slate-600"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
