"use client";

import {
  ArrowRight,
  Bell,
  Brain,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  GitBranch,
  Grip,
  History,
  Info,
  Maximize2,
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

const toneClasses = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
  orange: "border-amber-200 bg-amber-50 text-amber-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
};

export function JourneyBuilderDashboard() {
  return (
    <div className="min-w-0 space-y-3 bg-slate-50 text-slate-900">
      <header className="relative flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Orchestration</span>
            <span>›</span>
            <span className="text-slate-800">Journey Builder</span>
          </div>

          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950">
            Advanced Journey Builder
            <Info className="h-4 w-4 text-slate-400" />
          </h1>

          <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-slate-600">
            Visually build intelligent user journeys that adapt pathways, trigger AI tasks,
            and personalize experiences in real time.
          </p>
        </div>

        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 rounded-md border bg-white px-4 py-2 text-xs font-bold shadow-sm xl:flex xl:items-center">
          <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
          Builder Status:
          <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-emerald-600">
            Active
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-white text-xs">
            Journey:
            <span className="font-bold">GLP-1 Onboarding Flow</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-white text-xs">
            <History className="h-3.5 w-3.5" />
            Version History
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-white text-xs">
            <Eye className="h-3.5 w-3.5" />
            Test Journey
          </Button>
          <Button size="sm" className="bg-blue-600 text-xs text-white hover:bg-blue-700">
            Publish Journey
          </Button>
        </div>
      </header>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[250px_minmax(0,1fr)]">
        <ComponentLibrary />

        <div className="min-w-0 space-y-3">
          <JourneyCanvas />
          <NodeConfiguration />
        </div>
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-2 2xl:grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)]">
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
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold uppercase text-slate-950">
          Components Library
        </CardTitle>
        <p className="text-xs text-slate-500">
          Drag & drop components to build your journey
        </p>
      </CardHeader>

      <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 xl:block xl:space-y-4">
        {componentGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>

            <div className="space-y-2">
              {group.items.map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  className="flex min-h-9 w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                >
                  <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="break-words">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <Button variant="outline" className="h-auto min-h-10 w-full gap-2 whitespace-normal bg-white text-xs font-bold sm:col-span-2 xl:col-span-1">
          <Settings className="h-4 w-4 shrink-0" />
          Manage Components
        </Button>
      </CardContent>
    </Card>
  );
}

function JourneyCanvas() {
  return (
    <Card className="relative min-w-0 overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex flex-wrap gap-1">
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
            <Button
              key={String(label)}
              size="sm"
              variant={label === "Select" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2 text-[11px]"
            >
              <Icon className="h-3.5 w-3.5" />
              {String(label)}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Auto-Save: 2m ago
          </span>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 bg-white text-[11px]">
            100%
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="relative overflow-x-auto overflow-y-hidden p-3 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="relative min-h-[720px] w-[920px] max-w-none lg:w-full">
          <CanvasLines />

          <Node className="left-[40%] top-[0px] w-[170px]" tone="green" title="START" body="User Enters Journey" />
          <Node className="left-[34%] top-[75px] w-[280px]" tone="blue" title="Q1. What is your biggest challenge right now?" body="Single Select" />

          <Label className="left-[14%] top-[142px]">Low Energy</Label>
          <Label className="left-[43%] top-[142px]">Weight Loss</Label>
          <Label className="left-[70%] top-[142px]">Muscle Loss</Label>

          <Node className="left-[4%] top-[175px] w-[230px]" tone="purple" title="Increase Pathway Weight" body="Energy & Fatigue   +24%&#10;Hydration   +12%" />
          <Node className="left-[36%] top-[175px] w-[230px]" tone="green" title="Assign Plan" body="GLP-1 Support Plan&#10;Priority: High" />
          <Node className="left-[68%] top-[175px] w-[230px]" tone="purple" title="Increase Pathway Weight" body="Muscle Preservation   +21%&#10;Protein Support   +15%" />

          <Node className="left-[4%] top-[260px] w-[230px]" tone="orange" title="Educational Block" body="Energy Fundamentals&#10;Engagement Score: 92%" />
          <Node className="left-[36%] top-[260px] w-[230px]" tone="cyan" title="Optimization Check" body="Ingredient Overlap&#10;Simplify Stack" />
          <Node className="left-[68%] top-[260px] w-[230px]" tone="orange" title="Educational Block" body="Protein Preservation 101&#10;Engagement Score: 89%" />

          <Node className="left-[4%] top-[345px] w-[230px]" tone="purple" title="AI Task Trigger" body="Product Matching AI&#10;Confidence: 94%" />
          <Node className="left-[68%] top-[345px] w-[230px]" tone="purple" title="AI Task Trigger" body="Optimization Engine&#10;Confidence: 92%" />

          <Node className="left-[36%] top-[430px] w-[230px]" tone="red" title="Condition" body="Check for Contraindications&#10;& Interactions" />

          <Label className="left-[39%] top-[505px]" tone="green">Clear</Label>
          <Label className="left-[55%] top-[505px]" tone="red">Issue Found</Label>

          <Node className="left-[18%] top-[535px] w-[230px]" tone="green" title="Create Follow-Up" body="Check-in in 3 Days&#10;Assess Progress" />
          <Node className="left-[58%] top-[535px] w-[230px]" tone="red" title="Physician Review" body="Flag for review&#10;High Priority" />

          <Node className="left-[36%] top-[640px] w-[300px]" tone="blue" title="END" body="Continue Personalized Journey" />
        </div>
      </CardContent>
    </Card>
  );
}

function CanvasLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#64748b" />
        </marker>
      </defs>

      <path d="M48% 58 L48% 75" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M48% 135 L48% 158 L15% 158 L15% 175" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <path d="M48% 135 L48% 175" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M48% 158 L76% 158 L76% 175" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

      <path d="M15% 240 L15% 260" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M48% 240 L48% 260" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M76% 240 L76% 260" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <path d="M15% 325 L15% 345" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <path d="M76% 325 L76% 345" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <path d="M15% 410 L15% 415 L48% 415 L48% 430" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <path d="M76% 410 L76% 415 L48% 415 L48% 430" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <path d="M48% 325 L48% 430" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

      <path d="M48% 500 L48% 520 L30% 520 L30% 535" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <path d="M48% 500 L48% 520 L68% 520 L68% 535" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

      <path d="M30% 600 L30% 622 L48% 622 L48% 640" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      <path d="M68% 600 L68% 622 L48% 622 L48% 640" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
    </svg>
  );
}

function Label({
  children,
  className,
  tone = "purple",
}: {
  children: React.ReactNode;
  className: string;
  tone?: "purple" | "green" | "red";
}) {
  const color =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "red"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-violet-50 text-violet-700 border-violet-200";

  return (
    <div className={`absolute rounded-md border px-2 py-1 text-[10px] font-bold ${color} ${className}`}>
      {children}
    </div>
  );
}

function Node({
  title,
  body,
  tone,
  className,
}: {
  title: string;
  body: string;
  tone: keyof typeof toneClasses;
  className: string;
}) {
  return (
    <div
      className={`absolute rounded-xl border p-3 text-xs shadow-[0_1px_3px_rgba(15,23,42,0.12)] ${toneClasses[tone]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-extrabold uppercase leading-4">{title}</p>
          <p className="mt-1 whitespace-pre-line font-semibold leading-5 text-slate-800">
            {body}
          </p>
        </div>
        <Grip className="h-4 w-4 opacity-70" />
      </div>
    </div>
  );
}

function NodeConfiguration() {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b p-0">
        <div className="grid grid-cols-2 text-xs font-bold">
          <button className="border-b-2 border-blue-600 px-4 py-3 text-blue-600">
            Node Configuration
          </button>
          <button className="px-4 py-3 text-slate-500">Journey Settings</button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 p-4 text-xs xl:grid-cols-2 2xl:grid-cols-3">
        <div className="rounded-xl border p-3">
          <p className="mb-3 text-[11px] font-bold text-slate-500">Selected Node</p>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-950">Quick Action</p>
              <p className="break-words text-slate-500">"I feel weak / low energy"</p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-bold text-slate-500">
              ID: QA-101
            </span>
          </div>
        </div>

        <PanelSection title="Description">
          User selects this option from quick action buttons.
        </PanelSection>

        <div>
          <PanelTitle title="Effects" />
          <div className="mt-2 space-y-2">
            {[
              ["Energy & Fatigue Pathway", "+24%"],
              ["Hydration Pathway", "+12%"],
              ["Sleep Optimization", "+6%"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span className="break-words font-medium text-slate-700">{label}</span>
                <span className="rounded-md bg-emerald-100 px-2 py-1 font-bold text-emerald-700">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <PanelTitle title="Triggers" />
          <div className="mt-2 space-y-2">
            {["Educational Block", "Product Matching AI", "Ingredient Optimization AI"].map((item) => (
              <div key={item} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <span className="break-words font-semibold text-slate-700">{item}</span>
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <PanelTitle title="Conditions" />
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded border bg-slate-50 px-2 py-1 font-semibold">
              Fatigue Level &gt; 6
            </span>
            <span className="rounded border bg-slate-50 px-2 py-1 font-semibold">
              Hydration Intake &lt; 64 oz
            </span>
          </div>
        </div>

        <div>
          <PanelTitle title="AI & Personalization" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span>Personalization Impact</span>
            <span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-700">High</span>
            <span>Confidence</span>
            <span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-700">94%</span>
          </div>
        </div>

        <div>
          <PanelTitle title="Governance" />
          <div className="mt-2 space-y-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
              Physician Approved
            </span>
            <p className="text-slate-600">Approved by Dr. Sarah Mitchell</p>
            <p className="text-slate-600">Approved On May 10, 2025</p>
          </div>
        </div>

        <Button variant="outline" className="h-auto min-h-10 whitespace-normal border-rose-200 text-rose-600 hover:bg-rose-50 xl:col-span-2 2xl:col-span-3">
          Delete Node
        </Button>
      </CardContent>
    </Card>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <p className="text-[11px] font-extrabold uppercase text-slate-500">{title}</p>;
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <PanelTitle title={title} />
      <p className="mt-2 leading-5 text-slate-700">{children}</p>
    </div>
  );
}

function JourneySimulation() {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold">Journey Simulation</CardTitle>
        <p className="text-xs text-slate-500">
          Test how the journey flows for a specific user scenario.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <select className="h-10 w-full rounded-lg border bg-white px-3 text-xs font-semibold text-slate-700">
          <option>User selects: I feel weak / low energy</option>
        </select>
        <Button className="h-auto min-h-10 w-full whitespace-normal bg-blue-600 text-xs font-bold text-white hover:bg-blue-700">
          Run Simulation
        </Button>
      </CardContent>
    </Card>
  );
}

function SimulationResults() {
  const steps = [
    ["Input Selected", "I feel weak / low energy"],
    ["Pathway Impact", "Energy +24%, Hydration +12%"],
    ["Plan Assigned", "GLP-1 Support Plan Priority: High"],
    ["AI Tasks Triggered", "Product Matching AI Optimization AI"],
    ["Follow-Up Created", "Check-in in 3 Days Assess Progress"],
  ];

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold">Simulation Results</CardTitle>
        <p className="text-xs font-bold text-emerald-600">Journey executed successfully</p>
      </CardHeader>

      <CardContent className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map(([title, body], index) => (
          <div key={title} className="min-w-0">
            <div className="h-full min-w-0 rounded-xl border bg-white p-3 text-xs">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-50 font-bold text-blue-700">
                {index + 1}
              </span>
              <p className="mt-3 break-words font-bold text-slate-900">{title}</p>
              <p className="mt-2 break-words leading-5 text-slate-500">{body}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LiveImpactPreview() {
  const items = [
    ["Pathway Weights", "5", "+2 changed"],
    ["Products", "6", "+3 changed"],
    ["Education", "7", "+4 changed"],
    ["AI Tasks", "8", "+5 changed"],
    ["Overall Impact", "✓", "+6 changed"],
  ];

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-bold">Live Impact Preview</CardTitle>
        <p className="text-xs text-slate-500">
          See how this change affects the user experience.
        </p>
      </CardHeader>

      <CardContent className="grid min-w-0 grid-cols-1 gap-3 p-4 text-center sm:grid-cols-2 xl:grid-cols-5">
        {items.map(([label, value, note]) => (
          <div key={label} className="min-w-0">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-[8px] border-emerald-200 bg-white text-sm font-bold text-slate-900">
              {value}
            </div>
            <p className="mt-2 break-words text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-semibold text-emerald-600">{note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FooterLegend() {
  const nodeTypes = [
    "Start / End",
    "Question",
    "Action",
    "AI / Intelligence",
    "Condition",
    "Content",
    "Follow-Up",
    "Escalation",
  ];

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-3 text-[11px] font-bold text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-900">Node Types</span>
          {nodeTypes.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-900">Connections</span>
          <span>──── Default Flow</span>
          <span>- - - Conditional Flow</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span>Journey ID: JRN-GLP1-ONB-001</span>
          <span>Version: 1.4</span>
          <span>Last Updated: May 22, 2025 9:41 AM</span>
          <span className="text-blue-600">View Change Log</span>
        </div>
      </CardContent>
    </Card>
  );
}
