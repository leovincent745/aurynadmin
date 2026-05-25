"use client";

import { useCallback, useEffect, useState } from "react";
import { FlaskConical, X } from "lucide-react";

import { InstructionEditor } from "@/components/admin/instruction-editor";
import { PromptDetailTabBar } from "@/components/prompt-system/prompt-detail-tab-bar";
import { PromptDetailTabPanels } from "@/components/prompt-system/prompt-detail-tab-panels";
import {
  PromptOfflineBanner,
  PromptStateError,
} from "@/components/prompt-system/prompt-async-state";
import { PipelineStatusBadge } from "@/components/prompt-system/pipeline-status-badge";
import { PromptDetailsPreviewSkeleton } from "@/components/prompt-system/prompt-details-preview-skeleton";
import { PromptPreviewActionBar } from "@/components/prompt-system/prompt-preview-action-bar";
import { instructionFieldPlaceholders } from "@/lib/constants/default-instructions";
import type { PromptDetailTabSlug } from "@/lib/domain/prompt-detail-tabs";
import { PROMPT_DETAIL_TABS } from "@/lib/domain/prompt-detail-tabs";
import type { PromptPipelineIoResponse } from "@/lib/domain/prompt-pipeline-io";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import { usePromptDetailTab } from "@/lib/hooks/use-prompt-detail-tab";
import { usePromptSystemUrl } from "@/lib/hooks/use-prompt-system-url";
import {
  invalidatePromptDetailCache,
  usePromptDetail,
} from "@/lib/hooks/use-prompt-detail";
import { usePromptGovernance } from "@/lib/hooks/use-prompt-governance";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";
import { networkErrorMessage } from "@/lib/utils/network-error";
import { isValidationStale } from "@/lib/prompt-system/stale-validation";
import { validateChatOutputResponse } from "@/lib/validation/prompt-io-output";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PromptDetailsPreviewProps {
  selectedPipeline: PromptPipelineListItem | null;
  workingDraftId: string | null;
  focusEditRequest?: number;
  onInstructionSaved?: () => void;
  variant?: "panel" | "drawer";
  onClose?: () => void;
}

export function PromptDetailsPreview({
  selectedPipeline,
  workingDraftId,
  focusEditRequest = 0,
  onInstructionSaved,
  variant = "panel",
  onClose,
}: PromptDetailsPreviewProps) {
  const promptId = selectedPipeline?.id ?? null;
  const { detail, loading, error, retry, refresh } = usePromptDetail(promptId);
  const { activeSlug, setActiveTab, tabs } = usePromptDetailTab();
  const { panel, updateUrl } = usePromptSystemUrl();
  const [visitedTabs, setVisitedTabs] = useState<Set<PromptDetailTabSlug>>(
    () => new Set(["overview"]),
  );

  const [showEditor, setShowEditor] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [pipelineIo, setPipelineIo] = useState<PromptPipelineIoResponse | null>(null);
  const [ioLoading, setIoLoading] = useState(false);
  const [ioError, setIoError] = useState<string | null>(null);
  const [outputSchemaValid, setOutputSchemaValid] = useState(false);
  const [activationSnapshot, setActivationSnapshot] = useState<{
    allowed: boolean;
    blockReason: string | null;
  } | null>(null);

  const governanceEnabled = Boolean(promptId && visitedTabs.has("validation"));
  const governanceHook = usePromptGovernance(promptId, outputSchemaValid, {
    enabled: governanceEnabled,
  });
  const { permissions } = usePromptPermissions();
  const online = useOnlineStatus();

  const validationStale =
    detail?.instruction && governanceHook.governance?.latestRun
      ? isValidationStale(
          detail.instruction.updatedAt,
          governanceHook.governance.latestRun,
        )
      : false;

  const activationAllowed =
    (activationSnapshot?.allowed ??
      governanceHook.governance?.activationAllowed ??
      false) &&
    permissions.canActivate &&
    !validationStale;

  const activationBlockReason = !permissions.canActivate
    ? "You do not have permission to activate prompts."
    : validationStale
      ? "Draft changed after last validation — re-run the validation suite."
      : activationSnapshot?.blockReason ??
        governanceHook.governance?.activationBlockReason ??
        "Run validation and complete activation checks before publishing.";

  const canEditDraft =
    permissions.canEdit && selectedPipeline?.status === "In Review";
  const draftEditId =
    canEditDraft && promptId
      ? workingDraftId == null || workingDraftId === promptId
        ? promptId
        : null
      : null;
  const draftEditBlocked =
    canEditDraft &&
    Boolean(promptId && workingDraftId && workingDraftId !== promptId);
  const instruction = detail?.instruction ?? null;

  useEffect(() => {
    if (!selectedPipeline) return;
    if (panel === "edit" && draftEditId) {
      setActiveTab("prompt");
      setShowFullPrompt(false);
      setShowEditor(true);
      return;
    }
    if (panel === "full" && instruction) {
      setActiveTab("prompt");
      setShowEditor(false);
      setShowFullPrompt(true);
      return;
    }
    if (!panel) {
      setShowEditor(false);
      setShowFullPrompt(false);
    }
  }, [panel, selectedPipeline, draftEditId, instruction, setActiveTab]);

  const fetchPipelineIo = useCallback(async () => {
    if (!promptId) return;
    setIoLoading(true);
    setIoError(null);
    try {
      const res = await fetch(`/api/admin/prompt-pipelines/${promptId}/io`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as { io: PromptPipelineIoResponse };
      setPipelineIo(json.io);
    } catch {
      setPipelineIo(null);
      setIoError(networkErrorMessage("Could not load pipeline inputs/outputs."));
    } finally {
      setIoLoading(false);
    }
  }, [promptId]);

  const fetchActivationSnapshot = useCallback(async () => {
    if (!promptId) return;
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}/activation`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        activation: { allowed: boolean; blockReason: string | null };
      };
      setActivationSnapshot(json.activation);
    } catch {
      setActivationSnapshot(null);
    }
  }, [promptId]);

  useEffect(() => {
    setVisitedTabs((prev) => {
      const next = new Set(prev);
      next.add(activeSlug);
      return next;
    });
  }, [activeSlug]);

  useEffect(() => {
    setShowEditor(false);
    setShowFullPrompt(false);
    setPipelineIo(null);
    setIoError(null);
    setOutputSchemaValid(false);
    setActivationSnapshot(null);
    setVisitedTabs(new Set(["overview"]));
  }, [promptId]);

  useEffect(() => {
    if (!promptId) return;
    void fetchActivationSnapshot();
  }, [promptId, outputSchemaValid, fetchActivationSnapshot]);

  useEffect(() => {
    if (!pipelineIo?.outputs || !detail) {
      setOutputSchemaValid(false);
      return;
    }
    const result = validateChatOutputResponse(
      pipelineIo.outputs.fields,
      pipelineIo.outputs.exampleJson,
      {
        instructionVersionId: pipelineIo.outputs.instructionVersionId,
        versionNumber: detail.versionNumber,
      },
    );
    setOutputSchemaValid(result.valid);
  }, [pipelineIo, detail]);

  useEffect(() => {
    if (!promptId) return;
    const def = PROMPT_DETAIL_TABS.find((t) => t.slug === activeSlug);
    if (!def?.requiresIo) return;
    if (pipelineIo && !ioError) return;
    void fetchPipelineIo();
  }, [promptId, activeSlug, pipelineIo, ioError, fetchPipelineIo]);

  useEffect(() => {
    if (!focusEditRequest || !selectedPipeline || !draftEditId) return;
    setActiveTab("prompt");
    setShowFullPrompt(false);
    setShowEditor(true);
  }, [focusEditRequest, draftEditId, selectedPipeline, setActiveTab]);

  const clearPanelMode = useCallback(() => {
    updateUrl({ panel: null }, { history: "replace" });
  }, [updateUrl]);

  const openEditPrompt = useCallback(() => {
    updateUrl({ tab: "prompt", panel: "edit" });
  }, [updateUrl]);

  const openViewFullPrompt = useCallback(() => {
    updateUrl({ tab: "prompt", panel: "full" });
  }, [updateUrl]);

  if (!selectedPipeline) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center text-sm text-slate-500">
          Select a pipeline row to view details and configuration.
        </CardContent>
      </Card>
    );
  }

  const cardClassName =
    variant === "drawer"
      ? "rounded-t-2xl border-0 bg-white shadow-none"
      : "bg-white";

  return (
    <Card className={cardClassName}>
      <CardHeader className="border-b p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base text-slate-950">Prompt Details Preview</CardTitle>
            <p className="text-xs text-slate-500">
              {variant === "drawer"
                ? "Swipe-friendly detail view"
                : "Updates when you select a pipeline row — no page reload."}
            </p>
          </div>
          {variant === "drawer" && onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Close details"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
        <PromptDetailTabBar
          tabs={tabs}
          activeSlug={activeSlug}
          onSelect={setActiveTab}
        />
      </CardHeader>
      <CardContent className="space-y-5 p-4 xl:p-5">
        {!online ? (
          <PromptOfflineBanner
            onRetry={() => {
              retry();
              void fetchPipelineIo();
              void governanceHook.refresh();
            }}
          />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">
                {detail?.name ?? selectedPipeline.name}
              </h2>
              <p className="text-xs text-slate-500">
                {detail?.code ?? selectedPipeline.code}
              </p>
            </div>
          </div>
          <PipelineStatusBadge status={detail?.status ?? selectedPipeline.status} />
        </div>

        {error ? (
          <PromptStateError message={error} onRetry={retry} />
        ) : loading && !detail ? (
          <PromptDetailsPreviewSkeleton />
        ) : showFullPrompt && instruction ? (
          <FullPromptView
            instruction={instruction}
            onClose={() => {
              setShowFullPrompt(false);
              clearPanelMode();
            }}
          />
        ) : draftEditBlocked ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            The working draft differs from this row. Open the current in-review draft from the
            library or create a new prompt.
          </div>
        ) : showEditor && draftEditId && activeSlug === "prompt" ? (
          <div className="max-h-[420px] overflow-y-auto rounded-lg border">
            <InstructionEditor
              embedded
              instructionId={draftEditId}
              canEdit={permissions.canEdit}
              canActivate={permissions.canActivate}
              publishDisabled={!activationAllowed}
              publishBlockReason={activationBlockReason}
              onSaved={() => {
                if (promptId) invalidatePromptDetailCache(promptId);
                refresh();
                void fetchActivationSnapshot();
                onInstructionSaved?.();
              }}
            />
          </div>
        ) : detail ? (
          <PromptDetailTabPanels
            activeSlug={activeSlug}
            detail={detail}
            detailLoading={loading}
            pipelineIo={pipelineIo}
            ioLoading={ioLoading}
            ioError={ioError}
            onOutputValidationChange={(valid) => {
              setOutputSchemaValid(valid);
              void fetchActivationSnapshot();
            }}
            governanceHook={governanceHook}
            canEditDraft={canEditDraft}
            permissions={permissions}
            instructionPlaceholders={{
              master: instructionFieldPlaceholders.masterInstructions,
              guardrails: instructionFieldPlaceholders.companyGuardrails,
              protocol: instructionFieldPlaceholders.productProtocolRules,
            }}
            onIoRetry={() => void fetchPipelineIo()}
            onGovernanceRetry={() => void governanceHook.refresh()}
          />
        ) : (
          <p className="text-xs text-slate-500">Prompt details unavailable.</p>
        )}

        <PromptPreviewActionBar
          selectedPipeline={selectedPipeline}
          canEdit={Boolean(draftEditId && permissions.canEdit)}
          canViewFull={Boolean(instruction)}
          onEditPrompt={openEditPrompt}
          onViewFullPrompt={openViewFullPrompt}
        />
      </CardContent>
    </Card>
  );
}

function FullPromptView({
  instruction,
  onClose,
}: {
  instruction: import("@/lib/domain/admin-instructions").InstructionRecord;
  onClose: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-slate-50 p-4 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-800">
          Full prompt · v{instruction.versionNumber} ({instruction.status})
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      {(
        [
          ["Auryn Master Instructions", instruction.masterInstructions],
          ["Company Guardrails", instruction.companyGuardrails],
          ["Product / Protocol Rules", instruction.productProtocolRules],
        ] as const
      ).map(([label, value]) => (
        <div key={label}>
          <p className="font-semibold text-slate-700">{label}</p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded border bg-white p-3 font-mono text-[11px] leading-5 text-slate-700">
            {value.trim() || instructionFieldPlaceholders.masterInstructions}
          </pre>
        </div>
      ))}
    </div>
  );
}
