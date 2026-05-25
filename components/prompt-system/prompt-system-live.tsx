"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Plus } from "lucide-react";

import { PromptDetailsPreview } from "@/components/prompt-system/prompt-details-preview";
import { PromptDetailsPreviewSkeleton } from "@/components/prompt-system/prompt-details-preview-skeleton";
import { PromptMetricCards } from "@/components/prompt-system/prompt-metric-cards";
import { PromptPipelinesTable } from "@/components/prompt-system/prompt-pipelines-table";
import { Button } from "@/components/ui/button";
import {
  PromptOfflineBanner,
  PromptStateError,
} from "@/components/prompt-system/prompt-async-state";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";
import { usePromptPipelinesTable } from "@/lib/hooks/use-prompt-pipelines-table";
import { useSelectedPipelineItem } from "@/lib/hooks/use-selected-pipeline-item";
import type { CurrentDraftResponse } from "@/lib/domain/admin-instructions";
import type {
  EngineStatus,
  PromptSummaryStatusFilter,
  PromptSystemSummary,
} from "@/lib/domain/prompt-system-summary";

import {
  ExecutionFlow,
  HealthPanel,
  PerformancePanel,
} from "@/components/prompt-system/prompt-system-deck-panels";

const engineStatusClasses: Record<EngineStatus, string> = {
  healthy: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  degraded: "bg-orange-50 text-orange-800",
  offline: "bg-red-50 text-red-800",
};

const engineStatusLabels: Record<EngineStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  degraded: "Degraded",
  offline: "Offline",
};

export function PromptSystemLive() {
  const table = usePromptPipelinesTable();
  const online = useOnlineStatus();
  const { permissions, isReadOnly } = usePromptPermissions();
  const [summary, setSummary] = useState<PromptSystemSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<CurrentDraftResponse | null>(null);
  const [creatingPrompt, setCreatingPrompt] = useState(false);
  const [focusEditRequest, setFocusEditRequest] = useState(0);
  const pipelinesRef = useRef<HTMLDivElement>(null);

  const loadSummary = useCallback(async (filter: PromptSummaryStatusFilter) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch(
        `/api/admin/prompts/summary?status=${encodeURIComponent(filter)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load KPI summary");
      setSummary((await res.json()) as PromptSystemSummary);
    } catch {
      setSummary(null);
      setSummaryError("Could not load KPI summary. Check your connection and try again.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary(table.statusFilter);
  }, [loadSummary, table.statusFilter]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/instructions/current-draft", {
        credentials: "include",
      });
      if (res.ok) {
        setDraftData((await res.json()) as CurrentDraftResponse);
      }
    })();
  }, []);

  const handleStatusFilter = (filter: PromptSummaryStatusFilter) => {
    table.setStatusFilter(filter);
  };

  const handleNewPrompt = async () => {
    setCreatingPrompt(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create prompt");
      const json = (await res.json()) as { draft?: { id: string }; prompt?: { id: string } };
      const draft = json.draft ?? json.prompt;
      if (!draft?.id) throw new Error("Failed to create prompt");
      table.setStatusFilter("all");
      table.setPage(1);
      table.selectRow(draft.id);
      table.refresh();
      await loadSummary("all");
      const draftRes = await fetch("/api/admin/instructions/current-draft", {
        credentials: "include",
      });
      if (draftRes.ok) {
        setDraftData((await draftRes.json()) as CurrentDraftResponse);
      }
      setFocusEditRequest((n) => n + 1);
      pipelinesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      window.alert("Could not create a new prompt. Please try again.");
    } finally {
      setCreatingPrompt(false);
    }
  };

  const scrollToPromptLibrary = () => {
    pipelinesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const {
    item: selectedPipeline,
    loading: selectedLoading,
    error: selectedError,
  } = useSelectedPipelineItem(table.selectedId, table.data?.items ?? []);

  const engineStatus = summary?.engineStatus ?? null;
  const engineDetail = summary?.engineStatusDetail ?? null;

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      {!online ? (
        <PromptOfflineBanner
          onRetry={() => {
            table.retry();
            void loadSummary(table.statusFilter);
          }}
        />
      ) : null}

      {isReadOnly ? (
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          role="status"
        >
          Read-only access - you can browse prompts and validation history but cannot create,
          edit, validate, approve, activate, or roll back versions.
        </div>
      ) : null}

      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Prompt System
          </h1>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
            Manage and govern the AI prompts that power pathway generation, optimization, and
            system learning.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
          <span
            className={`col-span-2 rounded-md px-3 py-2 text-center text-xs font-semibold sm:col-span-1 ${
              summaryLoading
                ? "bg-slate-100 text-slate-500"
                : engineStatus
                  ? engineStatusClasses[engineStatus]
                  : "bg-amber-50 text-amber-800"
            }`}
            title={engineDetail ?? undefined}
          >
            {summaryLoading
              ? "AI Engine Status: ..."
              : engineStatus
                ? `AI Engine Status: ${engineStatusLabels[engineStatus]}`
                : "AI Engine Status: Unknown"}
          </span>
          <Button
            type="button"
            variant="outline"
            className="gap-2 px-3"
            onClick={scrollToPromptLibrary}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Library</span>
            <span className="sm:hidden">Library</span>
          </Button>
          <Button
            type="button"
            className="gap-2 bg-violet-600 px-3 hover:bg-violet-700"
            disabled={creatingPrompt || !permissions.canCreate}
            title={
              !permissions.canCreate ? "You do not have permission to create prompts" : undefined
            }
            onClick={() => void handleNewPrompt()}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {creatingPrompt ? "Creating..." : "New Prompt"}
            </span>
            <span className="sm:hidden">{creatingPrompt ? "..." : "New"}</span>
          </Button>
        </div>
      </header>

      <PromptMetricCards
        summary={summary}
        loading={summaryLoading}
        error={summaryError}
        onRetry={() => void loadSummary(table.statusFilter)}
      />

      <div
        ref={pipelinesRef}
        className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]"
      >
        <PromptPipelinesTable
          items={table.data?.items ?? []}
          selectedId={table.selectedId}
          onSelect={table.selectRow}
          page={table.data?.page ?? table.page}
          total={table.data?.total ?? 0}
          totalPages={table.data?.totalPages ?? 1}
          limit={table.data?.limit ?? 20}
          loading={table.loading}
          error={table.error}
          onPageChange={table.setPage}
          onRetry={table.retry}
          filterOptions={table.filterOptions}
          filterOptionsLoading={table.filterOptionsLoading}
          statusFilter={table.statusFilter}
          onStatusFilterChange={handleStatusFilter}
          categoryFilter={table.categoryFilter}
          onCategoryFilterChange={table.setCategoryFilter}
          ownerFilter={table.ownerFilter}
          onOwnerFilterChange={table.setOwnerFilter}
          modelFilter={table.modelFilter}
          onModelFilterChange={table.setModelFilter}
          searchInput={table.searchInput}
          onSearchChange={table.setSearchInput}
          activeChips={table.activeChips}
          onRemoveChip={table.removeFilterChip}
          hasFilters={table.hasFilters}
          sort={table.sort}
          sortDirection={table.sortDirection}
          onSort={table.toggleSort}
          onClearFilters={table.clearFilters}
        />
        <div className="hidden min-w-0 lg:block">
          {selectedError && table.selectedId ? (
            <PromptStateError
              title="Could not load selected prompt"
              message={selectedError}
              onRetry={table.retry}
            />
          ) : selectedLoading && table.selectedId ? (
            <PromptDetailsPreviewSkeleton />
          ) : (
            <PromptDetailsPreview
              selectedPipeline={selectedPipeline}
              workingDraftId={draftData?.draft?.id ?? null}
              focusEditRequest={focusEditRequest}
              variant="panel"
              onInstructionSaved={() => {
                void loadSummary(table.statusFilter);
                table.refresh();
              }}
            />
          )}
        </div>
      </div>

      {selectedPipeline && table.selectedId ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close prompt details"
            onClick={table.clearSelection}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto lg:hidden">
            <PromptDetailsPreview
              selectedPipeline={selectedPipeline}
              workingDraftId={draftData?.draft?.id ?? null}
              focusEditRequest={focusEditRequest}
              variant="drawer"
              onClose={table.clearSelection}
              onInstructionSaved={() => {
                void loadSummary(table.statusFilter);
                table.refresh();
              }}
            />
          </div>
        </>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.55fr)]">
        <ExecutionFlow />
        <PerformancePanel />
        <HealthPanel />
      </div>
    </div>
  );
}
