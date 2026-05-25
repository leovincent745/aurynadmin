"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Play, ShieldCheck } from "lucide-react";

import {
  PromptOfflineBanner,
  PromptStateValidationFailed,
} from "@/components/prompt-system/prompt-async-state";
import { PromptTabPanelSkeleton } from "@/components/prompt-system/prompt-tab-panel-skeleton";
import { ActivationChecklist } from "@/components/prompt-system/activation-checklist";
import { ValidationRuleGroup } from "@/components/prompt-system/validation-rule-group";
import { ValidationRunStatus } from "@/components/prompt-system/validation-run-status";
import { Button } from "@/components/ui/button";
import type { ValidationRuleCategory } from "@/lib/domain/prompt-validation";
import type { usePromptGovernance } from "@/lib/hooks/use-prompt-governance";
import type { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { isValidationStale } from "@/lib/prompt-system/stale-validation";

/** Step 1 — safety and publish readiness only (no physician/reviewer governance UI). */
const STEP1_VALIDATION_CATEGORIES: ValidationRuleCategory[] = [
  "input_validation",
  "output_schema",
  "safety",
  "business_rules",
  "test_cases",
];

type GovernanceHook = ReturnType<typeof usePromptGovernance>;

export function PromptValidationTab({
  canEditDraft,
  governanceHook,
  permissions,
  instructionUpdatedAt,
}: {
  canEditDraft: boolean;
  governanceHook: GovernanceHook;
  permissions: ReturnType<typeof usePromptPermissions>["permissions"];
  instructionUpdatedAt?: string;
}) {
  const {
    governance,
    loading,
    error,
    actionLoading,
    polling,
    runValidation,
    cancelRun,
    addComment,
    refresh,
  } = governanceHook;

  const [commentText, setCommentText] = useState("");

  const latestRun = governance?.latestRun ?? null;
  const rules = useMemo(() => latestRun?.rules ?? [], [latestRun?.rules]);
  const activationChecks = governance?.activationChecks ?? [];
  const adminTestPassCount = governance?.adminTestPassCount ?? 0;
  const validationStale =
    instructionUpdatedAt && latestRun
      ? isValidationStale(instructionUpdatedAt, latestRun)
      : false;

  const passedCount = useMemo(
    () => rules.filter((r) => r.status === "passed").length,
    [rules],
  );

  const online = useOnlineStatus();

  if (!online && !governance) {
    return <PromptOfflineBanner onRetry={() => void refresh()} />;
  }

  if (loading && !governance) {
    return (
      <div aria-busy="true" aria-label="Loading validation state">
        <PromptTabPanelSkeleton lines={8} />
      </div>
    );
  }

  const runFailed = latestRun?.status === "failed";

  return (
    <div className="space-y-4 text-xs">
      <div
        className={`rounded-lg border p-3 ${
          governance?.activationAllowed
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-violet-700" />
          <p className="font-semibold text-slate-800">Activation gate</p>
          {latestRun ? <ValidationRunStatus status={latestRun.status} /> : null}
          {polling ? (
            <span className="text-[10px] text-blue-700">Polling status…</span>
          ) : null}
        </div>
        <p className="mt-2 text-slate-600">
          {governance?.activationAllowed
            ? "All activation requirements passed. Publish Live is allowed."
            : governance?.activationBlockReason ??
              "Complete all activation requirements before publishing."}
        </p>
        {activationChecks.length > 0 ? (
          <div className="mt-3">
            <ActivationChecklist checks={activationChecks} />
          </div>
        ) : null}
        <p className="mt-2 text-[10px] text-slate-500">
          Admin test passes: {adminTestPassCount}
        </p>
      </div>

      {!online ? (
        <PromptOfflineBanner onRetry={() => void refresh()} />
      ) : null}

      {runFailed ? (
        <PromptStateValidationFailed
          message={`Validation run did not pass (${passedCount}/${rules.length} rules). Review failed checks below and re-run.`}
          onRetry={() => void runValidation()}
        />
      ) : null}

      {validationStale ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900" role="status">
          Draft was edited after the last validation run. Re-run the validation suite before
          publishing.
        </p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => void refresh()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-violet-600 hover:bg-violet-700"
          disabled={actionLoading || polling || !permissions.canRunValidation}
          onClick={() => void runValidation()}
        >
          <Play className="mr-1 h-3.5 w-3.5" />
          {actionLoading ? "Running…" : "Run validation suite"}
        </Button>
        {latestRun && (latestRun.status === "queued" || latestRun.status === "running") ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actionLoading || !permissions.canRunValidation}
            onClick={() => void cancelRun()}
          >
            Cancel run
          </Button>
        ) : null}
      </div>

      {latestRun ? (
        <div className="rounded-lg border bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">
            Latest run · {new Date(latestRun.createdAt).toLocaleString()}
          </p>
          <p className="mt-1 text-slate-600">
            {passedCount}/{rules.length} rules passed · by {latestRun.createdByEmail}
          </p>
        </div>
      ) : (
        <p className="text-slate-500">No validation runs yet for this version.</p>
      )}

      {rules.length > 0 ? (
        <div className="space-y-3">
          {STEP1_VALIDATION_CATEGORIES.map((cat) => (
            <ValidationRuleGroup key={cat} category={cat} rules={rules} />
          ))}
        </div>
      ) : null}

      <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-slate-600">
        Multi-reviewer and physician governance workflows are planned for a future release.
        Step 1 uses the activation gate and safety rules above before Publish Live.
      </p>

      {latestRun ? (
        <div className="rounded-lg border p-3">
          <p className="mb-2 flex items-center gap-1 font-semibold text-slate-800">
            <MessageSquare className="h-3.5 w-3.5" />
            Comments
          </p>
          {latestRun.comments.length ? (
            <ul className="mb-2 max-h-32 space-y-2 overflow-y-auto">
              {latestRun.comments.map((c) => (
                <li key={c.id} className="rounded bg-slate-50 p-2">
                  <p className="text-[10px] font-semibold text-slate-500">
                    {c.authorEmail} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-slate-700">{c.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-2 text-slate-500">No comments on this run.</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                !commentText.trim() || actionLoading || !permissions.canRunValidation
              }
              onClick={() => {
                void addComment(latestRun.id, commentText);
                setCommentText("");
              }}
            >
              Post
            </Button>
          </div>
        </div>
      ) : null}

      {governance?.history && governance.history.length > 1 ? (
        <div>
          <p className="mb-2 font-semibold text-slate-600">Run history</p>
          <ul className="max-h-28 space-y-1 overflow-y-auto">
            {governance.history.slice(1, 8).map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between rounded border bg-white px-2 py-1.5"
              >
                <span className="text-slate-600">
                  {new Date(run.createdAt).toLocaleString()}
                </span>
                <ValidationRunStatus status={run.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
