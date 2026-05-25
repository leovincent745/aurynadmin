"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WandSparkles } from "lucide-react";

import { InstructionVersionDetailDialog } from "@/components/admin/instruction-version-detail-dialog";
import { VersionHistoryTable } from "@/components/prompt-system/version-history-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  InstructionHistoryListItem,
  InstructionHistoryResponse,
  InstructionRecord,
} from "@/lib/domain/admin-instructions";
import type { PromptVersionTimelineEntry } from "@/lib/domain/prompt-history";
import { usePromptPermissions } from "@/lib/hooks/use-prompt-permissions";

function toTimelineEntry(item: InstructionHistoryListItem): PromptVersionTimelineEntry {
  return {
    instructionId: item.id,
    versionNumber: item.versionNumber,
    status: item.status,
    createdByEmail: item.createdByEmail,
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    publishedAt: item.publishedAt,
    isCurrentlyLive: item.isCurrentlyLive,
    wasPreviouslyLive: item.wasPreviouslyLive,
    traceability: item.traceability,
    immutable: item.status !== "draft",
    isSelected: false,
    auditEvents: [],
    validationEvidence: [],
    reviewerHistory: [],
    rollbacksFrom: [],
  };
}

export function InstructionHistory() {
  const { permissions } = usePromptPermissions();
  const [history, setHistory] = useState<InstructionHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewInstruction, setViewInstruction] = useState<InstructionRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [cloneLoadingId, setCloneLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/instructions/history?page=${targetPage}&limit=20`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load history");
      const data = (await response.json()) as InstructionHistoryResponse;
      setHistory(data);
      setPage(data.page);
    } catch {
      setError("Unable to load version history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(page);
  }, [loadHistory, page]);

  const openDetail = async (id: string) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewInstruction(null);
    try {
      const response = await fetch(`/api/admin/instructions/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not found");
      const data = (await response.json()) as { instruction: InstructionRecord };
      setViewInstruction(data.instruction);
    } catch {
      setError("Unable to load version details.");
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const cloneToDraft = async (id: string) => {
    if (!window.confirm("Copy this version into the working draft?")) return;
    setCloneLoadingId(id);
    setActionMessage(null);
    try {
      const response = await fetch(`/api/admin/instructions/${id}/clone-to-draft`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Clone failed");
      setActionMessage("Copied into working draft. Edit and publish from Prompt System.");
    } catch {
      setError("Unable to copy version into draft.");
    } finally {
      setCloneLoadingId(null);
    }
  };

  if (loading && !history) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  const timelineEntries = history?.items.map(toTimelineEntry) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Version History</h1>
          <p className="mt-1 text-sm text-slate-600">
            All draft, published, and archived instruction versions. Trace production chat and AI
            logs by instruction ID.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/prompt-system">
              <WandSparkles className="mr-1 h-4 w-4" />
              Prompt System
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/instructions">AI Instructions</Link>
          </Button>
        </div>
      </div>

      {actionMessage ? (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMessage}{" "}
          <Link href="/prompt-system" className="font-semibold underline">
            Open Prompt System
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All versions</CardTitle>
          <p className="text-xs text-slate-500">
            Archived rows with a publish date were previously live. Only one published version is
            active at a time.
          </p>
        </CardHeader>
        <CardContent>
          {!history || history.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No instruction versions yet. Create your first draft in Prompt System.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <VersionHistoryTable
                  entries={timelineEntries}
                  canRollback={permissions.canRollback}
                  rollbackLoadingId={cloneLoadingId}
                  onViewDetails={(id) => void openDetail(id)}
                  onCreateDraftFromVersion={(id) => void cloneToDraft(id)}
                />
              </div>

              {history.totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {history.page} of {history.totalPages} ({history.total} versions)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= history.totalPages || loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <InstructionVersionDetailDialog
        open={viewOpen}
        loading={viewLoading}
        instruction={viewInstruction}
        onClose={() => {
          setViewOpen(false);
          setViewInstruction(null);
        }}
      />
    </div>
  );
}
