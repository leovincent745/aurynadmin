import { UserProfileDetail } from "@/components/admin/user-profile-detail";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AuthenticatedAdminShell>
      <UserProfileDetail userId={id} />
    </AuthenticatedAdminShell>
  );
}
