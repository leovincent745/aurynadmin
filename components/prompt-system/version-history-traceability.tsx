import Link from "next/link";
import { ClipboardList, MessageSquare } from "lucide-react";

import type { VersionTraceabilityDto } from "@/lib/domain/prompt-history";
import {
  aiLogsHrefForInstructionVersion,
  conversationsHrefForInstructionVersion,
} from "@/lib/prompt-system/version-history-links";

export function VersionHistoryTraceability({
  instructionId,
  traceability,
  compact = false,
}: {
  instructionId: string;
  traceability: VersionTraceabilityDto;
  compact?: boolean;
}) {
  const { aiLogCount, conversationCount, messageCount } = traceability;

  if (aiLogCount === 0 && conversationCount === 0 && messageCount === 0) {
    return (
      <span className={compact ? "text-[10px] text-slate-400" : "text-xs text-slate-400"}>
        No chat or log activity yet
      </span>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2 text-[10px]"
          : "flex flex-wrap items-center gap-3 text-xs"
      }
    >
      <span className="text-slate-500">
        {messageCount} msg{messageCount === 1 ? "" : "s"} · {conversationCount} conv
        {conversationCount === 1 ? "" : "s"} · {aiLogCount} log{aiLogCount === 1 ? "" : "s"}
      </span>
      <Link
        href={conversationsHrefForInstructionVersion(instructionId)}
        className="inline-flex items-center gap-1 font-medium text-violet-700 hover:underline"
      >
        <MessageSquare className="h-3 w-3" aria-hidden />
        Conversations
      </Link>
      <Link
        href={aiLogsHrefForInstructionVersion(instructionId)}
        className="inline-flex items-center gap-1 font-medium text-violet-700 hover:underline"
      >
        <ClipboardList className="h-3 w-3" aria-hidden />
        AI Logs
      </Link>
    </div>
  );
}
