"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { JourneyBuilderDashboard } from "@/components/orchestration/journey-builder-dashboard";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";

const navItems = promptSystemNavItems.map((item) => ({
  ...item,
  active: item.href === "/journey-builder",
}));

export default function JourneyBuilderPage() {
  return (
    <AdminShell navItems={navItems} breadcrumbs={["Orchestration", "Journey Builder"]}>
      <JourneyBuilderDashboard />
    </AdminShell>
  );
}
