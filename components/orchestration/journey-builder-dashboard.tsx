"use client";

import {
  Bell,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  GitBranch,
  Grip,
  History,
  MousePointer2,
  Network,
  PanelTop,
  Plus,
  RotateCcw,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const componentGroups = [
  {
    title: "Engagement",
    items: [
      ["Question / Assessment", ClipboardList],
      ["Quick Action", Zap],
      ["User Input (Text/Number)", FileText],
    ],
  },
  {
    title: "Intelligence",
    items: [
      ["Pathway Weight Trigger", Sparkles],
      ["Plan Assignment", Route],
      ["AI Task Trigger", Brain],
      ["Optimization Check", ShieldCheck],
      ["Personalization Rule", WandSparkles],
    ],
  },
  {
    title: "Content",
    items: [
      ["Educational Block", PanelTop],
      ["Resource / Video", FileText],
      ["Tip / Insight", Sparkles],
    ],
  },
  {
    title: "Logic & Flow",
    items: [
      ["Condition / Branch", GitBranch],
      ["Wait / Delay", Clock],
      ["Follow-Up", Route],
      ["Loop / Repeat", RotateCcw],
    ],
  },
  {
    title: "Escalation",
    items: [
      ["Physician Review", User],
      ["Alert / Notification", Bell],
    ],
  },
] as const;

const builderNodes = [
  { title: "Start", body: "User Enters Journey", tone: "emerald", x: "lg:col-start-4", width: "lg:col-span-2" },
  { title: "Q1. What is your biggest challenge right now?", body: "Single Select", tone: "violet", x: "lg:col-start-3", width: "lg:col-span-4" },
  { title: "Increase Pathway Weight", body: "Energy & Fatigue +24%\nHydration +12%", tone: "violet", x: "lg:col-start-1", width: "lg:col-span-3" },
  { title: "Assign Plan", body: "GLP-1 Support Plan\nPriority: High", tone: "emerald", x: "lg:col-start-4", width: "lg:col-span-3" },
  { title: "Increase Pathway Weight", body: "Muscle Preservation +21%\nProtein Support +15%", tone: "violet", x: "lg:col-start-7", width: "lg:col-span-3" },
  { title: "Educational Block", body: "Energy Fundamentals\nEngagement Score: 92%", tone: "amber", x: "lg:col-start-1", width: "lg:col-span-3" },
  { title: "Optimization Check", body: "Ingredient Overlap\nSimplify Stack", tone: "cyan", x: "lg:col-start-4", width: "lg:col-span-3" },
  { title: "Educational Block", body: "Protein Preservation 101\nEngagement Score: 89%", tone: "amber", x: "lg:col-start-7", width: "lg:col-span-3" },
  { title: "AI Task Trigger", body: "Product Matching AI\nConfidence: 94%", tone: "violet", x: "lg:col-start-1", width: "lg:col-span-3" },
  { title: "AI Task Trigger", body: "Optimization Engine\nConfidence: 92%", tone: "violet", x: "lg:col-start-7", width: "lg:col-span-3" },
  { title: "Condition", body: "Check for Contraindications\n& Interactions", tone: "rose", x: "lg:col-start-4", width: "lg:col-span-3" },
  { title: "Create Follow-Up", body: "Check-in in 3 Days\nAssess Progress", tone: "emerald", x: "lg:col-start-2", width: "lg:col-span-3" },
  { title: "Physician Review", body: "Flag for review\nHigh Priority", tone: "rose", x: "lg:col-start-6", width: "lg:col-span-3" },
  { title: "End", body: "Continue Personalized Journey", tone: "violet", x: "lg:col-start-3", width: "lg:col-span-4" },
] as const;

const toneClasses: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

export function JourneyBuilderDashboard() {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 xl:hidden">
            Builder Status: <span className="ml-2 text-emerald-600">Active</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Advanced Journey Builder
          </h1>
          <p className="mt-1 max-w-4xl text-sm font-medium leading-6 text-slate-600">
            Visually build intelligent user journeys that adapt pathways, trigger AI tasks, and personalize experiences in real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="hidden xl:inline-flex">
            Journey: GLP-1 Onboarding Flow <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2"><History className="h-4 w-4" />Version History</Button>
          <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" />Test Journey</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Publish Journey</Button>
        </div>
      </header>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[17rem_minmax(0,1fr)_25rem]">
        <ComponentLibrary />
        <JourneyCanvas />
        <NodeConfiguration />
      </div>

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_minmax(0,1fr)]">
        <JourneySimulation />
        <SimulationResults />
        <LiveImpactPreview />
      </div>

      <FooterLegend />
    </div>
  );
}

function ComponentLibrary() {
  return (
    <Card className="min-w-0 bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm uppercase text-slate-900">Components Library</CardTitle>
        <p className="text-xs text-slate-500">Drag & drop components to build your journey</p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {componentGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>
            <div className="space-y-2">
              {group.items.map(([label, Icon]) => (
                <button
                  key={label}
                  className="flex min-h-9 w-full items-center gap-3 rounded-md border bg-slate-50 px-3 text-left text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                  type="button"
                >
                  <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="break-words">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full gap-2"><Settings className="h-4 w-4" />Manage Components</Button>
      </CardContent>
    </Card>
  );
}

function JourneyCanvas() {
  return (
    <Card className="min-w-0 overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            ["Select", MousePointer2],
            ["Pan", Grip],
            ["Connector", GitBranch],
            ["Note", FileText],
            ["Arrange", Network],
            ["Undo", RotateCcw],
            ["Redo", RotateCcw],
            ["Delete", Trash2],
          ].map(([label, Icon]) => (
            <Button key={String(label)} size="sm" variant={label === "Select" ? "secondary" : "ghost"} className="h-8 gap-2 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {String(label)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="text-emerald-600">Auto-Save: 2m ago</span>
          <Button size="sm" variant="outline">100%</Button>
          <Button size="icon" variant="ghost" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardContent className="min-h-[32rem] overflow-x-auto p-4 [background-image:radial-gradient(#dbe4f0_1px,transparent_1px)] [background-size:16px_16px] lg:min-h-[42rem]">
        <div className="mx-auto grid min-w-0 max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:min-w-[46rem] lg:grid-cols-9">
          {builderNodes.map((node) => (
            <NodeCard key={`${node.title}-${node.body}`} node={node} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NodeCard({ node }: { node: (typeof builderNodes)[number] }) {
  return (
    <div className={`${node.x} ${node.width}`}>
      <div className={`rounded-lg border p-3 shadow-sm ${toneClasses[node.tone]}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase">{node.title}</p>
            <p className="mt-1 whitespace-pre-line text-xs font-semibold leading-5 text-slate-700">{node.body}</p>
          </div>
          <Grip className="h-4 w-4 shrink-0 opacity-70" />
        </div>
      </div>
    </div>
  );
}

function NodeConfiguration() {
  const effects = [
    ["Energy & Fatigue Pathway", "+24%"],
    ["Hydration Pathway", "+12%"],
    ["Sleep Optimization", "+6%"],
  ];

  return (
    <Card className="min-w-0 bg-white">
      <CardHeader className="border-b p-4">
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button className="border-b-2 border-blue-600 pb-2 text-blue-600" type="button">Node Configuration</button>
          <button className="pb-2 text-slate-500" type="button">Journey Settings</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 text-xs">
        <div className="rounded-lg border p-3">
          <p className="text-[11px] font-semibold text-slate-500">Selected Node</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-950">Quick Action</p>
              <p className="break-words text-slate-500">&quot;I feel weak / low energy&quot;</p>
            </div>
            <span className="ml-auto rounded bg-slate-100 px-2 py-1 font-semibold text-slate-500">ID: QA-101</span>
          </div>
        </div>
        <ConfigBlock title="Description">User selects this option from quick action buttons.</ConfigBlock>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase text-slate-500">Effects</p>
          <div className="space-y-2">
            {effects.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                <span className="min-w-0 break-words text-slate-700">{label}</span>
                <span className="rounded bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <ConfigBlock title="Triggers">Educational Block, Product Matching AI, Ingredient Optimization AI</ConfigBlock>
        <ConfigBlock title="Conditions">Fatigue Level is greater than 6; Hydration Intake is less than 64 oz.</ConfigBlock>
        <ConfigBlock title="AI & Personalization">Impact: High. Confidence Score: 94%. Uses profile, survey responses, and behavior data.</ConfigBlock>
        <ConfigBlock title="Governance">Physician Approved by Dr. Sarah Mitchell on May 10, 2025.</ConfigBlock>
        <Button variant="outline" className="w-full border-rose-200 text-rose-600 hover:bg-rose-50">Delete Node</Button>
      </CardContent>
    </Card>
  );
}

function ConfigBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase text-slate-500">{title}</p>
      <p className="leading-5 text-slate-700">{children}</p>
    </div>
  );
}

function JourneySimulation() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-slate-950">Journey Simulation</CardTitle>
        <p className="text-xs text-slate-500">Test how the journey flows for a specific user scenario.</p>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <select className="h-10 w-full rounded-md border bg-white px-3 text-xs font-semibold text-slate-700">
          <option>User selects: I feel weak / low energy</option>
        </select>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Run Simulation</Button>
      </CardContent>
    </Card>
  );
}

function SimulationResults() {
  const steps = ["Input Selected", "Pathway Impact", "Plan Assigned", "AI Tasks Triggered", "Follow-Up Created"];
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-slate-950">Simulation Results</CardTitle>
        <p className="text-xs font-semibold text-emerald-600">Journey executed successfully</p>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="rounded-lg border p-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
            <p className="mt-3 text-xs font-semibold text-slate-900">{step}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Energy, Hydration, GLP-1 plan, AI task, check-in.</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LiveImpactPreview() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-slate-950">Live Impact Preview</CardTitle>
        <p className="text-xs text-slate-500">See how this change affects the user experience.</p>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 xl:grid-cols-5">
        {["Pathway Weights", "Products", "Education", "AI Tasks", "Overall Impact"].map((label, index) => (
          <div key={label} className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-8 border-emerald-200 text-sm font-semibold text-slate-900">
              {index === 4 ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : index + 5}
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-700">{label}</p>
            <p className="text-[11px] text-emerald-600">+{index + 2} changed</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FooterLegend() {
  return (
    <Card className="bg-white">
      <CardContent className="flex flex-col gap-3 p-4 text-xs font-semibold text-slate-600 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-3">
          {["Start / End", "Question", "Action", "AI / Intelligence", "Condition", "Content", "Follow-Up", "Escalation"].map((item) => (
            <span key={item} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500 text-white" />{item}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Journey ID: JRN-GLP1-ONB-001</span>
          <span>Version: 1.4</span>
          <span>Last Updated: May 22, 2025 9:41 AM</span>
        </div>
      </CardContent>
    </Card>
  );
}
