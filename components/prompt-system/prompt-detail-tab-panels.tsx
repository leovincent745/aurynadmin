"use client";

import dynamic from "next/dynamic";
import { memo, Suspense, useEffect, useState } from "react";

import { PromptOverviewTab } from "@/components/prompt-system/prompt-overview-tab";
import { PromptOverviewTabSkeleton } from "@/components/prompt-system/prompt-overview-tab-skeleton";
import { PromptTabErrorBoundary } from "@/components/prompt-system/prompt-tab-error-boundary";
import { PromptTabPanelSkeleton } from "@/components/prompt-system/prompt-tab-panel-skeleton";
import type { PromptDetailTabSlug } from "@/lib/domain/prompt-detail-tabs";
import { tabSlugToLabel } from "@/lib/domain/prompt-detail-tabs";
import type { PromptDetailResponse } from "@/lib/domain/prompt-detail";
import type { InstructionRecord } from "@/lib/domain/admin-instructions";
import type { PromptPipelineIoResponse } from "@/lib/domain/prompt-pipeline-io";
import type { usePromptGovernance } from "@/lib/hooks/use-prompt-governance";
import type { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";

const LazyInputsTab = dynamic(
  () =>
    import("@/components/prompt-system/prompt-inputs-tab").then((m) => ({
      default: m.PromptInputsTab,
    })),
  { loading: () => <PromptTabPanelSkeleton lines={6} /> },
);

const LazyOutputsTab = dynamic(
  () =>
    import("@/components/prompt-system/prompt-outputs-tab").then((m) => ({
      default: m.PromptOutputsTab,
    })),
  { loading: () => <PromptTabPanelSkeleton lines={6} /> },
);

const LazyValidationTab = dynamic(
  () =>
    import("@/components/prompt-system/prompt-validation-tab").then((m) => ({
      default: m.PromptValidationTab,
    })),
  { loading: () => <PromptTabPanelSkeleton lines={8} /> },
);

const LazyHistoryTab = dynamic(
  () =>
    import("@/components/prompt-system/prompt-version-history-tab").then((m) => ({
      default: m.PromptVersionHistoryTab,
    })),
  { loading: () => <PromptTabPanelSkeleton lines={5} /> },
);

function PromptTextPanel({
  instruction,
  placeholders,
}: {
  instruction: InstructionRecord;
  placeholders: {
    master: string;
    guardrails: string;
    protocol: string;
  };
}) {
  const truncate = (text: string, max = 400) => {
    const t = text.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max)}…`;
  };

  const sections = [
    ["System Instruction", instruction.masterInstructions, placeholders.master],
    ["Company Guardrails", instruction.companyGuardrails, placeholders.guardrails],
    ["Product / Protocol Guidance", instruction.productProtocolRules, placeholders.protocol],
  ] as const;

  return (
    <div className="rounded-lg border bg-slate-50 p-4 text-xs">
      {sections.map(([label, value, hint]) => (
        <div key={label} className="mt-4 first:mt-0">
          <p className="font-semibold text-slate-700">{label}</p>
          {value.trim() ? (
            <p className="mt-2 whitespace-pre-wrap leading-5 text-slate-600">{truncate(value)}</p>
          ) : (
            <p className="mt-2 whitespace-pre-wrap leading-5 text-slate-400 italic">{hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export interface PromptDetailTabPanelsProps {
  activeSlug: PromptDetailTabSlug;
  detail: PromptDetailResponse;
  detailLoading?: boolean;
  pipelineIo: PromptPipelineIoResponse | null;
  ioLoading: boolean;
  ioError: string | null;
  onOutputValidationChange: (valid: boolean) => void;
  governanceHook: ReturnType<typeof usePromptGovernance>;
  canEditDraft: boolean;
  permissions: ReturnType<typeof usePromptPermissions>["permissions"];
  instructionPlaceholders: {
    master: string;
    guardrails: string;
    protocol: string;
  };
  onIoRetry: () => void;
  onGovernanceRetry: () => void;
}

export const PromptDetailTabPanels = memo(function PromptDetailTabPanels({
  activeSlug,
  detail,
  detailLoading = false,
  pipelineIo,
  ioLoading,
  ioError,
  onOutputValidationChange,
  governanceHook,
  canEditDraft,
  permissions,
  instructionPlaceholders,
  onIoRetry,
  onGovernanceRetry,
}: PromptDetailTabPanelsProps) {
  const { instruction } = detail;
  const [mounted, setMounted] = useState<Set<PromptDetailTabSlug>>(
    () => new Set([activeSlug]),
  );

  useEffect(() => {
    setMounted((prev) => {
      if (prev.has(activeSlug)) return prev;
      const next = new Set(prev);
      next.add(activeSlug);
      return next;
    });
  }, [activeSlug]);

  const slugs: PromptDetailTabSlug[] = [
    "overview",
    "prompt",
    "inputs",
    "outputs",
    "validation",
    "history",
  ];

  return (
    <>
      {slugs.map((slug) => {
        if (!mounted.has(slug)) return null;
        const isActive = activeSlug === slug;
        const tabLabel = tabSlugToLabel(slug);

        return (
          <div
            key={slug}
            id={`prompt-detail-panel-${slug}`}
            role="tabpanel"
            aria-labelledby={`prompt-detail-tab-${slug}`}
            hidden={!isActive}
            className={isActive ? "block" : "hidden"}
          >
            <PromptTabErrorBoundary
              tabLabel={tabLabel}
              onReset={
                slug === "inputs" || slug === "outputs"
                  ? onIoRetry
                  : slug === "validation"
                    ? onGovernanceRetry
                    : undefined
              }
            >
              <Suspense fallback={<PromptTabPanelSkeleton />}>
                {slug === "overview" ? (
                  detailLoading ? (
                    <PromptOverviewTabSkeleton />
                  ) : (
                    <PromptOverviewTab detail={detail} />
                  )
                ) : null}
                {slug === "prompt" ? (
                  <PromptTextPanel
                    instruction={instruction}
                    placeholders={instructionPlaceholders}
                  />
                ) : null}
                {slug === "inputs" ? (
                  <LazyInputsTab
                    section={pipelineIo?.inputs ?? null}
                    instructionId={detail.id}
                    loading={ioLoading}
                    error={ioError}
                    onRetry={onIoRetry}
                  />
                ) : null}
                {slug === "outputs" ? (
                  <LazyOutputsTab
                    section={pipelineIo?.outputs ?? null}
                    instructionId={detail.id}
                    versionNumber={detail.versionNumber}
                    loading={ioLoading}
                    error={ioError}
                    onRetry={onIoRetry}
                    onValidationChange={onOutputValidationChange}
                  />
                ) : null}
                {slug === "validation" ? (
                  <LazyValidationTab
                    canEditDraft={canEditDraft}
                    governanceHook={governanceHook}
                    permissions={permissions}
                    instructionUpdatedAt={instruction.updatedAt}
                  />
                ) : null}
                {slug === "history" ? (
                  <LazyHistoryTab
                    promptId={detail.id}
                    canRollback={permissions.canRollback}
                  />
                ) : null}
              </Suspense>
            </PromptTabErrorBoundary>
          </div>
        );
      })}
    </>
  );
});
