import {
  Bot,
  CalendarDays,
  ChevronDown,
  Copy,
  Eye,
  Hash,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  rootPathwayStatusConfig,
  type RootPathway,
} from "@/lib/domain/root-pathway";

interface PathwayPageHeaderProps {
  pathway: RootPathway;
}

export function PathwayPageHeader({ pathway }: PathwayPageHeaderProps) {
  const status = rootPathwayStatusConfig[pathway.status];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {pathway.name}
            </h1>
            <span
              className="rounded-md bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              title={status.description}
            >
              {status.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 sm:px-4 sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Physician Approved
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Comprehensive support for patients using GLP-1 medications to optimize results,
            preserve muscle, manage side effects and improve long-term adherence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end">
          <Button variant="outline" className="gap-2 px-3">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview as User</span>
            <span className="sm:hidden">Preview</span>
          </Button>
          <Button variant="outline" className="gap-2 px-3">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Suggest Improvements</span>
            <span className="sm:hidden">AI Suggest</span>
          </Button>
          <Button variant="outline" className="gap-2 px-3">
            <Copy className="h-4 w-4" />
            Clone
          </Button>
          <div className="flex min-w-0">
            <Button className="min-w-0 flex-1 gap-2 rounded-r-none bg-blue-600 px-3 hover:bg-blue-700 sm:flex-none">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Changes</span>
              <span className="sm:hidden">Save</span>
            </Button>
            <Button
              size="icon"
              className="rounded-l-none border-l border-blue-500 bg-blue-600 hover:bg-blue-700"
              aria-label="Save options"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:justify-end xl:gap-4">
        <div className="flex items-center gap-3 rounded-md border bg-white p-3 xl:border-0 xl:border-r xl:bg-transparent xl:p-0 xl:pr-5">
          <CalendarDays className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-xs font-medium text-slate-500">Last Updated</p>
            <p className="font-semibold text-slate-800">May 20, 2025 10:45 AM</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-white p-3 xl:border-0 xl:border-r xl:bg-transparent xl:p-0 xl:pr-5">
          <UserRound className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-xs font-medium text-slate-500">Physician Owner</p>
            <p className="font-semibold text-slate-800">
              {pathway.physicianOwner?.name ?? "Unassigned"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-white p-3 xl:border-0 xl:bg-transparent xl:p-0">
          <Hash className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-xs font-medium text-slate-500">ID</p>
            <p className="font-semibold text-slate-800">RP-GLP1-001</p>
          </div>
        </div>
      </div>
    </section>
  );
}
