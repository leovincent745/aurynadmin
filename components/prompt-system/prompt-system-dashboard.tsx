"use client";

import { useState } from "react";

import {
  BookOpen,
  Box,
  Brain,
  CheckCircle2,
  Coins,
  Database,
  FlaskConical,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kpis = [
  {
    label: "Total Prompts",
    value: "18",
    detail: "Active: 16 / In Review: 2",
    trend: "",
    icon: Box,
    tone: "blue",
  },
  {
    label: "Total Executions (30D)",
    value: "24,781",
    detail: "vs prior 30 days",
    trend: "+18.6%",
    icon: TrendingUp,
    tone: "emerald",
  },
  {
    label: "Avg. Success Rate",
    value: "94.7%",
    detail: "vs prior 30 days",
    trend: "+4.3%",
    icon: Target,
    tone: "violet",
  },
  {
    label: "Total Tokens (30D)",
    value: "182.4M",
    detail: "vs prior 30 days",
    trend: "+6.2%",
    icon: Coins,
    tone: "amber",
  },
  {
    label: "Physician Approval Rate",
    value: "96.2%",
    detail: "vs prior 30 days",
    trend: "+3.8%",
    icon: ShieldCheck,
    tone: "blue",
  },
];

const prompts = [
  ["Ingredient Intelligence AI", "Analyze ingredients, benefits, risks, thresholds, interactions & scoring", "Ingredient Analysis", "GPT-5", "96.2%", "3,842", "May 20, 2025"],
  ["Product Matching AI", "Find best product combinations and stack optimization", "Product Matching", "GPT-5", "94.1%", "4,126", "May 19, 2025"],
  ["Pathway Generation AI", "Generate pathway structure, symptoms, flows & logic", "Pathway Generation", "GPT-5", "95.3%", "2,971", "May 18, 2025"],
  ["Educational Generation AI", "Create educational blocks, onboarding content & guidance", "Content Generation", "GPT-4.1", "93.6%", "5,217", "May 18, 2025"],
  ["Behavioral Intelligence AI", "Analyze user behavior, drop-offs and adherence patterns", "Behavioral Analysis", "GPT-4.1", "92.8%", "3,103", "May 17, 2025"],
  ["Optimization Rules AI", "Generate optimization rules, dosage & simplification logic", "Optimization", "GPT-5", "95.0%", "2,184", "May 16, 2025"],
  ["Interaction Detection AI", "Detect ingredient/medication interactions & conflicts", "Safety & Interaction", "GPT-5", "97.1%", "2,640", "May 15, 2025"],
  ["Physician Report AI", "Generate physician-ready reports and justifications", "Reporting", "GPT-4.1", "92.3%", "1,298", "May 14, 2025"],
];

const flow = [
  ["Data Sources", "Products, ingredients, research, user data, pathway context", Database],
  ["Prompt Pipeline", "Specialized AI prompt executes targeted analysis", Brain],
  ["Structured Output", "Returns validated structured objects", Sparkles],
  ["Validation Engine", "Checks rules, thresholds, conflicts, and quality", ShieldCheck],
  ["Physician Review", "Human review, approval or modification", UserCheck],
  ["Activate", "Approved data goes live in the system", CheckCircle2],
];

const health = [
  ["Model API Connectivity", "Operational"],
  ["Rate Limits & Quotas", "Healthy"],
  ["Validation Engine", "Operational"],
  ["Data Quality", "Healthy"],
  ["Safety Filters", "Operational"],
  ["Cost Optimization", "Healthy"],
];

const promptPreviewTabs = [
  "Overview",
  "Prompt",
  "Inputs",
  "Outputs",
  "Validation",
  "History",
] as const;

type PromptPreviewTab = (typeof promptPreviewTabs)[number];

export function PromptSystemDashboard() {
  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Prompt System
          </h1>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
            Manage and govern the AI prompts that power pathway generation, optimization, and system learning.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
          <span className="col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700 sm:col-span-1">
            AI Engine Status: Healthy
          </span>
          <Button variant="outline" className="gap-2 px-3">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Library</span>
            <span className="sm:hidden">Library</span>
          </Button>
          <Button className="gap-2 bg-violet-600 px-3 hover:bg-violet-700">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Prompt</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden bg-white">
        <CardContent className="grid p-0 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex min-h-24 min-w-0 gap-3 border-b p-4 lg:border-b-0 lg:border-r last:border-r-0"
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneClasses[kpi.tone]}`}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
                <p className="mt-1 break-words text-xl font-semibold leading-tight text-slate-950 xl:text-2xl">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.trend ? <span className="font-semibold text-emerald-600">{kpi.trend} </span> : null}
                  {kpi.detail}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <PromptTable />
        <PromptPreview />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 min-[1440px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.55fr)]">
        <ExecutionFlow />
        <PerformancePanel />
        <HealthPanel />
      </div>
    </div>
  );
}

function PromptTable() {
  return (
    <Card className="min-w-0 overflow-hidden bg-white">
      <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base text-slate-950">Prompt Pipelines</CardTitle>
          <p className="text-xs text-slate-500">Intelligence pipelines that execute specialized AI tasks.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap lg:flex-nowrap">
          <select className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600">
            <option>All Status</option>
          </select>
          <select className="h-9 min-w-0 rounded-md border bg-white px-3 text-xs text-slate-600">
            <option>All Category</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9 w-full rounded-md border pl-8 pr-3 text-xs sm:w-40"
              placeholder="Search prompts..."
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y lg:hidden">
          {prompts.map((prompt, index) => (
            <div key={prompt[0]} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900">{prompt[0]}</p>
                    <p className="text-xs text-slate-400">
                      PROMPT-ING-{String(index + 1).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
              <p className="text-xs leading-5 text-slate-600">{prompt[1]}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <PromptMeta label="Category" value={prompt[2]} />
                <PromptMeta label="Model" value={prompt[3]} />
                <PromptMeta label="Success" value={prompt[4]} />
                <PromptMeta label="Executions" value={prompt[5]} />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1100px] table-auto text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-2 py-3 font-semibold">Prompt / Pipeline</th>
              <th className="px-2 py-3 font-semibold">Purpose</th>
              <th className="px-2 py-3 font-semibold">Category</th>
              <th className="px-2 py-3 font-semibold">Model</th>
              <th className="px-2 py-3 font-semibold">Status</th>
              <th className="px-2 py-3 font-semibold">Success</th>
              <th className="px-2 py-3 font-semibold">Runs</th>
              <th className="px-2 py-3 font-semibold">Updated</th>
              <th className="px-2 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {prompts.map((prompt, index) => (
              <tr key={prompt[0]} className="align-top">
                <td className="px-2 py-3 font-semibold text-slate-900">
                  <div className="flex min-w-0 gap-2">
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div className="min-w-0">
                      <p className="break-words">{prompt[0]}</p>
                      <p className="font-normal text-slate-400">PROMPT-ING-{String(index + 1).padStart(3, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-slate-600">
                  <p className="leading-5">{prompt[1]}</p>
                </td>
                <td className="px-2 py-3">
                  <span className="block break-words rounded bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                    {prompt[2]}
                  </span>
                </td>
                <td className="px-2 py-3 text-slate-700">
                  <p>{prompt[3]}</p>
                  <p className="text-slate-400">(Reasoning)</p>
                </td>
                <td className="px-2 py-3 text-emerald-600">Active</td>
                <td className="px-2 py-3 font-semibold text-slate-800">{prompt[4]}</td>
                <td className="px-2 py-3 text-slate-700">{prompt[5]}</td>
                <td className="px-2 py-3 text-slate-600"><p className="break-words">{prompt[6]}</p></td>
                <td className="px-2 py-3"><MoreHorizontal className="h-4 w-4 text-slate-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-slate-500">
          <span>Showing 1 to 8 of 18 pipelines</span>
          <span>{"<"} 1 2 3 {">"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PromptMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function PromptPreview() {
  const [activeTab, setActiveTab] = useState<PromptPreviewTab>("Overview");

  return (
    <Card className="bg-white">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-base text-slate-950">Prompt Details Preview</CardTitle>
        <p className="text-xs text-slate-500">Select a pipeline to view details and configuration.</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 xl:gap-x-5">
          {promptPreviewTabs.map((tab) => (
            <button
              key={tab}
              className={`relative whitespace-nowrap pb-2 ${
                activeTab === tab ? "text-violet-700" : "hover:text-slate-900"
              }`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
              {activeTab === tab ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
              ) : null}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 xl:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Ingredient Intelligence AI</h2>
              <p className="text-xs text-slate-500">PROMPT-ING-001</p>
            </div>
          </div>
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
        </div>

        <PromptPreviewTabContent activeTab={activeTab} />

        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline">Edit Prompt</Button>
          <Button variant="outline">View Full Prompt</Button>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700"><Play className="h-4 w-4" />Run Test</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PromptPreviewTabContent({ activeTab }: { activeTab: PromptPreviewTab }) {
  if (activeTab === "Overview") {
    return (
      <div className="grid min-w-0 gap-5 text-xs md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)]">
        <div>
          <p className="font-semibold text-slate-600">Purpose</p>
          <p className="mt-2 text-slate-700">
            Comprehensive analysis of ingredients including benefits, risks, thresholds,
            interactions, and pathway relevance scoring.
          </p>
          <p className="mt-4 font-semibold text-slate-600">What it does</p>
          <CheckList
            items={[
              "Identifies key beneficial ingredients",
              "Evaluates risks and contraindications",
              "Calculates optimal thresholds by sex and body weight",
              "Scores ingredient relevance to pathways",
              "Detects potential interactions",
            ]}
          />
        </div>
        <PromptConfigFacts />
      </div>
    );
  }

  if (activeTab === "Prompt") {
    return (
      <div className="rounded-lg border bg-slate-50 p-4 text-xs">
        <p className="font-semibold text-slate-700">System Instruction</p>
        <p className="mt-2 leading-5 text-slate-600">
          Analyze the ingredient profile for benefits, risks, dosage thresholds,
          interactions, pathway fit, and clinical review requirements. Return structured
          recommendations that can be reviewed by admins and physicians.
        </p>
        <p className="mt-4 font-semibold text-slate-700">Output Style</p>
        <p className="mt-2 leading-5 text-slate-600">
          Use concise clinical language, avoid unapproved claims, and flag any safety
          uncertainty for physician review.
        </p>
      </div>
    );
  }

  if (activeTab === "Inputs") {
    return (
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        {[
          ["Ingredient profile", "Name, dosage, source, and form"],
          ["User context", "Age, sex, goals, medications, symptoms"],
          ["Pathway context", "Active pathway, rules, products, and triggers"],
          ["Clinical constraints", "Thresholds, contraindications, and review flags"],
        ].map(([label, value]) => (
          <InfoBox key={label} label={label} value={value} />
        ))}
      </div>
    );
  }

  if (activeTab === "Outputs") {
    return (
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        {[
          ["Benefit summary", "Primary benefits and confidence score"],
          ["Risk summary", "Warnings, interactions, and escalation rules"],
          ["Optimization action", "Threshold changes or contribution adjustments"],
          ["Review status", "Admin approval or physician review requirement"],
        ].map(([label, value]) => (
          <InfoBox key={label} label={label} value={value} />
        ))}
      </div>
    );
  }

  if (activeTab === "Validation") {
    return (
      <div className="text-xs">
        <p className="font-semibold text-slate-600">Validation Checks</p>
        <CheckList
          items={[
            "Schema output matches required structure",
            "Dosage thresholds are within allowed limits",
            "Safety claims avoid prohibited language",
            "Physician review is requested for clinical changes",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      {[
        ["May 20, 2025", "Dr. Sarah Mitchell updated threshold guidance."],
        ["May 18, 2025", "Validation engine improved safety filter checks."],
        ["May 14, 2025", "Prompt moved from review to active status."],
      ].map(([date, event]) => (
        <div key={date} className="rounded-lg border bg-slate-50 p-3">
          <p className="font-semibold text-slate-800">{date}</p>
          <p className="mt-1 text-slate-600">{event}</p>
        </div>
      ))}
    </div>
  );
}

function PromptConfigFacts() {
  return (
    <div className="min-w-0 space-y-3">
      {[
        ["Model", "GPT-5 (Reasoning)"],
        ["Temperature", "0.2"],
        ["Max Tokens", "8,000"],
        ["Last Updated", "May 20, 2025"],
        ["Version", "v2.4"],
        ["Owner", "Dr. Sarah Mitchell"],
      ].map(([label, value]) => (
        <div key={label} className="flex min-w-0 justify-between gap-4">
          <span className="font-semibold text-slate-500">{label}</span>
          <span className="min-w-0 break-words text-right text-slate-800">{value}</span>
        </div>
      ))}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="mt-1 leading-5 text-slate-600">{value}</p>
    </div>
  );
}

function ExecutionFlow() {
  return (
    <Card className="bg-white lg:col-span-2 min-[1440px]:col-span-1">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Pipeline Execution Flow</CardTitle>
        <p className="text-xs text-slate-500">How intelligence flows through the system.</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {flow.map(([title, copy, Icon]) => (
            <div key={String(title)} className="min-w-0 rounded-lg border bg-slate-50 p-4 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-violet-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold leading-5 text-slate-950">{String(title)}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {String(copy)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          All pipelines are governed and monitored. AI suggests, physicians decide.
        </p>
      </CardContent>
    </Card>
  );
}

function PerformancePanel() {
  return (
    <Card className="min-w-0 bg-white">
      <CardHeader className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base text-slate-950">Performance by Pipeline (30D)</CardTitle>
        <Button variant="outline" size="sm">View Analytics</Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs">
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[minmax(12rem,1fr)_4.25rem_4.5rem_4.25rem] gap-3 border-b pb-2 text-[11px] font-semibold text-slate-500">
              <span>Pipeline</span>
              <span className="text-right">Success</span>
              <span className="text-center">Trend</span>
              <span className="text-right">Runs</span>
            </div>
            <div className="divide-y">
              {prompts.slice(0, 8).map((prompt) => (
                <div
                  key={prompt[0]}
                  className="grid grid-cols-[minmax(12rem,1fr)_4.25rem_4.5rem_4.25rem] items-center gap-3 py-2"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                    <span className="min-w-0 break-words leading-5 text-slate-700">{prompt[0]}</span>
                  </div>
                  <span className="text-right font-semibold text-slate-800">{prompt[4]}</span>
                  <span className="flex justify-center text-emerald-500">
                    <TrendLine />
                  </span>
                  <span className="text-right text-slate-700">{prompt[5]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendLine() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-14 text-emerald-500"
      fill="none"
      viewBox="0 0 56 20"
    >
      <path
        d="M1 14 L7 10 L13 12 L19 6 L25 9 L31 4 L37 8 L43 5 L49 11 L55 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function HealthPanel() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Pipeline Health Monitor</CardTitle>
        <p className="text-xs font-semibold text-emerald-600">All systems operational</p>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {health.map(([label, status]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="break-words">{label}</span>
            </span>
            <span className="font-semibold text-emerald-600">{status}</span>
          </div>
        ))}
        <Button variant="outline" className="mt-3 w-full">View System Logs</Button>
      </CardContent>
    </Card>
  );
}

const toneClasses: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};
