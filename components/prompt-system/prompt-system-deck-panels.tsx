"use client";

import {
  Brain,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Deck-only visuals — not wired to backend in Step 1. */

const flow = [
  ["Data Sources", "Products, ingredients, research, user data, pathway context", Database],
  ["Prompt Pipeline", "Specialized AI prompt executes targeted analysis", Brain],
  ["Structured Output", "Returns validated structured objects", Sparkles],
  ["Validation Engine", "Checks rules, thresholds, conflicts, and quality", ShieldCheck],
  ["Physician Review", "Human review, approval or modification", UserCheck],
  ["Activate", "Approved data goes live in the system", CheckCircle2],
] as const;

const health = [
  ["Model API Connectivity", "Operational"],
  ["Rate Limits & Quotas", "Healthy"],
  ["Validation Engine", "Operational"],
  ["Data Quality", "Healthy"],
  ["Safety Filters", "Operational"],
  ["Cost Optimization", "Healthy"],
] as const;

export function ExecutionFlow() {
  return (
    <Card className="bg-white lg:col-span-2 min-[1440px]:col-span-1">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Pipeline Execution Flow</CardTitle>
        <p className="text-xs text-slate-500">Deck reference — future orchestration phases.</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {flow.map(([title, copy, Icon]) => (
            <div key={title} className="min-w-0 rounded-lg border bg-slate-50 p-4 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-violet-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold leading-5 text-slate-950">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformancePanel() {
  return (
    <Card className="min-w-0 bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Performance (deck preview)</CardTitle>
        <p className="text-xs text-slate-500">Full multi-pipeline analytics are out of Step 1 scope.</p>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs text-slate-500">
        Use AI Optimization Center for real chat and safety event logs.
      </CardContent>
    </Card>
  );
}

export function HealthPanel() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Pipeline Health Monitor</CardTitle>
        <p className="text-xs font-semibold text-emerald-600">Deck placeholder</p>
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
      </CardContent>
    </Card>
  );
}
