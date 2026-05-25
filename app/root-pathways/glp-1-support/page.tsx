import { FutureModulePlaceholder } from "@/components/admin/future-module-placeholder";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function GlpOneSupportPage() {
  return (
    <AuthenticatedAdminShell>
      <FutureModulePlaceholder
        title="Root Pathways — GLP-1 Support"
        description="Pathway plans, products, and rules engine are planned for a later release."
      />
    </AuthenticatedAdminShell>
  );
}
