import { pathwayTabs } from "@/components/pathways/pathway-nav";

export function PathwayTabs() {
  return (
    <div className="border-b bg-white">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-0 px-2 sm:px-4">
        {pathwayTabs.map((tab) => {
          const active = tab === "Plans & Protocols";

          return (
            <button
              key={tab}
              className={`relative min-h-11 px-3 py-3 text-left text-xs font-semibold ${
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
