"use client";

import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { PromptTabPanelSkeleton } from "@/components/prompt-system/prompt-tab-panel-skeleton";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

export function PromptOfflineBanner({
  onRetry,
  className = "",
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between ${className}`}
      role="status"
    >
      <div className="flex gap-2">
        <WifiOff className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
        <p>
          <span className="font-semibold">Offline</span> — changes are not saved until you
          reconnect.
        </p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Retry when online
        </Button>
      ) : null}
    </div>
  );
}

export function PromptStateError({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <div className="flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-red-700">{message}</p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 bg-white hover:bg-red-50"
              onClick={onRetry}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PromptStateEmpty({
  title = "Nothing here yet",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600"
      role="status"
    >
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-2">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PromptStateValidationFailed({
  title = "Validation failed",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      role="alert"
    >
      <div className="flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" aria-hidden />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{message}</p>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              Re-run validation
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Standard guard for tab panels: offline → loading skeleton → error → empty → children.
 */
export function PromptAsyncState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  skeletonLines = 5,
  loadingLabel = "Loading…",
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRetry?: () => void;
  skeletonLines?: number;
  loadingLabel?: string;
  children: ReactNode;
}) {
  const online = useOnlineStatus();

  if (!online) {
    return <PromptOfflineBanner onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div aria-busy="true" aria-label={loadingLabel}>
        <p className="sr-only">{loadingLabel}</p>
        <PromptTabPanelSkeleton lines={skeletonLines} />
      </div>
    );
  }

  if (error) {
    return <PromptStateError message={error} onRetry={onRetry} />;
  }

  if (empty) {
    return (
      <PromptStateEmpty
        title={emptyTitle}
        description={emptyDescription ?? "No data to display."}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
