import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function DashboardPage() {
  return (
    <AuthenticatedAdminShell>
      <AdminDashboard />
    </AuthenticatedAdminShell>
  );
}
