import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";
import { LiveUserOrchestrationDashboard } from "@/components/orchestration/live-user-orchestration-dashboard";

export default function LiveUserJourneyPage() {
  return (
    <AuthenticatedAdminShell>
      <LiveUserOrchestrationDashboard />
    </AuthenticatedAdminShell>
  );
}
