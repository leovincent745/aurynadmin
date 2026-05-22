import { UserProfilesList } from "@/components/admin/user-profiles-list";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function UsersPage() {
  return (
    <AuthenticatedAdminShell>
      <UserProfilesList />
    </AuthenticatedAdminShell>
  );
}
