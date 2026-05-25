"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PipelineHealthResponse, HealthStatusTone } from "@/lib/domain/prompt-performance";

function toneClasses(tone: HealthStatusTone): { icon: typeof CheckCircle2; iconClass: string; statusClass: string } {
  switch (tone) {
    case "healthy":
      return {
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
        statusClass: "text-emerald-600",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        iconClass: "text-amber-500",
        statusClass: "text-amber-700",
      };
    case "degraded":
      return {
        icon: AlertTriangle,
        iconClass: "text-red-500",
        statusClass: "text-red-700",
      };
    default:
      return {
        icon: CircleDot,
        iconClass: "text-slate-400",
        statusClass: "text-slate-500",
      };
  }
}

function headlineClass(tone: HealthStatusTone): string {
  switch (tone) {
    case "healthy":
      return "text-emerald-600";
    case "warning":
      return "text-amber-700";
    case "degraded":
      return "text-red-700";
    default:
      return "text-slate-600";
  }
}

export function PromptHealthPanel({
  health,
  loading,
}: {
  health: PipelineHealthResponse | null;
  loading: boolean;
}) {
  const headline = health?.headline ?? "Checking health…";
  const headlineTone = health?.headlineTone ?? "neutral";

  return (
    <Card className="bg-white">
      <CardHeader className="p-4">
        <CardTitle className="text-base text-slate-950">Pipeline Health Monitor</CardTitle>
        <p className={`text-xs font-semibold ${headlineClass(headlineTone)}`}>
          {loading && !health ? "Loading…" : headline}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {loading && !health ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading health status…</p>
        ) : (
          health?.rows.map((row) => {
            const { icon: Icon, iconClass, statusClass } = toneClasses(row.tone);
            return (
              <div key={row.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-2 text-slate-700">
                  <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} aria-hidden />
                  <span className="break-words">{row.label}</span>
                </span>
                <span className={`shrink-0 font-semibold ${statusClass}`}>{row.status}</span>
              </div>
            );
          })
        )}
        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/ai-optimization-center">View System Logs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
