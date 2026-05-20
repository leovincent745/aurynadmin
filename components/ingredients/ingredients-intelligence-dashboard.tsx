import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FlaskConical,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ingredients = [
  ["Protein", "Macronutrient", "112 g", "56%", "200 g", "300 g", "Optimal"],
  ["Vitamin C", "Vitamin", "1,750 mg", "88%", "2,000 mg", "3,000 mg", "Caution"],
  ["Magnesium", "Mineral", "420 mg", "84%", "500 mg", "800 mg", "Caution"],
  ["Zinc", "Mineral", "23 mg", "58%", "40 mg", "60 mg", "Optimal"],
  ["Sodium", "Mineral", "1,800 mg", "72%", "2,500 mg", "4,000 mg", "Optimal"],
  ["Potassium", "Mineral", "2,100 mg", "53%", "4,000 mg", "5,500 mg", "Optimal"],
  ["Caffeine", "Stimulant", "180 mg", "90%", "200 mg", "300 mg", "High"],
  ["Ashwagandha Extract", "Herbal", "600 mg", "100%", "600 mg", "900 mg", "High"],
];

const alerts = [
  ["Vitamin C Overlap Detected", "Total Vitamin C is nearing the soft limit.", "View Details"],
  ["Caffeine Load is High", "May cause jitters, anxiety, or sleep disruption.", "View Options"],
  ["Magnesium Approaching Limit", "Consider reducing secondary sources.", "Review Sources"],
  ["Pill Burden is High", "Estimated daily pill count: 18. Recommended target: < 12", "Simplify Stack"],
];

export function IngredientsIntelligenceDashboard() {
  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <PageHeader />
      <Tabs />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <ActivePlanStack />
            <ProfileFactors />
          </div>
          <IngredientTotals />
          <div className="grid gap-4 lg:grid-cols-2">
            <ContributionBreakdown />
            <OptimizedPreview />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <OptimizationAlerts />
          <AiRecommendations />
          <SafetyScore />
        </div>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Ingredients Intelligence
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            Master ingredient database and real-time analysis of active plans. Optimize for safety,
            efficacy, and each user&apos;s unique profile.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:justify-end">
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Export Report</Button>
          <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View as User</Button>
          <Button variant="outline" size="sm" className="gap-2 text-violet-700"><ShieldCheck className="h-4 w-4" />AI Optimize Stack</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Users} label="Active User Profile" value="Female, 42 yrs, 162 lbs" />
        <MiniStat icon={FlaskConical} label="Active Plans" value="3 Plans" />
        <MiniStat icon={CalendarDays} label="Last Analyzed" value="May 20, 2025 10:45 AM" />
        <Button variant="outline" size="sm" className="h-full gap-2"><RefreshCw className="h-4 w-4" />Recalculate</Button>
      </div>
    </section>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="break-words text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-b bg-white px-3 py-3 text-xs font-semibold text-slate-600">
      {["Ingredient Overview", "Master Database", "Interactions Checker", "Thresholds & Limits", "Pathway Relevance", "Medication Interactions", "History & Trends"].map((tab, index) => (
        <span key={tab} className={index === 0 ? "text-blue-600" : ""}>{tab}</span>
      ))}
    </div>
  );
}

function ActivePlanStack() {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-sm text-slate-950">Active Plan Stack</CardTitle>
        <Button variant="outline" size="sm">Manage Plans</Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {[
          ["GLP-1 Muscle Preservation Plan", "6 Products", "Primary", "100%"],
          ["Hydration Support Add-On", "4 Products", "Support", "65%"],
          ["Energy Recovery Add-On", "3 Products", "Support", "50%"],
        ].map(([name, products, tag, weight]) => (
          <div key={name} className="grid grid-cols-[1fr_auto] gap-3 border-t pt-3 text-sm">
            <div>
              <p className="font-semibold text-slate-950">{name}</p>
              <p className="text-xs text-slate-500">{products}</p>
            </div>
            <div className="text-right">
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{tag}</span>
              <p className="mt-1 text-xs font-semibold text-slate-700">Weight {weight}</p>
            </div>
          </div>
        ))}
        <p className="border-t pt-3 text-sm font-semibold text-blue-600">Total Products in Stack: 13</p>
      </CardContent>
    </Card>
  );
}

function ProfileFactors() {
  const factors = [["Sex", "Female"], ["Age", "42 yrs"], ["Body Weight", "162 lbs"], ["Activity Level", "Moderate"], ["Surgery Type", "VSG"], ["Post-Op Phase", "Maintenance"], ["Medication", "None"], ["Sensitivity", "Stimulants"]];
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-sm text-slate-950">User Profile Factors Affecting Thresholds</CardTitle>
        <Button variant="outline" size="sm">Edit Profile</Button>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-4">
        {factors.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IngredientTotals() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-slate-950">Aggregated Ingredient Totals</CardTitle>
        <p className="text-xs text-slate-500">Real-time totals from all products in active plans.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-xs">
            <thead className="border-y bg-slate-50 text-slate-500">
              <tr>{["Ingredient", "Category", "Total Amount", "% of Soft Limit", "Soft Limit", "Hard Limit", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {ingredients.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={cell} className="px-4 py-3 font-medium text-slate-700">
                      {index === 6 ? <StatusBadge value={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center p-4"><Button variant="outline" size="sm">View All Ingredients</Button></div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ value }: { value: string }) {
  const cls = value === "Optimal" ? "bg-emerald-50 text-emerald-700" : value === "Caution" ? "bg-amber-50 text-amber-700" : "bg-orange-50 text-orange-700";
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${cls}`}>{value}</span>;
}

function OptimizationAlerts() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-slate-950">Optimization Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {alerts.map(([title, copy, action]) => (
          <div key={title} className="rounded-lg border border-orange-100 bg-orange-50/50 p-3">
            <div className="flex gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{copy}</p>
              </div>
              <Button variant="outline" size="sm">{action}</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AiRecommendations() {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4"><CardTitle className="text-sm text-slate-950">AI Optimization Recommendations</CardTitle></CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {["Reduce Vitamin C by 500mg", "Lower Caffeine by 60mg", "Simplify Magnesium Sources"].map((item) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <p className="text-sm font-semibold text-slate-800">{item}</p>
            <Button variant="outline" size="sm">Apply</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ContributionBreakdown() {
  return <MiniPanel title="Ingredient Contribution Breakdown" rows={["Recovery Formula 57%", "Hydration Formula 29%", "Energy Support 14%"]} />;
}

function OptimizedPreview() {
  return <MiniPanel title="Final Optimized Stack Preview" rows={["Total Pills/Day 18", "High Risk Items 2", "Within Limits 26 / 28"]} />;
}

function SafetyScore() {
  return <MiniPanel title="Safety Score" rows={["78/100 Good", "Ingredient Safety 85/100", "Interaction Risk 70/100", "Threshold Compliance 75/100"]} />;
}

function MiniPanel({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="bg-white">
      <CardHeader className="p-4"><CardTitle className="text-sm text-slate-950">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{row}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
