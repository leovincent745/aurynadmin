import {
  Beaker,
  Box,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crosshair,
  Edit,
  FileText,
  FlaskConical,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PathwayMetrics } from "@/components/pathways/pathway-metrics";
import { PathwayPageHeader } from "@/components/pathways/pathway-page-header";
import { PathwayTabs } from "@/components/pathways/pathway-tabs";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface RootPathwayOverviewProps {
  pathway: RootPathway;
}

export function RootPathwayOverview({ pathway }: RootPathwayOverviewProps) {
  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PathwayPageHeader pathway={pathway} />
      <PathwayMetrics pathway={pathway} />
      <PathwayTabs />
      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-4">
          <OverviewAndStructure pathway={pathway} />
          <PlansAndProtocols />
        </div>
        <PathwaySidebar />
      </div>
      <BottomAnalytics />
    </div>
  );
}

function OverviewAndStructure({ pathway }: RootPathwayOverviewProps) {
  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="grid gap-0 p-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 border-b p-4 sm:p-5 xl:border-b-0 xl:border-r">
          <h2 className="text-sm font-semibold text-slate-950">About This Pathway</h2>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            GLP-1 medications can significantly improve health outcomes. This pathway provides
            structured plans and guidance to help users optimize results, preserve lean mass,
            manage side effects, and build sustainable habits.
          </p>
          <TagGroup
            title="Primary Goals"
            items={["Preserve Muscle", "Manage Side Effects", "Optimize Nutrition", "Hydration"]}
          />
          <TagGroup
            title="Common Challenges Addressed"
            items={["Nausea", "Low Energy", "Loss of Appetite", "Muscle Loss", "Dehydration"]}
          />
          <TagGroup
            title="Related Pathways"
            items={pathway.relatedPathways.map((related) => related.name)}
            accent
          />
        </section>

        <section className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-950">Pathway Structure</h2>
            <Button variant="outline" size="sm" className="w-fit">
              View Full Diagram
            </Button>
          </div>
          <div className="mt-6 w-full min-w-0 max-w-full pb-2">
            <div className="flex w-full flex-wrap items-start justify-center gap-x-4 gap-y-6 xl:flex-nowrap xl:justify-between">
            {structureSteps.map((step, index) => (
              <div key={step.label} className="flex shrink-0 items-start gap-2">
                <div className="w-20 text-center">
                  <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${step.tone}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <p className="mx-auto mt-2 max-w-20 break-words text-[11px] font-semibold leading-4 text-slate-950">
                    {step.label}
                  </p>
                </div>
                {index < structureSteps.length - 1 ? (
                  <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-slate-500" />
                ) : null}
              </div>
            ))}
            </div>
          </div>
          <p className="mt-6 text-xs leading-5 text-slate-600">
            This pathway uses multiple plans and protocols. Each plan contains a curated set of
            products that contribute ingredients. Our engine optimizes everything into one
            personalized plan for the user.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

function TagGroup({
  title,
  items,
  accent = false,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
              accent ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-600"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlansAndProtocols() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div>
          <CardTitle className="text-sm text-slate-950">Active Plans & Protocols</CardTitle>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
            These plans are available within this pathway. Users are matched to the most
            appropriate plan based on their needs and goals.
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-fit gap-2">
          <Plus className="h-4 w-4" />
          Create New Plan
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1500px]:grid-cols-5">
          {plans.map((plan) => (
            <article key={plan.title} className="flex min-w-0 flex-col rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${plan.badgeClass}`}>
                  {plan.badge}
                </span>
                <Star className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              <h3 className="mt-3 text-[13px] font-semibold leading-5 text-slate-950">{plan.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-5 text-slate-600">{plan.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <PlanFact icon={CalendarDays} label="Duration" value={plan.duration} />
                <PlanFact icon={Package} label="Products" value={plan.products} />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Focus</p>
              <p className="mt-1 text-xs leading-5 text-slate-700">{plan.focus}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
                <Button variant="ghost" size="sm" className="px-0 text-blue-600 hover:text-blue-700">
                  View Plan
                </Button>
              </div>
            </article>
          ))}
        </div>
        <Button variant="ghost" className="mx-auto mt-4 flex text-blue-600 hover:text-blue-700">
          View All Plans & Protocols
        </Button>
      </CardContent>
    </Card>
  );
}

function PlanFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PathwaySidebar() {
  return (
    <aside className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-1">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
          <CardTitle className="text-sm text-slate-950">Pathway Details</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 pt-0 text-xs sm:grid-cols-2 sm:p-5 sm:pt-0">
          <Detail label="Category" value="Metabolic Health" />
          <Detail label="Priority" value="High" badgeClass="bg-rose-50 text-rose-700" />
          <Detail label="Complexity" value="Advanced" badgeClass="bg-violet-50 text-violet-700" />
          <Detail label="Default Duration" value="90 Days" />
          <Detail label="Target Audience" value="GLP-1 Medication Users" />
          <Detail label="Created" value="Apr 10, 2025 by Alicia Admin" />
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
          <CardTitle className="text-sm text-slate-950">Top Signals / Triggers</CardTitle>
          <Button variant="outline" size="sm">Manage</Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
          {signals.map((signal) => (
            <div key={signal} className="flex items-start gap-3 text-xs text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="leading-5">{signal}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white lg:col-span-2 2xl:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
          <CardTitle className="text-sm text-slate-950">AI Pathway Summary</CardTitle>
          <Sparkles className="h-5 w-5 text-violet-500" />
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <p className="text-xs leading-5 text-slate-600">
            Users following this pathway typically see best results when protein intake is
            optimized, hydration is prioritized, and strength is maintained. The combination of
            protein support, hydration, and micronutrients shows the highest adherence and positive
            outcomes.
          </p>
          <Button variant="outline" size="sm" className="mt-4 gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4" />
            Regenerate Summary
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

function Detail({
  label,
  value,
  badgeClass,
}: {
  label: string;
  value: string;
  badgeClass?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      {badgeClass ? (
        <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <p className="mt-1 break-words font-semibold text-slate-800">{value}</p>
      )}
    </div>
  );
}

function BottomAnalytics() {
  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="grid p-0 sm:grid-cols-2 xl:grid-cols-5">
        {bottomMetrics.map((metric) => (
          <div key={metric.label} className="flex min-h-24 gap-4 border-b p-4 xl:border-b-0 xl:border-r last:border-r-0">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${metric.tone}`}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-600">{metric.label}</p>
              <p className="mt-1 break-words text-lg font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const structureSteps = [
  { label: "Intent & Triggers", icon: Target, tone: "bg-blue-50 text-blue-600" },
  { label: "Plans & Protocols", icon: ClipboardList, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Products", icon: Box, tone: "bg-violet-50 text-violet-600" },
  { label: "Ingredients", icon: FlaskConical, tone: "bg-amber-50 text-amber-600" },
  { label: "Optimization Engine", icon: Settings, tone: "bg-cyan-50 text-cyan-600" },
  { label: "Personalized Plan", icon: UserRound, tone: "bg-emerald-50 text-emerald-600" },
];

const plans = [
  {
    badge: "Primary",
    badgeClass: "bg-emerald-50 text-emerald-700",
    title: "GLP-1 Beginner Plan",
    description: "Essential nutrition and support for new GLP-1 users focusing on tolerance and hydration.",
    duration: "30 Days",
    products: "6",
    focus: "Tolerance • Hydration • Basics",
  },
  {
    badge: "Recommended",
    badgeClass: "bg-violet-50 text-violet-700",
    title: "GLP-1 Muscle Preservation Plan",
    description: "Designed to preserve lean mass while on GLP-1 medications.",
    duration: "90 Days",
    products: "9",
    focus: "Protein • Strength • Recovery",
  },
  {
    badge: "Advanced",
    badgeClass: "bg-blue-50 text-blue-700",
    title: "GLP-1 Performance Plan",
    description: "Advanced plan for active users focused on performance and body composition.",
    duration: "90 Days",
    products: "11",
    focus: "Performance • Recovery • Energy",
  },
  {
    badge: "Physician",
    badgeClass: "bg-orange-50 text-orange-700",
    title: "GLP-1 Clinical Optimization Plan",
    description: "Comprehensive plan with advanced support and close monitoring.",
    duration: "90+ Days",
    products: "13",
    focus: "Clinical • Optimization • Monitoring",
  },
  {
    badge: "Minimal",
    badgeClass: "bg-slate-100 text-slate-600",
    title: "GLP-1 Minimal Stack Plan",
    description: "Simplified approach with essential support for users who prefer minimal products.",
    duration: "30 Days",
    products: "4",
    focus: "Essentials • Simplicity",
  },
];

const signals = [
  "GLP-1 medication started",
  "Rapid weight loss",
  "Loss of muscle mass",
  "Low energy or fatigue",
  "Nausea or digestive discomfort",
];

const bottomMetrics = [
  {
    label: "Most Common Plan",
    value: "Muscle Preservation Plan",
    detail: "42% of users",
    icon: FileText,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Plan Completion Rate",
    value: "68%",
    detail: "vs last 30 days +8.2%",
    icon: Users,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Avg. Products per Plan",
    value: "8.4",
    detail: "vs last 30 days -0.6",
    icon: Box,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    label: "Avg. Ingredients Optimized",
    value: "24.7",
    detail: "vs last 30 days +3.1",
    icon: Beaker,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    label: "User Satisfaction",
    value: "4.6 / 5",
    detail: "vs last 30 days +0.2",
    icon: Crosshair,
    tone: "bg-emerald-50 text-emerald-600",
  },
];
