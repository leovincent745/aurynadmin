import { IngredientsIntelligenceDashboard } from "@/components/ingredients/ingredients-intelligence-dashboard";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function IngredientsIntelligencePage() {
  return (
    <AuthenticatedAdminShell>
      <IngredientsIntelligenceDashboard />
    </AuthenticatedAdminShell>
  );
}
