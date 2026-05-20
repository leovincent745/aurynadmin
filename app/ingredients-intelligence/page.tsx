"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { IngredientsIntelligenceDashboard } from "@/components/ingredients/ingredients-intelligence-dashboard";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";

const navItems = promptSystemNavItems.map((item) => ({
  ...item,
  active: item.href === "/ingredients-intelligence",
}));

export default function IngredientsIntelligencePage() {
  return (
    <AdminShell
      navItems={navItems}
      breadcrumbs={["Root Pathways", "GLP-1 Support", "Ingredients Intelligence"]}
    >
      <IngredientsIntelligenceDashboard />
    </AdminShell>
  );
}
