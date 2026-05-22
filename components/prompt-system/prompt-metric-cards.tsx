"use client";

import type { LucideIcon } from "lucide-react";
import { Box, Coins, ShieldCheck, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PromptSystemSummary } from "@/lib/domain/prompt-system-summary";
import {
  formatCompactCount,
  formatPercent,
  formatTrend,
  trendTone,
} from "@/lib/utils/format-metrics";

const toneClasses: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

export interface PromptMetricCardModel {
  key: string;
  label: string;
  value: string;
  detail: string;
  trend?: string;
  trendTone?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  tone: keyof typeof toneClasses;
  empty?: boolean;
}

function buildCards(summary: PromptSystemSummary | null): PromptMetricCardModel[] {
  if (!summary) return [];

  const execTrend = formatTrend(summary.trends.executions30d.percentChange);
  const successTrend = formatTrend(summary.trends.successRate.percentChange);

  return [
    {
      key: "totalPrompts",
      label: "Total Prompts",
      value: formatCompactCount(summary.totalPrompts),
      detail: `Active: ${summary.activePrompts} / In Review: ${summary.inReviewPrompts}`,
      icon: Box,
      tone: "blue",
      empty: summary.totalPrompts === 0,
    },
    {
      key: "totalExecutions30d",
      label: "Total Executions (30D)",
      value: formatCompactCount(summary.totalExecutions30d),
      detail: summary.trends.executions30d.label,
      trend: execTrend,
      trendTone: trendTone(summary.trends.executions30d.percentChange),
      icon: TrendingUp,
      tone: "emerald",
      empty: summary.totalExecutions30d === 0,
    },
    {
      key: "avgSuccessRate",
      label: "Avg. Success Rate",
      value: formatPercent(summary.avgSuccessRate),
      detail: summary.trends.successRate.label,
      trend: successTrend,
      trendTone: trendTone(summary.trends.successRate.percentChange),
      icon: Target,
      tone: "violet",
      empty: summary.totalExecutions30d === 0,
    },
    {
      key: "totalTokens30d",
      label: "Total Tokens (30D)",
      value: summary.tokensTracked
        ? formatCompactCount(summary.totalTokens30d ?? 0)
        : "—",
      detail: summary.tokensTracked
        ? summary.trends.tokens30d.label
        : "Not tracked in Step 1",
      trend: summary.tokensTracked
        ? formatTrend(summary.trends.tokens30d.percentChange)
        : undefined,
      trendTone: trendTone(summary.trends.tokens30d.percentChange),
      icon: Coins,
      tone: "amber",
    },
    {
      key: "physicianApprovalRate",
      label: "Physician Approval",
      value: summary.physicianApprovalTracked
        ? formatPercent(summary.physicianApprovalRate)
        : "—",
      detail: summary.physicianApprovalTracked
        ? summary.trends.physicianApproval.label
        : "Future phase",
      trend: summary.physicianApprovalTracked
        ? formatTrend(summary.trends.physicianApproval.percentChange)
        : undefined,
      trendTone: trendTone(summary.trends.physicianApproval.percentChange),
      icon: ShieldCheck,
      tone: "blue",
    },
  ];
}

function MetricSkeleton() {
  return (
    <div className="flex min-h-24 min-w-0 gap-3 border-b p-4 lg:border-b-0 lg:border-r last:border-r-0">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export interface PromptMetricCardsProps {
  summary: PromptSystemSummary | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function PromptMetricCards({
  summary,
  loading,
  error,
  onRetry,
}: PromptMetricCardsProps) {
  if (error) {
    return (
      <Card className="overflow-hidden bg-white">
        <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="overflow-hidden bg-white">
        <CardContent className="grid p-0 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  const cards = buildCards(summary);
  const allEmpty = summary != null && summary.totalPrompts === 0;

  return (
    <div className="space-y-2">
      {allEmpty ? (
        <p className="text-xs text-slate-500">
          No prompt versions yet. Use <span className="font-semibold">New Prompt</span> to create a
          draft.
        </p>
      ) : null}

      <Card className="overflow-hidden bg-white">
        <CardContent className="grid p-0 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((kpi) => (
            <div
              key={kpi.key}
              className={`flex min-h-24 min-w-0 gap-3 border-b p-4 lg:border-b-0 lg:border-r last:border-r-0 ${
                kpi.empty ? "opacity-80" : ""
              }`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneClasses[kpi.tone]}`}
              >
                <kpi.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
                <p className="mt-1 break-words text-xl font-semibold leading-tight text-slate-950 xl:text-2xl">
                  {kpi.empty && kpi.key !== "totalTokens30d" && kpi.key !== "physicianApprovalRate"
                    ? "0"
                    : kpi.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.trend ? (
                    <span
                      className={`font-semibold ${
                        kpi.trendTone === "positive"
                          ? "text-emerald-600"
                          : kpi.trendTone === "negative"
                            ? "text-red-600"
                            : "text-slate-500"
                      }`}
                    >
                      {kpi.trend}{" "}
                    </span>
                  ) : null}
                  {kpi.detail}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
