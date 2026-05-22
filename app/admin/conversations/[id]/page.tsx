import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/conversations/${id}`);
}
