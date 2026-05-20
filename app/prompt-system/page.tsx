import { AdminShell } from "@/components/layout/admin-shell";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";
import { PromptSystemDashboard } from "@/components/prompt-system/prompt-system-dashboard";

export default function PromptSystemPage() {
  return (
    <AdminShell navItems={promptSystemNavItems} breadcrumbs={["Intelligence", "Prompt System"]}>
      <PromptSystemDashboard />
    </AdminShell>
  );
}
