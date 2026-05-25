import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";
import { JourneyBuilderDashboard } from "@/components/orchestration/journey-builder-dashboard";

export default function JourneyBuilderPage() {
  return (
    <AuthenticatedAdminShell>
      <JourneyBuilderDashboard />
    </AuthenticatedAdminShell>
  );
}
