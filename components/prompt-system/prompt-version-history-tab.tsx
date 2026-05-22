"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  CheckCircle2,
  CircleDot,
  History,
  Lock,
  RotateCcw,
  Shield,
  Upload,
  User,
} from "lucide-react";

import { PromptAsyncState } from "@/components/prompt-system/prompt-async-state";
import { Button } from "@/components/ui/button";
import {
  AUDIT_EVENT_LABELS,
  type PromptAuditEventDto,
  type PromptHistoryResponse,
  type PromptVersionTimelineEntry,
} from "@/lib/domain/prompt-history";
import { ValidationRunStatus } from "@/components/prompt-system/validation-run-status";
import type { PromptValidationRunStatus } from "@/lib/domain/prompt-validation";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AuditEventIcon({ type }: { type: PromptAuditEventDto["eventType"] }) {
  switch (type) {
    case "published":
    case "activated":
      return <Upload className="h-3.5 w-3.5 text-emerald-600" />;
    case "archived":
      return <Archive className="h-3.5 w-3.5 text-slate-500" />;
    case "rollback":
      return <RotateCcw className="h-3.5 w-3.5 text-amber-600" />;
    case "validation_run":
      return <Shield className="h-3.5 w-3.5 text-violet-600" />;
    case "review_submitted":
    case "review_decided":
      return <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />;
    default:
      return <CircleDot className="h-3.5 w-3.5 text-slate-500" />;
  }
}

function TimelineVersionCard({
  entry,
  canRollback,
  onRollback,
  rollbackLoading,
}: {
  entry: PromptVersionTimelineEntry;
  canRollback: boolean;
  onRollback: (id: string) => void;
  rollbackLoading: boolean;
}) {
  const statusStyles: Record<string, string> = {
    draft: "bg-violet-100 text-violet-800",
    published: "bg-emerald-100 text-emerald-800",
    archived: "bg-slate-100 text-slate-700",
  };

  return (
    <div
      className={`relative border-l-2 pl-4 pb-6 ${
        entry.isSelected ? "border-violet-500" : "border-slate-200"
      }`}
    >
      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-violet-500" />
      <div className="rounded-lg border bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-900">
              v{entry.versionNumber}
              {entry.isSelected ? (
                <span className="ml-2 text-[10px] font-normal text-violet-600">
                  (selected)
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-500">{entry.instructionId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyles[entry.status] ?? "bg-slate-100"}`}
            >
              {entry.status}
            </span>
            {entry.immutable ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <Lock className="h-3 w-3" />
                Immutable
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1 text-slate-600">
          <User className="h-3 w-3" />
          {entry.createdByEmail} · created {formatDateTime(entry.createdAt)}
          {entry.publishedAt ? ` · published ${formatDateTime(entry.publishedAt)}` : ""}
        </p>

        {entry.auditEvents.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Audit trail
            </p>
            <ul className="mt-1 space-y-1.5">
              {entry.auditEvents.slice(0, 8).map((ev) => (
                <li key={ev.id} className="flex gap-2 text-[11px] text-slate-700">
                  <AuditEventIcon type={ev.eventType} />
                  <span>
                    <span className="font-semibold">{AUDIT_EVENT_LABELS[ev.eventType]}</span>
                    {" · "}
                    {ev.actorEmail} · {formatDateTime(ev.createdAt)}
                    {ev.metadata.synthetic ? (
                      <span className="text-slate-400"> (inferred)</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.validationEvidence.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Validation evidence
            </p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {entry.validationEvidence.slice(0, 4).map((v) => (
                <li
                  key={v.runId}
                  className="flex items-center gap-1 rounded border bg-slate-50 px-2 py-1"
                >
                  <ValidationRunStatus status={v.status as PromptValidationRunStatus} />
                  <span className="text-[10px] text-slate-600">
                    {v.overallPassed ? "pass" : "fail"} · {v.createdByEmail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.reviewerHistory.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reviewer history
            </p>
            <ul className="mt-1 space-y-1 text-[11px] text-slate-700">
              {entry.reviewerHistory.map((r) => (
                <li key={r.reviewId}>
                  {r.status} · {r.submittedByEmail}
                  {r.reviewerEmail ? ` → ${r.reviewerEmail}` : ""}
                  {r.decidedAt ? ` · ${formatDateTime(r.decidedAt)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {canRollback && entry.instructionId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            disabled={rollbackLoading}
            onClick={() => onRollback(entry.instructionId)}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Rollback to draft
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function PromptVersionHistoryTab({
  promptId,
  canRollback,
}: {
  promptId: string;
  canRollback: boolean;
}) {
  const [history, setHistory] = useState<PromptHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompts/${promptId}/history`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as { history: PromptHistoryResponse };
      setHistory(json.history);
    } catch {
      setError("Could not load version history.");
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRollback = async (sourceId: string) => {
    if (
      !window.confirm(
        "Copy this version into the working draft? Published/archived rows stay immutable.",
      )
    ) {
      return;
    }
    setRollbackLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/prompts/${sourceId}/rollback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rollbackReason || undefined }),
      });
      const json = (await res.json()) as { message?: string; rollback?: { draftId: string } };
      if (!res.ok) throw new Error(json.message ?? "Rollback failed");
      setMessage(`Restored to working draft (${json.rollback?.draftId ?? "updated"}).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rollback failed");
    } finally {
      setRollbackLoading(false);
    }
  };

  if (!history) {
    return (
      <PromptAsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        skeletonLines={5}
        loadingLabel="Loading version history"
      >
        <span className="sr-only">Placeholder</span>
      </PromptAsyncState>
    );
  }

  return (
    <PromptAsyncState
      loading={false}
      error={error}
      onRetry={() => void load()}
      empty={history.timeline.length === 0}
      emptyTitle="No version history"
      emptyDescription="Audit events and version records will appear after saves, validation, and publishes."
      skeletonLines={5}
      loadingLabel="Loading version history"
    >
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-2 rounded-lg border bg-slate-50 p-3">
        <History className="h-4 w-4 text-violet-600" />
        <div>
          <p className="font-semibold text-slate-800">{history.pipelineName}</p>
          <p className="text-slate-600">
            {history.timeline.length} version record
            {history.timeline.length === 1 ? "" : "s"} · selected v
            {history.selectedVersionNumber}
          </p>
        </div>
      </div>

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">
          {message}
        </p>
      ) : null}

      {canRollback ? (
        <div className="rounded-lg border p-3">
          <p className="font-semibold text-slate-700">Rollback reason (optional)</p>
          <input
            type="text"
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
            placeholder="Why restoring this version…"
            className="mt-2 w-full rounded-md border px-2 py-1.5 text-xs"
          />
        </div>
      ) : null}

      {history.activationHistory.length > 0 ? (
        <div>
          <p className="mb-2 font-semibold text-slate-600">Activation history</p>
          <ul className="space-y-1 rounded-lg border bg-white p-3">
            {history.activationHistory.slice(0, 6).map((ev) => (
              <li key={ev.id} className="flex gap-2 text-[11px] text-slate-700">
                <AuditEventIcon type={ev.eventType} />
                {AUDIT_EVENT_LABELS[ev.eventType]} · {ev.actorEmail} ·{" "}
                {formatDateTime(ev.createdAt)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="mb-3 font-semibold text-slate-600">Version timeline</p>
        <div className="max-h-[420px] overflow-y-auto pr-2">
          {history.timeline.map((entry) => (
            <TimelineVersionCard
              key={entry.instructionId}
              entry={entry}
              canRollback={canRollback}
              onRollback={handleRollback}
              rollbackLoading={rollbackLoading}
            />
          ))}
        </div>
      </div>
    </div>
    </PromptAsyncState>
  );
}
