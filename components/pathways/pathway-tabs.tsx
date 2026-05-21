import { pathwayTabs } from "@/components/pathways/pathway-nav";

export function PathwayTabs() {
  return (
    <div className="border-b bg-white">
      <div className="flex items-center gap-x-1 overflow-x-auto px-2 sm:px-4">
        {pathwayTabs.map((tab) => {
          const active = tab === "Plans & Protocols";

          return (
            <button
              key={tab}
              className={`relative min-h-12 shrink-0 whitespace-nowrap px-4 py-3 text-left text-sm font-semibold ${
                active ? "text-violet-700" : "text-slate-600 hover:text-slate-950"
              }`}
              type="button"
            >
              {tab}
              {active ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-violet-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
