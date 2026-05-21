import type React from "react";
import { ArrowUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface Metric {
  label: string;
  value?: string;
  detail?: string;
  trend?: string;
  icon?: React.ElementType;
  tone?: "blue" | "emerald" | "violet";
}

interface CommonMetricsProps {
  metrics: Metric[];
}

export function CommonMetrics({ metrics }: CommonMetricsProps) {
  const safeMetrics = metrics.map((metric) => ({
    label: metric.label ?? "",
    value: metric.value ?? "",
    detail: metric.detail ?? "",
    trend: metric.trend ?? "",
    icon: metric.icon,
    tone: metric.tone ?? "blue",
  }));

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-y-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {safeMetrics.map((metric, index) => {
          const isLastColumn = (index + 1) % 4 === 0;
          const isLastItem = index === safeMetrics.length - 1;
          const hasRowsAfter = index < safeMetrics.length - (safeMetrics.length % 4 || 4);

          return (
            <MetricCell
              key={`${metric.label}-${index}`}
              metric={metric}
              showDivider={!isLastColumn && !isLastItem}
              showBottomBorder={hasRowsAfter}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

function MetricCell({
  metric,
  showDivider,
  showBottomBorder,
}: {
  metric: Required<Omit<Metric, "icon">> & { icon?: React.ElementType };
  showDivider: boolean;
  showBottomBorder: boolean;
}) {
  const Icon = metric.icon;

  return (
    <div
      className={`relative flex min-h-[86px] min-w-0 items-center gap-3 px-5 py-4 ${
        showBottomBorder ? "border-b" : ""
      }`}
    >
      {showDivider ? (
        <span className="absolute bottom-4 right-0 top-4 hidden w-px bg-slate-200 lg:block" />
      ) : null}

      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneClasses[metric.tone]}`}>
        {Icon ? <Icon className="h-5 w-5" /> : <span className="h-5 w-5" aria-hidden="true" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="min-h-4 text-[12px] font-semibold leading-4 text-slate-600">
          {metric.label}
        </p>

        <div className="mt-1 flex min-h-6 flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="break-words text-[20px] font-bold leading-tight text-slate-950">
            {metric.value}
          </p>

          {metric.trend ? (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-bold text-emerald-600">
              <ArrowUp className="h-3 w-3" />
              {metric.trend}
            </span>
          ) : (
            <span className="hidden" aria-hidden="true" />
          )}
        </div>

        <p className={`mt-1 min-h-4 text-[12px] font-semibold leading-4 ${detailClass(metric.detail)}`}>
          {metric.detail}
        </p>
      </div>
    </div>
  );
}

function detailClass(detail: string) {
  if (detail === "View Plans") {
    return "text-violet-600";
  }

  if (detail === "High Relevance") {
    return "text-emerald-600";
  }

  return "text-slate-500";
}

const toneClasses: Record<NonNullable<Metric["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
};
