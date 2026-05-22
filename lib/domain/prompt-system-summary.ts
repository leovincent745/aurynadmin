/** Prompt System KPI summary — see GET /api/admin/prompts/summary */

export type EngineStatus = "healthy" | "warning" | "degraded" | "offline";

export type PromptSummaryStatusFilter = "all" | "active" | "in_review" | "archived";

export interface MetricTrend {
  /** Percent change vs prior 30-day window; null when not computable. */
  percentChange: number | null;
  label: string;
}

export interface PromptSystemSummary {
  totalPrompts: number;
  activePrompts: number;
  inReviewPrompts: number;
  archivedPrompts: number;
  totalExecutions30d: number;
  totalExecutionsPrior30d: number;
  avgSuccessRate: number | null;
  avgSuccessRatePrior30d: number | null;
  totalTokens30d: number | null;
  tokensTracked: boolean;
  physicianApprovalRate: number | null;
  physicianApprovalTracked: boolean;
  engineStatus: EngineStatus;
  engineStatusDetail: string;
  trends: {
    executions30d: MetricTrend;
    successRate: MetricTrend;
    tokens30d: MetricTrend;
    physicianApproval: MetricTrend;
  };
  /** Applied when request includes status filter (filter-aware counts). */
  filter: {
    status: PromptSummaryStatusFilter;
  };
}
