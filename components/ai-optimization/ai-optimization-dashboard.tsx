"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Gauge,
  MoreVertical,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kpis = [
  { label: "Active AI Tasks", value: "12", note: "Running now", icon: Users },
  { label: "Pending Reviews", value: "8", note: "Awaiting your review", icon: ClipboardCheck },
  { label: "Learning Pipelines", value: "6", note: "Active pipelines", icon: Database },
  { label: "Optimization Opportunities", value: "15", note: "High impact", icon: Sparkles },
  { label: "Physician Validation Queue", value: "5", note: "Requires approval", icon: ShieldCheck },
  { label: "System Improvement (30d)", value: "+18.6%", note: "vs previous 30 days", icon: TrendingUp },
];

const tasks = [
  ["Ingredient Intelligence AI", "Analyzing ingredient overlap and threshold optimization", "GLP-1 + Muscle Preservation", "Analyzing", "72%", "94%", "2 min ago"],
  ["Product Matching AI", "Identifying best product combinations for weight loss + muscle retention", "GLP-1 Support Pathway", "Processing", "58%", "91%", "5 min ago"],
  ["Behavioral Intelligence AI", "Evaluating user drop-off patterns in hydration journeys", "Hydration Onboarding Flow", "Analyzing", "64%", "88%", "7 min ago"],
  ["Educational Content AI", "Optimizing educational sequence for GLP-1 users", "GLP-1 Education Blocks", "Reviewing", "48%", "86%", "10 min ago"],
  ["Interaction Detection AI", "Scanning for potential ingredient and medication interactions", "All Active Stacks", "Validating", "36%", "96%", "11 min ago"],
  ["Pathway Trend AI", "Detecting emerging symptom combinations and needs", "System Wide Analysis", "Collecting Data", "25%", "79%", "13 min ago"],
];

const recommendations = [
  {
    badge: "High Impact",
    badgeClass: "bg-rose-50 text-rose-600",
    title: "Reduce Vitamin C Overlap",
    issue: "Detected excess Vitamin C from multiple sources in GLP-1 + Hydration stack.",
    recommendation: "Remove 500mg Vitamin C from Hydration Formula. Maintain total daily intake within optimal range.",
    impact: ["18% pill burden", "12% adherence", "Maintain efficacy"],
    confidence: "91%",
    strength: "High",
  },
  {
    badge: "Medium Impact",
    badgeClass: "bg-orange-50 text-orange-600",
    title: "Simplify Magnesium Sources",
    issue: "Multiple magnesium forms detected that can be consolidated without reducing benefit.",
    recommendation: "Replace 2 products with single, optimized magnesium blend.",
    impact: ["15% pill burden", "10% adherence", "Cost optimization"],
    confidence: "89%",
    strength: "Medium",
  },
  {
    badge: "Opportunity",
    badgeClass: "bg-amber-50 text-amber-600",
    title: "Optimize Protein Priority",
    issue: "Users with rapid weight loss respond better to protein-first education and higher protein intake.",
    recommendation: "Increase protein education priority in onboarding flow and suggest higher protein intake.",
    impact: ["22% engagement", "14% muscle retention", "Better outcomes"],
    confidence: "87%",
    strength: "Medium",
  },
];

export function AiOptimizationDashboard() {
  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">AI Optimization Center</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Continuous learning, intelligence discovery, and system improvement - always under physician control.
          </p>
        </div>

        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          AI Engine Settings
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((item) => (
          <Card key={item.label} className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
                <p className="text-xs text-slate-500">{item.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <Card className="min-w-0 rounded-xl bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between p-5">
            <div>
              <CardTitle className="text-base font-bold">Active AI Tasks</CardTitle>
              <p className="text-xs text-slate-500">
                Real-time intelligence tasks being executed by specialized AI systems.
              </p>
            </div>
            <Button size="sm" variant="outline">View All Tasks</Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-0 text-left text-xs">
                <thead className="border-y bg-slate-50 text-slate-500">
                  <tr>
                    {["AI Pipeline", "Task Description", "Target Area", "Status", "Progress", "Confidence", "Started", ""].map((head) => (
                      <th key={head} className="px-5 py-3 font-bold">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map((row) => (
                    <tr key={row[0]} className="hover:bg-slate-50">
                      <td className="max-w-44 break-words px-5 py-4 font-bold text-slate-800">{row[0]}</td>
                      <td className="max-w-60 break-words px-5 py-4 leading-5 text-slate-600">{row[1]}</td>
                      <td className="max-w-44 break-words px-5 py-4 font-semibold leading-5 text-slate-700">{row[2]}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">{row[3]}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Progress value={row[4]} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{row[5]}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-600">{row[6]}</td>
                      <td className="px-5 py-4">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <SidePanel />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <Recommendations />
        <ValidationPanel />
      </section>

      <section className="grid min-w-0 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        <MiniCard title="Intelligence Pipelines" rows={["Ingredient Analysis", "Product Matching", "Behavioral Optimization", "Educational Generation", "Interaction Detection", "Trend & Pattern Discovery"]} />
        <MiniCard title="System Improvement Overview" rows={["Recommendations Generated 156", "Approved & Activated 112", "Adherence Improvement +18.6%", "Avg. Confidence Score 89%"]} icon={BarChart3} />
        <MiniCard title="Physician Governance" rows={["87% Approval Rate", "Approved 112", "Modified 12", "Rejected 4", "Pending 8"]} icon={Gauge} />
        <MiniCard title="Approval Workflow" rows={["AI Suggestion Generated", "Validation Engine Review", "Pending Physician Review", "Approved & Activated"]} />
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          All AI systems operate under physician governance. You are always in control.
        </span>
        <Button variant="outline" size="sm" className="bg-white text-blue-600">
          Learn More About Our AI Governance
        </Button>
      </div>
    </div>
  );
}

function Progress({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: value }} />
      </div>
      <span className="font-bold text-slate-600">{value}</span>
    </div>
  );
}

function SidePanel() {
  const rows = [
    ["User Engagement Data", "48,392 data points", "+12.4%"],
    ["Adherence & Compliance", "32,118 data points", "+8.7%"],
    ["Physician Edits & Feedback", "1,246 data points", "+15.2%"],
    ["Optimization Outcomes", "18,765 data points", "+11.3%"],
    ["Pathway Combinations", "9,886 data points", "+9.8%"],
    ["Product Performance", "14,221 data points", "+10.6%"],
    ["User Feedback & Surveys", "6,379 data points", "+13.1%"],
  ] as const;

  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold">Learning Sources</CardTitle>
        <p className="text-xs text-slate-500">AI learns from multiple data sources.</p>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        {rows.map(([row, count, change]) => (
          <div key={row} className="flex items-center gap-3">
            <span className="flex min-w-0 flex-1 items-center gap-3 text-sm font-semibold text-slate-700">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="break-words">{row}</span>
            </span>
            <span className="whitespace-nowrap text-xs font-semibold text-slate-500">{count}</span>
            <span className="whitespace-nowrap text-xs font-bold text-emerald-600">{change}</span>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-blue-600">View All Learning Sources</Button>
      </CardContent>
    </Card>
  );
}

function Recommendations() {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-5">
        <div>
          <CardTitle className="text-base font-bold">AI Generated Recommendations</CardTitle>
          <p className="text-xs text-slate-500">Intelligence-based recommendations ready for your review.</p>
        </div>
        <Button size="sm" variant="outline">Sort by: Impact</Button>
      </CardHeader>

      <CardContent className="space-y-3 p-5 pt-0">
        {recommendations.map((item) => (
          <div key={item.title} className="grid min-w-0 gap-4 rounded-xl border p-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.65fr)_minmax(0,13rem)] xl:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className={`rounded px-2 py-1 text-xs font-bold ${item.badgeClass}`}>{item.badge}</span>
                <h3 className="mt-2 break-words font-bold text-slate-950">{item.title}</h3>
                <p className="mt-1 break-words text-xs leading-5 text-slate-500">{item.issue}</p>
              </div>
            </div>

            <div className="min-w-0 text-xs leading-5 text-slate-600">
              <p className="font-bold text-slate-800">Recommendation</p>
              <p className="break-words">{item.recommendation}</p>
            </div>

            <div className="text-xs leading-5 text-slate-600">
              <p className="font-bold text-slate-800">Expected Impact</p>
              {item.impact.map((impact) => (
                <p key={impact} className="font-semibold text-emerald-600">+ {impact}</p>
              ))}
            </div>

            <div className="text-center text-xs font-semibold text-slate-600">
              <p className="text-lg font-bold text-slate-950">{item.confidence}</p>
              <p>Evidence Strength</p>
              <p className="mt-2 rounded bg-emerald-50 px-2 py-1 text-emerald-700">{item.strength}</p>
            </div>

            <div className="grid gap-2">
              <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                Approve
              </span>
              <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">Modify</Button>
              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">Send to Physician</Button>
              <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800">Reject</Button>
            </div>
          </div>
        ))}
        <div className="flex justify-center">
          <Button size="sm" variant="outline" className="text-blue-600">View All Recommendations</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ValidationPanel() {
  return (
    <Card className="rounded-xl bg-white shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold">Validation Engine Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        {["Interaction Checks", "Threshold Validation", "Duplicate Detection", "Claim Verification"].map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-slate-800">{item}</p>
              <p className="text-xs text-slate-500">No critical issues found</p>
            </div>
          </div>
        ))}

        <div>
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span>Data Quality Score</span>
            <span>96/100</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 w-[96%] rounded-full bg-emerald-500" />
          </div>
        </div>

        <Button variant="ghost" className="w-full text-blue-600">View Validation Details</Button>
      </CardContent>
    </Card>
  );
}

function MiniCard({
  title,
  rows,
  icon: Icon = CheckCircle2,
}: {
  title: string;
  rows: string[];
  icon?: React.ElementType;
}) {
  if (title === "Physician Governance") {
    return (
      <Card className="min-w-0 rounded-xl bg-white shadow-sm">
        <CardHeader className="p-5">
          <CardTitle className="break-words text-base font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4 p-5 pt-0 md:grid-cols-[7.5rem_minmax(0,1fr)] md:items-center 2xl:grid-cols-1">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[conic-gradient(#22c55e_0_87%,#f59e0b_87%_92%,#e5e7eb_92%_100%)] p-3">
            <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
              <span>
                <span className="block text-2xl font-bold text-slate-950">87%</span>
                <span className="text-xs font-semibold text-slate-500">Approval Rate</span>
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm font-semibold text-slate-700">
            {["Approved 112 (87%)", "Modified 12 (9%)", "Rejected 4 (3%)", "Pending 8 (6%)"].map((row) => (
              <div key={row} className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="min-w-0 break-words">{row}</span>
              </div>
            ))}
            <Button variant="ghost" className="h-auto min-h-9 w-full whitespace-normal break-words text-center leading-5 text-blue-600">
              View Governance History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (title === "Approval Workflow") {
    return (
      <Card className="min-w-0 rounded-xl bg-white shadow-sm">
        <CardHeader className="p-5">
          <CardTitle className="break-words text-base font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {[
            ["AI Suggestion Generated", "By specialized AI pipeline"],
            ["Validation Engine Review", "Auto-validated for safety & accuracy"],
            ["Pending Physician Review", "Awaiting your approval"],
            ["Approved & Activated", "Live in the system"],
          ].map(([label, detail], index) => (
            <div key={label} className="relative flex gap-3 pb-4 last:pb-0">
              {index < 3 ? <span className="absolute left-[9px] top-5 h-full w-px bg-slate-200" /> : null}
              <span className="relative z-10 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-emerald-500 bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block break-words text-sm font-bold text-slate-800">{label}</span>
                <span className="block break-words text-xs leading-5 text-slate-500">{detail}</span>
              </span>
            </div>
          ))}
          <Button variant="ghost" className="h-auto min-h-9 w-full whitespace-normal break-words text-center leading-5 text-blue-600">
            View All Approval Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 rounded-xl bg-white shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="break-words text-base font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0">
        {rows.map((row) => (
          <div key={row} className="flex min-w-0 items-center justify-between gap-3 text-sm font-semibold text-slate-700">
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="min-w-0 break-words">{row}</span>
            </span>
            {title === "System Improvement Overview" ? <MiniBarChart /> : <Activity className="h-4 w-4 shrink-0 text-emerald-500" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MiniBarChart() {
  return (
    <svg aria-hidden="true" className="h-8 w-16 shrink-0 text-emerald-500" viewBox="0 0 64 32" fill="none">
      <path d="M2 24 L10 18 L18 20 L26 12 L34 15 L42 9 L50 14 L62 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
