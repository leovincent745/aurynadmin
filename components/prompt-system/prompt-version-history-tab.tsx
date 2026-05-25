"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, History } from "lucide-react";

import { InstructionVersionDetailDialog } from "@/components/admin/instruction-version-detail-dialog";
import { PromptAsyncState } from "@/components/prompt-system/prompt-async-state";
import { VersionHistoryTable } from "@/components/prompt-system/version-history-table";
import type { InstructionRecord } from "@/lib/domain/admin-instructions";
import type { PromptHistoryResponse } from "@/lib/domain/prompt-history";

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
  const [rollbackLoadingId, setRollbackLoadingId] = useState<string | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [viewInstructionId, setViewInstructionId] = useState<string | null>(null);
  const [viewInstruction, setViewInstruction] = useState<InstructionRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

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

  const openDetail = async (id: string) => {
    setViewInstructionId(id);
    setViewLoading(true);
    setViewInstruction(null);
    try {
      const res = await fetch(`/api/admin/instructions/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      const json = (await res.json()) as { instruction: InstructionRecord };
      setViewInstruction(json.instruction);
    } catch {
      setError("Could not load version details.");
      setViewInstructionId(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCreateDraftFromVersion = async (sourceId: string) => {
    if (
      !window.confirm(
        "Copy this version into the working draft? Published and archived rows stay immutable until you publish again.",
      )
    ) {
      return;
    }
    setRollbackLoadingId(sourceId);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompts/${sourceId}/rollback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rollbackReason || undefined }),
      });
      const json = (await res.json()) as { message?: string; rollback?: { draftId: string } };
      if (!res.ok) throw new Error(json.message ?? "Rollback failed");
      setMessage(`Copied into working draft (${json.rollback?.draftId ?? "updated"}).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create draft from version");
    } finally {
      setRollbackLoadingId(null);
    }
  };

  return (
    <>
      <PromptAsyncState
        loading={loading}
        error={error}
        onRetry={() => void load()}
        empty={!loading && history !== null && history.timeline.length === 0}
        emptyTitle="No version history"
        emptyDescription="Versions appear after saves, validation runs, and publishes."
        skeletonLines={5}
        loadingLabel="Loading version history"
      >
        {history ? (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-violet-600" aria-hidden />
                <div>
                  <p className="font-semibold text-slate-800">{history.pipelineName}</p>
                  <p className="text-slate-600">
                    {history.timeline.length} version
                    {history.timeline.length === 1 ? "" : "s"} · table row v
                    {history.selectedVersionNumber}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/instructions/history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
              >
                Full Version History
                <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            </div>

            {message ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">
                {message}
              </p>
            ) : null}

            {canRollback ? (
              <div className="rounded-lg border p-3">
                <p className="font-semibold text-slate-700">Restore reason (optional)</p>
                <input
                  type="text"
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  placeholder="Why copying this version into the draft…"
                  className="mt-2 w-full rounded-md border px-2 py-1.5 text-xs"
                />
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border">
              <VersionHistoryTable
                entries={history.timeline}
                canRollback={canRollback}
                rollbackLoadingId={rollbackLoadingId}
                onViewDetails={(id) => void openDetail(id)}
                onCreateDraftFromVersion={(id) => void handleCreateDraftFromVersion(id)}
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Use instruction IDs in Conversations and AI Logs to trace which version powered each
              response. Archived rows with a publish date were previously live.
            </p>
          </div>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </PromptAsyncState>

      <InstructionVersionDetailDialog
        open={viewInstructionId != null}
        loading={viewLoading}
        instruction={viewInstruction}
        onClose={() => {
          setViewInstructionId(null);
          setViewInstruction(null);
        }}
      />
    </>
  );
}
