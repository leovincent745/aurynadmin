import { AlertCircle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

import type { PromptValidationRunStatus } from "@/lib/domain/prompt-validation";

const STATUS_CONFIG: Record<
  PromptValidationRunStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  queued: {
    label: "Queued",
    className: "bg-slate-100 text-slate-700",
    icon: Clock,
  },
  running: {
    label: "Running",
    className: "bg-blue-100 text-blue-800",
    icon: Loader2,
  },
  passed: {
    label: "Passed",
    className: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  canceled: {
    label: "Canceled",
    className: "bg-amber-100 text-amber-900",
    icon: AlertCircle,
  },
};

export function ValidationRunStatus({ status }: { status: PromptValidationRunStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${config.className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}
