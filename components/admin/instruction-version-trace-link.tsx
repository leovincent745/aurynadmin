import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  aiLogsHrefForInstructionVersion,
  promptSystemOverviewHref,
} from "@/lib/prompt-system/version-history-links";

export function InstructionVersionTraceLink({
  instructionVersionId,
  versionNumber,
  compact = false,
}: {
  instructionVersionId: string | null;
  versionNumber: number | null;
  compact?: boolean;
}) {
  if (!instructionVersionId) {
    return (
      <span className={compact ? "text-[10px] text-slate-500" : "text-xs text-slate-500"}>
        Default instructions (no published version id)
      </span>
    );
  }

  const label =
    versionNumber != null ? `Instruction v${versionNumber}` : "Instruction version";

  if (compact) {
    return (
      <Link
        href={promptSystemOverviewHref(instructionVersionId)}
        className="font-mono text-[10px] font-semibold text-violet-700 hover:underline"
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Link
        href={promptSystemOverviewHref(instructionVersionId)}
        className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:underline"
      >
        {label}
        <ExternalLink className="h-3 w-3" aria-hidden />
      </Link>
      <Link
        href={aiLogsHrefForInstructionVersion(instructionVersionId)}
        className="text-slate-600 hover:text-violet-700 hover:underline"
      >
        AI logs
      </Link>
      <span className="font-mono text-[10px] text-slate-400">{instructionVersionId}</span>
    </div>
  );
}
