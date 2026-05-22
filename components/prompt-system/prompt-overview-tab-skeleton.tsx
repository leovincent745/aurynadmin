import { PromptMetadataCard } from "@/components/prompt-system/prompt-metadata-card";

export function PromptOverviewTabSkeleton() {
  return (
    <div
      className="animate-pulse space-y-5 min-w-0"
      aria-busy="true"
      aria-label="Loading overview"
    >
      <div className="space-y-2">
        <div className="h-5 w-48 max-w-full rounded bg-slate-200" />
        <div className="h-3 w-32 rounded bg-slate-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptMetadataCard key={i} label="Loading">
            <div className="mt-1 h-4 w-24 rounded bg-slate-200" />
          </PromptMetadataCard>
        ))}
      </div>
      <div className="h-24 rounded-lg bg-slate-100" />
      <div className="h-32 rounded-lg bg-slate-100" />
    </div>
  );
}
