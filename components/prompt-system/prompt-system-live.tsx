"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PromptDetailsPreview } from "@/components/prompt-system/prompt-details-preview";
import { PromptDetailsPreviewSkeleton } from "@/components/prompt-system/prompt-details-preview-skeleton";
import { PromptMetricCards } from "@/components/prompt-system/prompt-metric-cards";
import { PromptPipelinesTable } from "@/components/prompt-system/prompt-pipelines-table";
import { PromptSystemDashboardHeader } from "@/components/prompt-system/prompt-system-dashboard-header";
import { PromptSystemHubLinks } from "@/components/prompt-system/prompt-system-hub-links";
import {
  PromptOfflineBanner,
  PromptStateError,
} from "@/components/prompt-system/prompt-async-state";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";
import { usePromptPipelinesTable } from "@/lib/hooks/use-prompt-pipelines-table";
import { useSelectedPipelineItem } from "@/lib/hooks/use-selected-pipeline-item";
import type { CurrentDraftResponse } from "@/lib/domain/admin-instructions";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import type {
  PipelineHealthResponse,
  PipelinePerformanceResponse,
} from "@/lib/domain/prompt-performance";
import type {
  PromptSummaryStatusFilter,
  PromptSystemSummary,
} from "@/lib/domain/prompt-system-summary";
import { usePromptSystemUrl } from "@/lib/hooks/use-prompt-system-url";
import {
  patchForPipelineRowAction,
  testChatHrefForPipeline,
  type PromptPipelineRowAction,
} from "@/lib/prompt-system/row-actions";

import {
  ExecutionFlow,
  HealthPanel,
  PerformancePanel,
} from "@/components/prompt-system/prompt-system-deck-panels";

export function PromptSystemLive() {
  const router = useRouter();
  const { updateUrl } = usePromptSystemUrl();
  const table = usePromptPipelinesTable();
  const online = useOnlineStatus();
  const { permissions, isReadOnly } = usePromptPermissions();
  const [summary, setSummary] = useState<PromptSystemSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<CurrentDraftResponse | null>(null);
  const [creatingPrompt, setCreatingPrompt] = useState(false);
  const [focusEditRequest, setFocusEditRequest] = useState(0);
  const [performance, setPerformance] = useState<PipelinePerformanceResponse | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [health, setHealth] = useState<PipelineHealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
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

  const loadMonitoring = useCallback(async (filter: PromptSummaryStatusFilter) => {
    setPerformanceLoading(true);
    setHealthLoading(true);
    setPerformanceError(null);
    try {
      const [perfRes, healthRes] = await Promise.all([
        fetch("/api/admin/prompts/performance?limit=12", { credentials: "include" }),
        fetch(`/api/admin/prompts/health?status=${encodeURIComponent(filter)}`, {
          credentials: "include",
        }),
      ]);
      if (!perfRes.ok) throw new Error("performance");
      if (!healthRes.ok) throw new Error("health");
      setPerformance((await perfRes.json()) as PipelinePerformanceResponse);
      setHealth((await healthRes.json()) as PipelineHealthResponse);
    } catch {
      setPerformance(null);
      setHealth(null);
      setPerformanceError("Could not load performance or health data.");
    } finally {
      setPerformanceLoading(false);
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary(table.statusFilter);
    void loadMonitoring(table.statusFilter);
  }, [loadSummary, loadMonitoring, table.statusFilter]);

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
      await loadMonitoring("all");
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

  const handleRowAction = useCallback(
    (action: PromptPipelineRowAction, prompt: PromptPipelineListItem) => {
      if (action === "run-test") {
        router.push(testChatHrefForPipeline(prompt));
        return;
      }
      updateUrl(patchForPipelineRowAction(action, prompt));
      if (action !== "view-history") {
        pipelinesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router, updateUrl],
  );

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
            void loadMonitoring(table.statusFilter);
          }}
        />
      ) : null}

      {isReadOnly ? (
        <div
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          role="status"
        >
          Read-only access — you can browse prompts and validation history but cannot create,
          edit, validate, approve, activate, or roll back versions.
        </div>
      ) : null}

      <PromptSystemDashboardHeader
        summaryLoading={summaryLoading}
        engineStatus={engineStatus}
        engineDetail={engineDetail}
        creatingPrompt={creatingPrompt}
        canCreate={permissions.canCreate}
        onPromptLibrary={scrollToPromptLibrary}
        onNewPrompt={() => void handleNewPrompt()}
      />

      <PromptMetricCards
        summary={summary}
        loading={summaryLoading}
        error={summaryError}
        onRetry={() => {
          void loadSummary(table.statusFilter);
          void loadMonitoring(table.statusFilter);
        }}
      />

      <PromptSystemHubLinks />

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
          searchInput={table.searchInput}
          onRowAction={handleRowAction}
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
                void loadMonitoring(table.statusFilter);
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
                void loadMonitoring(table.statusFilter);
                table.refresh();
              }}
            />
          </div>
        </>
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-2">
        <PerformancePanel
          data={performance}
          loading={performanceLoading}
          error={performanceError}
        />
        <HealthPanel health={health} loading={healthLoading} />
      </div>

      <ExecutionFlow selectedPipelineId={selectedPipeline?.id ?? null} />
    </div>
  );
}
