import { AdminTestChat } from "@/components/admin/admin-test-chat";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function TestChatPage() {
  return (
    <AuthenticatedAdminShell>
      <AdminTestChat />
    </AuthenticatedAdminShell>
  );
}
