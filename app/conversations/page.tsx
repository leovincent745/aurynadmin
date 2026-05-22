import { ConversationReviewList } from "@/components/admin/conversation-review-list";
import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";

export default function ConversationsPage() {
  return (
    <AuthenticatedAdminShell>
      <ConversationReviewList />
    </AuthenticatedAdminShell>
  );
}
