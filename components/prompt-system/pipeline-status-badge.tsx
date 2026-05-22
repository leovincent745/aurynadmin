import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";

const statusStyles: Record<
  PromptPipelineListItem["status"],
  { text: string; bg: string }
> = {
  Active: { text: "text-emerald-700", bg: "bg-emerald-50" },
  "In Review": { text: "text-amber-800", bg: "bg-amber-50" },
  Archived: { text: "text-slate-600", bg: "bg-slate-100" },
};

export function PipelineStatusBadge({ status }: { status: PromptPipelineListItem["status"] }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
}
