import { Suspense } from "react";

import { AdminTestChat } from "@/components/admin/admin-test-chat";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function TestChatPage() {
  return (
    <AuthenticatedAdminShell>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading test chat…</p>}>
        <AdminTestChat />
      </Suspense>
    </AuthenticatedAdminShell>
  );
}
