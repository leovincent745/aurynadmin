import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>;
}
