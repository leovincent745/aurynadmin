"use client";

import type { PromptDetailTabDefinition, PromptDetailTabSlug } from "@/lib/domain/prompt-detail-tabs";

export function PromptDetailTabBar({
  tabs,
  activeSlug,
  onSelect,
  ariaLabel = "Prompt details sections",
}: {
  tabs: PromptDetailTabDefinition[];
  activeSlug: PromptDetailTabSlug;
  onSelect: (slug: PromptDetailTabSlug) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className="mt-3 flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-200"
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const selected = activeSlug === tab.slug;
        return (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            id={`prompt-detail-tab-${tab.slug}`}
            aria-selected={selected}
            aria-controls={`prompt-detail-panel-${tab.slug}`}
            tabIndex={selected ? 0 : -1}
            className={`relative whitespace-nowrap px-3 pb-2 text-xs font-semibold transition-colors ${
              selected
                ? "text-violet-700"
                : "text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => onSelect(tab.slug)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const idx = tabs.findIndex((t) => t.slug === tab.slug);
              const next =
                e.key === "ArrowRight"
                  ? tabs[(idx + 1) % tabs.length]
                  : tabs[(idx - 1 + tabs.length) % tabs.length];
              onSelect(next.slug);
            }}
          >
            {tab.label}
            {selected ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
