import { AiLogsList } from "@/components/admin/ai-logs-list";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function AiOptimizationCenterPage() {
  return (
    <AuthenticatedAdminShell>
      <AiLogsList />
    </AuthenticatedAdminShell>
  );
}
