"use client";

import {
  Activity,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Droplet,
  Eye,
  FlaskConical,
  Gauge,
  PackageCheck,
  Search,
  Settings,
  Sparkles,
  User,
  UserCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weights = [
  ["GLP-1 Support", "91%", "bg-emerald-500", PackageCheck],
  ["Muscle Preservation", "84%", "bg-blue-500", UserCircle],
  ["Hydration Support", "66%", "bg-violet-500", Droplet],
  ["Energy & Fatigue", "59%", "bg-orange-500", Zap],
  ["Digestive Health", "32%", "bg-cyan-500", FlaskConical],
  ["Sleep Optimization", "21%", "bg-indigo-500", Sparkles],
] as const;

const flow = [
  ["User Inputs", "Assessment\nSymptoms\nGoals", User],
  ["Pathway Scoring", "AI calculates\npathway weights", Gauge],
  ["Plan Selection", "Best plan +\nadd-ons selected", PackageCheck],
  ["Ingredient Merge", "Ingredients\ncombined & normalized", ClipboardCheck],
  ["Optimization Engine", "Overlaps removed\nDoses adjusted", Settings],
  ["AI Personalization", "Experience personalized\nin real-time", Brain],
  ["Final Experience", "Delivered to user", CalendarDays],
] as const;

const educationItems = [
  ["Hydration First", "Prioritized because: GLP-1 usage, low water intake, fatigue", "Now"],
  ["Protein Preservation", "Important for muscle retention during weight loss", "Next"],
  ["Energy Management", "Addresses fatigue and energy dips", "Later"],
  ["Mindful Eating", "Supports appetite control and habits", "Later"],
] as const;

export function LiveUserOrchestrationDashboard() {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Live User Orchestration Engine
          </h1>
          <p className="mt-1 max-w-5xl text-sm font-medium leading-6 text-slate-600">
            Real-time orchestration of pathways, plans, education, products and optimizations tailored to each user.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2"><Search className="h-4 w-4" />User Search</Button>
          <Button variant="outline" className="gap-2"><User className="h-4 w-4" />Impersonate User</Button>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700">Actions <ChevronDown className="h-4 w-4" /></Button>
        </div>
      </header>

      <UserSummary />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.9fr)]">
        <PathwayWeighting />
        <PlanAssembly />
        <OrchestrationFlow />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.95fr)]">
        <EducationFlow />
        <ProductOptimization />
        <AiPersonalization />
        <PhysicianGovernance />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <UserExperiencePreview />
        <ImpactOutcomes />
      </div>
    </div>
  );
}

function UserSummary() {
  return (
    <Card className="bg-white">
      <CardContent className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1.35fr] xl:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-100 to-rose-100 text-xl font-semibold text-slate-700">
            SM
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-950">Sarah M.</h2>
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-600">Female, 42 yrs · 162 lbs · 5&apos;6&quot;</p>
            <p className="mt-1 text-xs text-slate-500">Member since Jan 12, 2025</p>
          </div>
        </div>
        <SummaryItem icon={Sparkles} label="Primary Goal" value="Healthy Weight Loss" />
        <SummaryItem icon={Activity} label="Current Phase" value="Weight Loss" detail="Week 4 of 12" />
        <SummaryItem icon={CalendarDays} label="Last Check-in" value="May 20, 2025" detail="2 days ago" />
        <SummaryItem icon={Gauge} label="Adherence Score" value="87%" detail="Good" />
        <Button variant="outline" className="h-full min-h-14 justify-start gap-3 text-left">
          <Eye className="h-5 w-5 text-blue-600" />
          <span><span className="block font-semibold">View Full Profile</span><span className="text-xs text-slate-500">Complete user profile and history</span></span>
        </Button>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ icon: Icon, label, value, detail }: { icon: typeof User; label: string; value: string; detail?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 xl:border-l xl:pl-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="break-words text-sm font-semibold text-slate-950">{value}</p>
        {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
      </div>
    </div>
  );
}

function PathwayWeighting() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="1" />Pathway Weighting Engine</CardTitle>
        <p className="text-xs text-slate-500">AI calculated pathway importance based on user data.</p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {weights.map(([label, value, bar, Icon]) => (
          <div key={label} className="grid grid-cols-[1fr_7rem_3rem] items-center gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
              <Icon className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="break-words">{label}</span>
            </span>
            <span className="h-2 rounded-full bg-slate-100">
              <span className={`block h-2 rounded-full ${bar}`} style={{ width: value }} />
            </span>
            <span className="text-right font-semibold text-slate-700">{value}</span>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-blue-600">View Pathway Details</Button>
      </CardContent>
    </Card>
  );
}

function PlanAssembly() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="2" />Active Plan Assembly</CardTitle>
        <p className="text-xs text-slate-500">Plans and add-ons selected for this user.</p>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0 md:grid-cols-2">
        {["GLP-1 Muscle Preservation Plan", "Hydration Support Plan", "Energy Recovery Plan"].map((plan) => (
          <div key={plan} className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-500" />
              <p className="text-xs font-semibold text-slate-900">{plan}</p>
              <span className="ml-auto rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Active</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Best match for goals</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Physician approved</li>
            </ul>
          </div>
        ))}
        <Button variant="ghost" className="md:col-span-2 text-blue-600">View Plan Details</Button>
      </CardContent>
    </Card>
  );
}

function OrchestrationFlow() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="3" />Orchestration Flow</CardTitle>
        <p className="text-xs text-slate-500">Real-time orchestration process and status.</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <div className="flex min-w-[54rem] items-start justify-between gap-3">
            {flow.map(([title, copy, Icon], index) => (
              <div key={title} className="contents">
                <div className="w-28 shrink-0 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 whitespace-pre-line text-[11px] leading-5 text-slate-500">{copy}</p>
                </div>
                {index < flow.length - 1 ? <span className="mt-6 text-slate-400">→</span> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 rounded-lg border bg-slate-50 p-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Orchestration Status: <span className="text-emerald-600">Complete</span></span>
          <span>Last Run: May 22, 2025 9:41 AM</span>
          <Button variant="outline" size="sm">View Orchestration Log</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EducationFlow() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="4" />Educational Flow Engine</CardTitle>
        <p className="text-xs text-slate-500">Personalized education sequence for maximum impact.</p>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0 lg:grid-cols-[1fr_12rem]">
        <div className="space-y-2">
          {educationItems.map(([title, copy, status], index) => (
            <div key={title} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900">{title}</span>
                <span className="block text-[11px] text-slate-500">{copy}</span>
              </span>
              <span className="rounded border px-2 py-1 text-[11px] font-semibold text-slate-600">{status}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Metric label="Engagement Rate" value="92%" />
          <Metric label="Completion Rate" value="78%" />
          <Metric label="Retention Score" value="84%" />
          <Button variant="ghost" className="w-full text-blue-600">View Education Analytics</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductOptimization() {
  return (
    <SimplePanel
      step="5"
      title="Product Optimization"
      subtitle="Products selected, adjusted and removed."
      rows={["Hydration Formula - 2 servings/day", "GLP-1 Support Formula - 2 servings/day", "Protein Plus - 1 serving/day", "Magnesium Complex - Removed", "Energy Boost - Removed"]}
    />
  );
}

function AiPersonalization() {
  return (
    <SimplePanel
      step="6"
      title="AI Personalization"
      subtitle="How AI tailored this experience."
      rows={["Reduced pill burden by 3 capsules", "Adjusted hydration emphasis", "Modified dosing times", "Simplified onboarding", "AI Confidence Score: 92%"]}
    />
  );
}

function PhysicianGovernance() {
  return (
    <SimplePanel
      step="7"
      title="Physician Governance"
      subtitle="Physician oversight and approval status."
      rows={["Dr. James Mitchell - Approved", "Dr. Sarah Mitchell - Approved", "Overall Governance: operating under physician governance"]}
    />
  );
}

function SimplePanel({ step, title, subtitle, rows }: { step: string; title: string; subtitle: string; rows: string[] }) {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value={step} />{title}</CardTitle>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3 rounded-lg border p-3 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="min-w-0 break-words font-semibold text-slate-700">{row}</span>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-blue-600">View Details</Button>
      </CardContent>
    </Card>
  );
}

function UserExperiencePreview() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="8" />User Experience Preview</CardTitle>
        <p className="text-xs text-slate-500">What the user sees in their app right now.</p>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0 md:grid-cols-[11rem_1fr]">
        <div className="rounded-[1.5rem] border-4 border-slate-900 bg-slate-50 p-3">
          <p className="text-lg font-semibold text-slate-950">Good morning, Sarah!</p>
          <p className="mt-1 text-xs text-slate-500">You&apos;re on track today.</p>
          <div className="mt-5 rounded-lg bg-white p-3 text-xs shadow-sm">Today&apos;s Focus: Hydration First</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["Quick Actions", "Today&apos;s Plan", "Education", "Upcoming"].map((title) => (
            <div key={title} className="rounded-lg border p-3">
              <p className="text-xs font-semibold text-slate-900" dangerouslySetInnerHTML={{ __html: title }} />
              <p className="mt-3 text-xs leading-5 text-slate-500">Hydration Formula, check-in, weekly review, and education card.</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactOutcomes() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-slate-950"><Step value="9" />Impact & Outcomes <span className="text-xs text-slate-500">(to date)</span></CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Weight Change", "-6.2 lbs"],
          ["Energy Level", "+32%"],
          ["Hydration Score", "78%"],
          ["Adherence", "87%"],
          ["Symptom Improvement", "+64%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
            <TrendLine />
          </div>
        ))}
        <Button variant="ghost" className="sm:col-span-2 xl:col-span-5 text-blue-600">View Full Outcomes Dashboard</Button>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <BarChart3 className="mx-auto h-5 w-5 text-emerald-500" />
      <p className="mt-2 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Step({ value }: { value: string }) {
  return <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-600 text-[11px] font-bold text-white">{value}</span>;
}

function TrendLine() {
  return (
    <svg aria-hidden="true" className="mt-4 h-8 w-full text-emerald-500" fill="none" viewBox="0 0 120 32">
      <path d="M2 25 L14 20 L26 22 L38 13 L50 16 L62 8 L74 13 L86 7 L98 15 L118 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}
