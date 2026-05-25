"use client";

import { TrendPlaceholder } from "@/components/prompt-system/trend-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PipelinePerformanceResponse } from "@/lib/domain/prompt-performance";
import { formatCompactCount, formatPercent, formatTrend, trendTone } from "@/lib/utils/format-metrics";

export function PromptPerformancePanel({
  data,
  loading,
  error,
}: {
  data: PipelinePerformanceResponse | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <Card className="min-w-0 bg-white">
      <CardHeader className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base text-slate-950">Performance by Pipeline (30D)</CardTitle>
          <p className="text-xs text-slate-500">
            {data?.periodLabel ?? "Success rate and runs from AI logs"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-xs">
        {loading && !data ? (
          <p className="py-8 text-center text-slate-500">Loading performance…</p>
        ) : error ? (
          <p className="py-6 text-center text-red-600">{error}</p>
        ) : !data?.hasData || data.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No execution data yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Run public chat or Admin Test Chat to populate success rate and run counts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[minmax(12rem,1fr)_4.25rem_4.5rem_4.25rem] gap-3 border-b pb-2 text-[11px] font-semibold text-slate-500">
                <span>Pipeline</span>
                <span className="text-right">Success</span>
                <span className="text-center">Trend</span>
                <span className="text-right">Runs</span>
              </div>
              <div className="divide-y">
                {data.rows.map((row) => {
                  const trend = formatTrend(row.trendPercent);
                  const tone = trendTone(row.trendPercent);
                  const trendClass =
                    tone === "positive"
                      ? "text-emerald-600"
                      : tone === "negative"
                        ? "text-red-600"
                        : "text-slate-400";

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[minmax(12rem,1fr)_4.25rem_4.5rem_4.25rem] items-center gap-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                        <span className="min-w-0 leading-5 text-slate-700">
                          <span className="font-medium text-slate-900">{row.name}</span>
                          <span className="block text-[10px] text-slate-500">
                            {row.code} · v{row.versionNumber}
                          </span>
                        </span>
                      </div>
                      <span className="text-right font-semibold text-slate-800">
                        {formatPercent(row.successRate)}
                      </span>
                      <span className={`flex justify-center ${trendClass}`}>
                        {row.trendPercent != null && trend ? (
                          <span className="text-[11px] font-semibold">{trend}</span>
                        ) : (
                          <TrendPlaceholder />
                        )}
                      </span>
                      <span className="text-right text-slate-700">
                        {formatCompactCount(row.runs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
