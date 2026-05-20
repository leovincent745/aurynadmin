"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { LiveUserOrchestrationDashboard } from "@/components/orchestration/live-user-orchestration-dashboard";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";

const navItems = promptSystemNavItems.map((item) => ({
  ...item,
  active: item.href === "/live-user-journey",
}));

export default function LiveUserJourneyPage() {
  return (
    <AdminShell navItems={navItems} breadcrumbs={["Orchestration", "Live User Journey Engine"]}>
      <LiveUserOrchestrationDashboard />
    </AdminShell>
  );
}
