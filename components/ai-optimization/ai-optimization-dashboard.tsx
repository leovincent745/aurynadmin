import {
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  LineChart,
  MoreVertical,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdaptiveDashboardCard,
  AdaptiveDashboardGrid,
} from "@/components/ui/adaptive-dashboard-grid";
import { CommonMetrics, type Metric } from "@/components/ui/common-metrics";

const tasks = [
  ["Ingredient Intelligence AI", "Analyzing ingredient overlap and threshold optimization", "GLP-1 + Muscle Preservation", "Analyzing", "72%", "94%"],
  ["Product Matching AI", "Identifying best product combinations for weight loss + muscle retention", "GLP-1 Support Pathway", "Processing", "58%", "91%"],
  ["Behavioral Intelligence AI", "Evaluating user drop-off patterns in hydration journeys", "Hydration Onboarding Flow", "Analyzing", "64%", "88%"],
  ["Educational Content AI", "Optimizing educational sequence for GLP-1 users", "GLP-1 Education Blocks", "Reviewing", "48%", "86%"],
  ["Interaction Detection AI", "Scanning for potential ingredient and medication interactions", "All Active Stacks", "Validating", "36%", "96%"],
  ["Pathway Trend AI", "Detecting emerging symptom combinations and needs", "System Wide Analysis", "Collecting Data", "25%", "79%"],
];

export function AiOptimizationDashboard() {
  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">AI Optimization Center</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Continuous learning, intelligence discovery, and system improvement, always under physician control.
          </p>
        </div>
        <Button variant="outline" className="w-fit gap-2"><Bot className="h-4 w-4" />AI Engine Settings</Button>
      </header>

      <Kpis />
      <AdaptiveDashboardGrid>
        <AdaptiveDashboardCard size="large">
          <ActiveTasks />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="large">
          <Recommendations />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <Pipelines />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <SystemImprovement />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <LearningSources />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <ValidationStatus />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <Governance />
        </AdaptiveDashboardCard>
        <AdaptiveDashboardCard size="small">
          <ApprovalWorkflow />
        </AdaptiveDashboardCard>
      </AdaptiveDashboardGrid>
    </div>
  );
}

function Kpis() {
  const items: Metric[] = [
    { label: "Active AI Tasks", value: "12", detail: "Running now", icon: Users, tone: "blue" },
    {
      label: "Pending Reviews",
      value: "8",
      detail: "Awaiting your review",
      icon: ClipboardCheck,
      tone: "violet",
    },
    { label: "Learning Pipelines", value: "6", detail: "Active pipelines", icon: Bot, tone: "emerald" },
    {
      label: "Optimization Opportunities",
      value: "15",
      detail: "High impact",
      icon: Sparkles,
      tone: "violet",
    },
    {
      label: "Physician Validation Queue",
      value: "5",
      detail: "Requires approval",
      icon: ShieldCheck,
      tone: "blue",
    },
    {
      label: "System Improvement (30d)",
      value: "+18.6%",
      detail: "vs previous 30 days",
      icon: TrendingUp,
      tone: "blue",
    },
  ];

  return <CommonMetrics metrics={items} />;
}

function ActiveTasks() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div>
          <CardTitle className="text-sm text-slate-950">Active AI Tasks</CardTitle>
          <p className="text-xs text-slate-500">Real-time intelligence tasks being executed by specialized AI systems.</p>
        </div>
        <Button variant="outline" size="sm">View All Tasks</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-xs">
            <thead className="border-y bg-slate-50 text-slate-500">
              <tr>{["AI Pipeline", "Task Description", "Target Area", "Status", "Progress", "Confidence", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row[0]}</td>
                  <td className="px-4 py-3 text-slate-600">{row[1]}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{row[2]}</td>
                  <td className="px-4 py-3"><span className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-700">{row[3]}</span></td>
                  <td className="px-4 py-3"><Progress value={row[4]} /></td>
                  <td className="px-4 py-3"><span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{row[5]}</span></td>
                  <td className="px-4 py-3"><MoreVertical className="h-4 w-4 text-slate-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Progress({ value }: { value: string }) {
  return <div className="h-2 w-28 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: value }} /></div>;
}

function Recommendations() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-sm text-slate-950">AI Generated Recommendations</CardTitle>
        <Button variant="outline" size="sm">Sort by: Impact</Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {["Reduce Vitamin C Overlap", "Simplify Magnesium Sources", "Optimize Protein Priority"].map((title) => (
          <div key={title} className="grid gap-3 rounded-lg border p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Recommendation ready for review and physician-safe approval.</p>
            </div>
            <div className="text-xs text-slate-600">Expected impact: improved adherence and reduced operational burden.</div>
            <div className="grid grid-cols-3 gap-2 lg:w-56">
              <Button variant="outline" size="sm" className="text-emerald-700">Approve</Button>
              <Button variant="outline" size="sm">Modify</Button>
              <Button variant="outline" size="sm" className="text-rose-700">Reject</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LearningSources() {
  const rows = ["User Engagement Data", "Adherence & Compliance", "Physician Edits & Feedback", "Optimization Outcomes", "Pathway Combinations", "Product Performance", "User Feedback & Surveys"];
  return <ListPanel title="Learning Sources" rows={rows} footer="View All Learning Sources" />;
}

function ValidationStatus() {
  return <ListPanel title="Validation Engine Status" rows={["Interaction Checks", "Threshold Validation", "Duplicate Detection", "Claim Verification", "Data Quality Score 96/100"]} footer="View Validation Details" />;
}

function Pipelines() {
  return <ListPanel title="Intelligence Pipelines" rows={["Ingredient Analysis", "Educational Generation", "Product Matching", "Interaction Detection", "Behavioral Optimization", "Trend & Pattern Discovery"]} />;
}

function SystemImprovement() {
  return <ListPanel title="System Improvement Overview (30 Days)" rows={["Recommendations Generated 156", "Approved & Activated 112", "Adherence Improvement +18.6%", "Avg. Confidence Score 89%"]} />;
}

function Governance() {
  return <ListPanel title="Physician Governance" rows={["87% Approval Rate", "Approved 112", "Modified 12", "Rejected 4", "Pending 8"]} footer="View Governance History" />;
}

function ApprovalWorkflow() {
  return <ListPanel title="Approval Workflow" rows={["AI Suggestion Generated", "Validation Engine Review", "Pending Physician Review", "Approved & Activated"]} footer="View All Approval Queue" />;
}

function ListPanel({ title, rows, footer }: { title: string; rows: string[]; footer?: string }) {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4"><CardTitle className="text-sm text-slate-950">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span className="flex min-w-0 items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="break-words">{row}</span>
            </span>
            {title === "System Improvement Overview (30 Days)" ? <LineChart className="h-4 w-4 text-emerald-500" /> : null}
            {title === "Physician Governance" ? <Gauge className="h-4 w-4 text-violet-500" /> : null}
          </div>
        ))}
        {footer ? <Button variant="ghost" className="w-full text-blue-600">{footer}</Button> : null}
      </CardContent>
    </Card>
  );
}
