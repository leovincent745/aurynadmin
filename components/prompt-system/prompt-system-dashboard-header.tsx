"use client";

import { BookOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EngineStatus } from "@/lib/domain/prompt-system-summary";

const engineStatusClasses: Record<EngineStatus, string> = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  degraded: "border-orange-200 bg-orange-50 text-orange-800",
  offline: "border-red-200 bg-red-50 text-red-800",
};

const engineStatusDot: Record<EngineStatus, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  degraded: "bg-orange-500",
  offline: "bg-red-500",
};

const engineStatusLabels: Record<EngineStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  degraded: "Degraded",
  offline: "Offline",
};

export interface PromptSystemDashboardHeaderProps {
  summaryLoading: boolean;
  engineStatus: EngineStatus | null;
  engineDetail: string | null;
  creatingPrompt: boolean;
  canCreate: boolean;
  onPromptLibrary: () => void;
  onNewPrompt: () => void;
}

export function PromptSystemDashboardHeader({
  summaryLoading,
  engineStatus,
  engineDetail,
  creatingPrompt,
  canCreate,
  onPromptLibrary,
  onNewPrompt,
}: PromptSystemDashboardHeaderProps) {
  const pillClass = summaryLoading
    ? "border-slate-200 bg-slate-50 text-slate-500"
    : engineStatus
      ? engineStatusClasses[engineStatus]
      : "border-amber-200 bg-amber-50 text-amber-800";

  const dotClass = summaryLoading
    ? "bg-slate-300"
    : engineStatus
      ? engineStatusDot[engineStatus]
      : "bg-amber-500";

  const statusLabel = summaryLoading
    ? "Checking…"
    : engineStatus
      ? engineStatusLabels[engineStatus]
      : "Unknown";

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Prompt System
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Manage and govern the AI instructions that power Auryn chat — test drafts, publish live
          versions, and trace conversations and safety logs from one place.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
        <span
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${pillClass}`}
          title={engineDetail ?? undefined}
          role="status"
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
          <span>
            AI Engine Status: <span className="font-bold">{statusLabel}</span>
          </span>
        </span>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={onPromptLibrary}>
            <BookOpen className="h-4 w-4" />
            Prompt Library
          </Button>
          <Button
            type="button"
            className="gap-2 bg-violet-600 hover:bg-violet-700"
            disabled={creatingPrompt || !canCreate}
            title={
              !canCreate ? "You do not have permission to create prompts" : undefined
            }
            onClick={onNewPrompt}
          >
            <Plus className="h-4 w-4" />
            {creatingPrompt ? "Creating…" : "New Prompt"}
          </Button>
        </div>
      </div>
    </header>
  );
}
