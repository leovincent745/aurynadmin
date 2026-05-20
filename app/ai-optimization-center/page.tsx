"use client";

import { AiOptimizationDashboard } from "@/components/ai-optimization/ai-optimization-dashboard";
import { AdminShell } from "@/components/layout/admin-shell";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";

const navItems = promptSystemNavItems.map((item) => ({
  ...item,
  active: item.href === "/ai-optimization-center",
}));

export default function AiOptimizationCenterPage() {
  return (
    <AdminShell navItems={navItems} breadcrumbs={["Root Pathways", "AI Optimization Center"]}>
      <AiOptimizationDashboard />
    </AdminShell>
  );
}
