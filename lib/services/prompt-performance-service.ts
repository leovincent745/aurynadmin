import { AiLogEventType } from "@prisma/client";

import type {
  PipelineHealthResponse,
  PipelineHealthRow,
  PipelinePerformanceResponse,
  PipelinePerformanceRow,
  HealthStatusTone,
} from "@/lib/domain/prompt-performance";
import type { PromptSystemSummary } from "@/lib/domain/prompt-system-summary";
import { prisma } from "@/lib/db/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const PIPELINE_NAME = "Auryn Chat Instructions";

function pipelineCode(versionNumber: number): string {
  return `PROMPT-CHAT-${String(versionNumber).padStart(3, "0")}`;
}

function percentChange(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null;
  return Math.round(((current - prior) / prior) * 1000) / 10;
}

function successRate(success: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((success / total) * 1000) / 10;
}

async function loadRunStatsForWindow(
  from: Date,
  to?: Date,
): Promise<Map<string, { total: number; success: number }>> {
  const where: { instructionVersionId: { not: null }; createdAt: { gte: Date; lt?: Date } } = {
    instructionVersionId: { not: null },
    createdAt: { gte: from },
  };
  if (to) where.createdAt.lt = to;

  const groups = await prisma.aiLog.groupBy({
    by: ["instructionVersionId", "eventType"],
    where,
    _count: { _all: true },
  });

  const map = new Map<string, { total: number; success: number }>();
  for (const row of groups) {
    const id = row.instructionVersionId!;
    const entry = map.get(id) ?? { total: 0, success: 0 };
    const count = row._count._all;
    entry.total += count;
    if (row.eventType === AiLogEventType.chat_success) {
      entry.success += count;
    }
    map.set(id, entry);
  }
  return map;
}

export async function getPipelinePerformance30d(
  limit = 12,
): Promise<PipelinePerformanceResponse> {
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * MS_PER_DAY);
  const sixtyDaysAgo = new Date(now - 60 * MS_PER_DAY);

  const [currentStats, priorStats, versions] = await Promise.all([
    loadRunStatsForWindow(thirtyDaysAgo),
    loadRunStatsForWindow(sixtyDaysAgo, thirtyDaysAgo),
    prisma.adminInstruction.findMany({
      orderBy: [{ versionNumber: "desc" }],
      select: { id: true, versionNumber: true },
    }),
  ]);

  const rows: PipelinePerformanceRow[] = versions
    .map((v) => {
      const current = currentStats.get(v.id) ?? { total: 0, success: 0 };
      const prior = priorStats.get(v.id) ?? { total: 0, success: 0 };
      const currentRate = successRate(current.success, current.total);
      const priorRate = successRate(prior.success, prior.total);

      return {
        id: v.id,
        name: PIPELINE_NAME,
        code: pipelineCode(v.versionNumber),
        versionNumber: v.versionNumber,
        successRate: currentRate,
        runs: current.total,
        trendPercent:
          current.total > 0 || prior.total > 0
            ? percentChange(currentRate ?? 0, priorRate ?? 0)
            : null,
      };
    })
    .filter((r) => r.runs > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, limit);

  const hasData = rows.length > 0 || currentStats.size > 0;

  return {
    rows,
    periodLabel: "Last 30 days (AI logs)",
    hasData,
  };
}

function toneFromEngine(engine: PromptSystemSummary["engineStatus"]): HealthStatusTone {
  switch (engine) {
    case "healthy":
      return "healthy";
    case "warning":
      return "warning";
    case "degraded":
      return "degraded";
    case "offline":
      return "degraded";
    default:
      return "neutral";
  }
}

export async function getPipelineHealthMonitor(
  summary: PromptSystemSummary,
): Promise<PipelineHealthResponse> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
  const [errors30d, safety30d] = await Promise.all([
    prisma.aiLog.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        eventType: AiLogEventType.chat_error,
      },
    }),
    prisma.aiLog.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        eventType: { in: [AiLogEventType.safety_escalation, AiLogEventType.safety_refusal] },
      },
    }),
  ]);

  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  const modelStatus: PipelineHealthRow = {
    id: "model-api",
    label: "Model API Connectivity",
    status: !openAiConfigured
      ? "Not configured"
      : errors30d > 0
        ? "Operational (recent errors logged)"
        : "Operational",
    tone: !openAiConfigured ? "degraded" : errors30d > 5 ? "warning" : "healthy",
  };

  const rateLimits: PipelineHealthRow = {
    id: "rate-limits",
    label: "Rate Limits & Quotas",
    status: "Healthy",
    tone: "healthy",
  };

  const safetyTone: HealthStatusTone =
    summary.totalExecutions30d === 0
      ? "neutral"
      : safety30d === 0
        ? "healthy"
        : safety30d / summary.totalExecutions30d > 0.15
          ? "warning"
          : "healthy";

  const safetyFilters: PipelineHealthRow = {
    id: "safety-filters",
    label: "Validation / Safety Filters",
    status:
      summary.totalExecutions30d === 0
        ? "No runs yet"
        : safety30d === 0
          ? "Operational"
          : `${safety30d} safety event${safety30d === 1 ? "" : "s"} (30D)`,
    tone: safetyTone,
  };

  const dataQuality: PipelineHealthRow = {
    id: "data-quality",
    label: "Data Quality",
    status:
      summary.activePrompts > 0
        ? "Published instructions on file"
        : summary.inReviewPrompts > 0
          ? "Draft only"
          : "Needs setup",
    tone:
      summary.activePrompts > 0
        ? "healthy"
        : summary.inReviewPrompts > 0
          ? "warning"
          : "degraded",
  };

  const costOptimization: PipelineHealthRow = {
    id: "cost",
    label: "Cost Optimization",
    status: summary.tokensTracked ? "Tracked" : "Not tracked in Step 1",
    tone: "neutral",
  };

  const headlineTone = toneFromEngine(summary.engineStatus);
  const headline =
    summary.engineStatus === "healthy"
      ? "All systems operational"
      : summary.engineStatus === "warning"
        ? "Attention recommended"
        : summary.engineStatus === "offline"
          ? "Setup required"
          : "Degraded — review logs";

  return {
    headline,
    headlineTone,
    rows: [modelStatus, rateLimits, safetyFilters, dataQuality, costOptimization],
  };
}
