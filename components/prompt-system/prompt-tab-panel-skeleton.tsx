export function PromptTabPanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-slate-200" style={{ width: `${90 - i * 8}%` }} />
      ))}
    </div>
  );
}
