import { AdminInstructionStatus, AiLogEventType } from "@prisma/client";

import type {
  EngineStatus,
  MetricTrend,
  PromptSummaryStatusFilter,
  PromptSystemSummary,
} from "@/lib/domain/prompt-system-summary";
import { prisma } from "@/lib/db/prisma";
import { getAdminDashboardSummary } from "@/lib/services/instruction-service";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function percentChange(current: number, prior: number): number | null {
  if (prior === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - prior) / prior) * 1000) / 10;
}

function successRate(success: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((success / total) * 1000) / 10;
}

function buildTrend(current: number, prior: number, label: string): MetricTrend {
  return {
    percentChange: percentChange(current, prior),
    label,
  };
}

function statusWhere(filter: PromptSummaryStatusFilter) {
  if (filter === "active") {
    return { status: AdminInstructionStatus.published };
  }
  if (filter === "in_review") {
    return { status: AdminInstructionStatus.draft };
  }
  if (filter === "archived") {
    return { status: AdminInstructionStatus.archived };
  }
  return {};
}

function resolveEngineStatus(params: {
  productionStatus: Awaited<ReturnType<typeof getAdminDashboardSummary>>["productionStatus"];
  hasDraft: boolean;
  totalPrompts: number;
}): { status: EngineStatus; detail: string } {
  const { productionStatus, hasDraft, totalPrompts } = params;

  if (productionStatus === "active") {
    return {
      status: "healthy",
      detail: "Published instructions are active for public chat.",
    };
  }
  if (productionStatus === "needs_setup" && totalPrompts === 0) {
    return {
      status: "offline",
      detail: "No instruction versions exist. Create and publish a prompt.",
    };
  }
  if (productionStatus === "no_published_instructions" && hasDraft) {
    return {
      status: "warning",
      detail: "Draft exists but nothing is published to production chat.",
    };
  }
  if (productionStatus === "no_published_instructions") {
    return {
      status: "degraded",
      detail: "Instruction versions exist without a published production version.",
    };
  }
  return {
    status: "warning",
    detail: "Engine needs configuration before running live chat.",
  };
}

export interface PromptSummaryQuery {
  status?: PromptSummaryStatusFilter;
}

export async function getPromptSystemSummary(
  query: PromptSummaryQuery = {},
): Promise<PromptSystemSummary> {
  const statusFilter: PromptSummaryStatusFilter = query.status ?? "all";
  const whereStatus = statusWhere(statusFilter);

  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * MS_PER_DAY);
  const sixtyDaysAgo = new Date(now - 60 * MS_PER_DAY);

  const [
    dashboard,
    totalPromptsFiltered,
    activePrompts,
    inReviewPrompts,
    archivedPrompts,
    totalExecutions30d,
    totalExecutionsPrior30d,
    success30d,
    successPrior30d,
  ] = await Promise.all([
    getAdminDashboardSummary(),
    prisma.adminInstruction.count({ where: whereStatus }),
    prisma.adminInstruction.count({ where: { status: AdminInstructionStatus.published } }),
    prisma.adminInstruction.count({ where: { status: AdminInstructionStatus.draft } }),
    prisma.adminInstruction.count({ where: { status: AdminInstructionStatus.archived } }),
    prisma.aiLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.aiLog.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.aiLog.count({
      where: { createdAt: { gte: thirtyDaysAgo }, eventType: AiLogEventType.chat_success },
    }),
    prisma.aiLog.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        eventType: AiLogEventType.chat_success,
      },
    }),
  ]);

  const avgSuccessRate = successRate(success30d, totalExecutions30d);
  const avgSuccessRatePrior30d = successRate(successPrior30d, totalExecutionsPrior30d);

  const { status: engineStatus, detail: engineStatusDetail } = resolveEngineStatus({
    productionStatus: dashboard.productionStatus,
    hasDraft: dashboard.hasDraft,
    totalPrompts: dashboard.totalInstructionCount,
  });

  return {
    totalPrompts:
      statusFilter === "all" ? dashboard.totalInstructionCount : totalPromptsFiltered,
    activePrompts,
    inReviewPrompts,
    archivedPrompts,
    totalExecutions30d,
    totalExecutionsPrior30d,
    avgSuccessRate,
    avgSuccessRatePrior30d,
    totalTokens30d: null,
    tokensTracked: false,
    physicianApprovalRate: null,
    physicianApprovalTracked: false,
    engineStatus,
    engineStatusDetail,
    trends: {
      executions30d: buildTrend(totalExecutions30d, totalExecutionsPrior30d, "vs prior 30 days"),
      successRate: buildTrend(
        avgSuccessRate ?? 0,
        avgSuccessRatePrior30d ?? 0,
        "vs prior 30 days",
      ),
      tokens30d: { percentChange: null, label: "Not tracked in Step 1" },
      physicianApproval: { percentChange: null, label: "Future phase" },
    },
    filter: { status: statusFilter },
  };
}
