import type { ReactNode } from "react";

export interface PromptMetadataCardProps {
  label: string;
  value?: ReactNode;
  hint?: string;
  children?: ReactNode;
  className?: string;
}

/** Reusable label/value tile for prompt overview and related panels. */
export function PromptMetadataCard({
  label,
  value,
  hint,
  children,
  className = "",
}: PromptMetadataCardProps) {
  const body = children ?? (
    <p className="mt-1 text-sm font-medium text-slate-900 break-words">{value ?? "—"}</p>
  );

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-3 min-w-0 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {body}
      {hint ? <p className="mt-1 text-[10px] leading-snug text-slate-400">{hint}</p> : null}
    </div>
  );
}
