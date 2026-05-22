import { ConversationReviewDetail } from "@/components/admin/conversation-review-detail";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AuthenticatedAdminShell>
      <ConversationReviewDetail conversationId={id} />
    </AuthenticatedAdminShell>
  );
}
