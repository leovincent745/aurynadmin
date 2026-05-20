import { pathwayTabs } from "@/components/pathways/pathway-nav";

export function PathwayTabs() {
  return (
    <div className="overflow-x-auto border-b bg-white [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-1 px-2 sm:px-4">
        {pathwayTabs.map((tab) => {
          const active = tab === "Plans & Protocols";

          return (
            <button
              key={tab}
              className={`relative h-12 whitespace-nowrap px-3 text-sm font-semibold ${
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
