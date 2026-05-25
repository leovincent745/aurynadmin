/** Performance by Pipeline (30D) — derived from `ai_logs` per instruction version. */

export interface PipelinePerformanceRow {
  id: string;
  name: string;
  code: string;
  versionNumber: number;
  successRate: number | null;
  runs: number;
  /** Percent change vs prior 30-day window; null → show trend placeholder. */
  trendPercent: number | null;
}

export interface PipelinePerformanceResponse {
  rows: PipelinePerformanceRow[];
  periodLabel: string;
  hasData: boolean;
}

export type HealthStatusTone = "healthy" | "warning" | "degraded" | "neutral";

export interface PipelineHealthRow {
  id: string;
  label: string;
  status: string;
  tone: HealthStatusTone;
}

export interface PipelineHealthResponse {
  headline: string;
  headlineTone: HealthStatusTone;
  rows: PipelineHealthRow[];
}
