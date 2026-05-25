import { Box, ClipboardList, Crosshair, House, Package, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface PathwayMetricsProps {
  pathway: RootPathway;
}

export function PathwayMetrics({ pathway }: PathwayMetricsProps) {
  const metrics = [
    {
      label: "Active Users",
      value: pathway.analytics.metrics.activeUsers.toLocaleString(),
      detail: "vs last 30 days",
      trend: "+18.6%",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Pathway Score (Avg.)",
      value: "87%",
      detail: "High Relevance",
      trend: "",
      icon: House,
      tone: "emerald",
    },
    {
      label: "Conversion Rate",
      value: "24.7%",
      detail: "vs last 30 days",
      trend: "+5.3%",
      icon: Crosshair,
      tone: "emerald",
    },
    {
      label: "Protocol Completions",
      value: "3,421",
      detail: "vs last 30 days",
      trend: "+12.1%",
      icon: ClipboardList,
      tone: "violet",
    },
    {
      label: "Top Plan",
      value: "GLP-1 Muscle Preservation Plan",
      detail: "",
      trend: "",
      icon: Package,
      tone: "blue",
    },
    {
      label: "Active Plans",
      value: "5",
      detail: "View Plans",
      trend: "",
      icon: Box,
      tone: "violet",
    },
  ];

  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="grid gap-0 p-0 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => {
          const isLongValue = metric.value.length > 12;

          return (
          <div
            key={metric.label}
            className="flex min-h-28 min-w-0 gap-4 border-b p-4 sm:p-5 2xl:border-b-0 2xl:border-r last:border-r-0"
          >
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClasses[metric.tone]}`}
            >
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
              <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-2">
                <p
                  className={`min-w-0 max-w-full break-words font-semibold leading-tight text-slate-950 ${
                    isLongValue ? "text-sm sm:text-base" : "text-xl sm:text-2xl"
                  }`}
                >
                  {metric.value}
                </p>
                {metric.trend ? (
                  <span className="text-xs font-semibold text-emerald-600">{metric.trend}</span>
                ) : null}
              </div>
              {metric.detail ? (
                <p className="mt-1 text-xs font-medium text-slate-500">{metric.detail}</p>
              ) : null}
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};
