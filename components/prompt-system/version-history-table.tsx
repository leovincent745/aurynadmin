"use client";

import { Copy, Eye, RotateCcw } from "lucide-react";

import { PipelineStatusBadge } from "@/components/prompt-system/pipeline-status-badge";
import { VersionHistoryTraceability } from "@/components/prompt-system/version-history-traceability";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PromptVersionTimelineEntry } from "@/lib/domain/prompt-history";
import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(entry: PromptVersionTimelineEntry): PromptPipelineStatusLabel {
  switch (entry.status) {
    case "published":
      return "Active";
    case "archived":
      return "Archived";
    case "draft":
    default:
      return "In Review";
  }
}

function archivedLabel(entry: PromptVersionTimelineEntry): string {
  if (entry.status !== "archived") return "—";
  return entry.wasPreviouslyLive ? "Yes (was live)" : "Yes";
}

export function VersionHistoryTable({
  entries,
  canRollback,
  rollbackLoadingId,
  onViewDetails,
  onCreateDraftFromVersion,
}: {
  entries: PromptVersionTimelineEntry[];
  canRollback: boolean;
  rollbackLoadingId: string | null;
  onViewDetails: (instructionId: string) => void;
  onCreateDraftFromVersion: (instructionId: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Version</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created by</TableHead>
          <TableHead>Created at</TableHead>
          <TableHead>Published at</TableHead>
          <TableHead>Archived</TableHead>
          <TableHead>Traceability</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow
            key={entry.instructionId}
            className={entry.isSelected ? "bg-violet-50/60" : undefined}
          >
            <TableCell className="font-medium">
              v{entry.versionNumber}
              {entry.isSelected ? (
                <span className="ml-1 text-[10px] font-normal text-violet-600">(selected)</span>
              ) : null}
              {entry.isCurrentlyLive ? (
                <span className="ml-1 block text-[10px] font-semibold text-emerald-700">
                  Live now
                </span>
              ) : entry.wasPreviouslyLive ? (
                <span className="ml-1 block text-[10px] text-slate-500">Was live</span>
              ) : null}
            </TableCell>
            <TableCell>
              <PipelineStatusBadge status={statusLabel(entry)} />
            </TableCell>
            <TableCell>{entry.createdByEmail}</TableCell>
            <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
            <TableCell>{formatDateTime(entry.publishedAt)}</TableCell>
            <TableCell className="text-xs text-slate-700">{archivedLabel(entry)}</TableCell>
            <TableCell>
              <VersionHistoryTraceability
                instructionId={entry.instructionId}
                traceability={entry.traceability}
                compact
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(entry.instructionId)}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  View
                </Button>
                {canRollback ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={rollbackLoadingId === entry.instructionId}
                    onClick={() => onCreateDraftFromVersion(entry.instructionId)}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    {rollbackLoadingId === entry.instructionId ? "…" : "To draft"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled
                    title="Rollback requires edit permission"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5 opacity-40" />
                    To draft
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
