export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function formatTrend(percentChange: number | null): string {
  if (percentChange == null || Number.isNaN(percentChange)) return "";
  const sign = percentChange > 0 ? "+" : "";
  return `${sign}${percentChange.toFixed(1)}%`;
}

export function trendTone(percentChange: number | null): "positive" | "negative" | "neutral" {
  if (percentChange == null || percentChange === 0) return "neutral";
  return percentChange > 0 ? "positive" : "negative";
}
