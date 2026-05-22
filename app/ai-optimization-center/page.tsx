import { AiOptimizationDashboard } from "@/components/ai-optimization/ai-optimization-dashboard";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function AiOptimizationCenterPage() {
  return (
    <AuthenticatedAdminShell>
      <AiOptimizationDashboard />
    </AuthenticatedAdminShell>
  );
}
