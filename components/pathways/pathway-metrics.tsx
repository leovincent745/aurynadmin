import { Box, ClipboardList, Crosshair, House, Package, Users } from "lucide-react";

import { CommonMetrics, type Metric } from "@/components/ui/common-metrics";
import type { RootPathway } from "@/lib/domain/root-pathway";

interface PathwayMetricsProps {
  pathway: RootPathway;
}

export function PathwayMetrics({ pathway }: PathwayMetricsProps) {
  const metrics: Metric[] = [
    {
      label: "Active Users",
      value: pathway.analytics.metrics.activeUsers.toLocaleString(),
      detail: "vs last 30 days",
      trend: "18.6%",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Pathway Score (Avg.)",
      value: "87%",
      detail: "High Relevance",
      icon: House,
      tone: "emerald",
    },
    {
      label: "Conversion Rate",
      value: "24.7%",
      detail: "vs last 30 days",
      trend: "5.3%",
      icon: Crosshair,
      tone: "emerald",
    },
    {
      label: "Protocol Completions",
      value: "3,421",
      detail: "vs last 30 days",
      trend: "12.1%",
      icon: ClipboardList,
      tone: "violet",
    },
    {
      label: "Top Plan",
      value: "GLP-1 Muscle Preservation Plan",
      icon: Package,
      tone: "blue",
    },
    {
      label: "Active Plans",
      value: "5",
      detail: "View Plans",
      icon: Box,
      tone: "violet",
    },
  ];

  return <CommonMetrics metrics={metrics} />;
}
