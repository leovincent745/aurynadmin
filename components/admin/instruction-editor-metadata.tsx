import { PipelineStatusBadge } from "@/components/prompt-system/pipeline-status-badge";
import type { PromptPipelineStatusLabel } from "@/lib/domain/prompt-pipelines";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: string): PromptPipelineStatusLabel {
  switch (status) {
    case "published":
      return "Active";
    case "archived":
      return "Archived";
    case "draft":
    default:
      return "In Review";
  }
}

export function InstructionEditorMetadata({
  status,
  versionNumber,
  updatedAt,
  updatedByEmail,
  livePublished,
}: {
  status: string;
  versionNumber: number | null;
  updatedAt: string | null;
  updatedByEmail: string | null;
  livePublished: {
    versionNumber: number;
    publishedAt: string;
    publishedByEmail: string;
  } | null;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1">
              <PipelineStatusBadge status={statusLabel(status)} />
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-500">Version</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {versionNumber != null ? `v${versionNumber}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-500">
              Last updated
            </dt>
            <dd className="mt-1 text-slate-800">
              {updatedAt ? formatDateTime(updatedAt) : "Not saved yet"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-slate-500">
              Updated by
            </dt>
            <dd className="mt-1 text-slate-800">{updatedByEmail ?? "—"}</dd>
          </div>
        </dl>
      </div>

      {livePublished ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          Live for public chat:{" "}
          <span className="font-semibold">v{livePublished.versionNumber}</span> (published{" "}
          {formatDateTime(livePublished.publishedAt)} by {livePublished.publishedByEmail}).
          Editing this draft does not change production until you publish.
        </p>
      ) : (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          No live instruction is published yet. Saving this draft is safe — public chat uses
          defaults until you publish.
        </p>
      )}
    </div>
  );
}
