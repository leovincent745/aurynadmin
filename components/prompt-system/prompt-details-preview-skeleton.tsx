export function PromptDetailsPreviewSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading prompt details">
      <div className="flex gap-3">
        <div className="h-11 w-11 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-3 w-28 rounded bg-slate-100" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-16 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-100" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between gap-4">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
