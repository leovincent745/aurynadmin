"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversationDetail } from "@/lib/domain/conversation-review";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface ConversationReviewDetailProps {
  conversationId: string;
}

export function ConversationReviewDetail({ conversationId }: ConversationReviewDetailProps) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagNote, setFlagNote] = useState("");
  const [flagging, setFlagging] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not found");
      const data = (await response.json()) as { conversation: ConversationDetail };
      setConversation(data.conversation);
      setFlagNote(data.conversation.flaggedNote ?? "");
    } catch {
      setError("Unable to load conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateFlag = async (flagged: boolean) => {
    setFlagging(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ flagged, note: flagNote || undefined }),
      });
      if (!response.ok) throw new Error("Flag update failed");
      const data = (await response.json()) as { conversation: ConversationDetail };
      setConversation(data.conversation);
    } catch {
      setError("Unable to update flag.");
    } finally {
      setFlagging(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading conversation...</p>;
  }

  if (error && !conversation) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Button asChild variant="outline">
          <Link href="/admin/conversations">Back to list</Link>
        </Button>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/conversations">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-slate-950">{conversation.participant}</h1>
          <p className="text-xs text-slate-500 capitalize">
            {conversation.participantType} · {conversation.id}
          </p>
        </div>
        {conversation.flaggedForReview && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Flagged for review
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Optional note for reviewers..."
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={flagging || conversation.flaggedForReview}
              onClick={() => void updateFlag(true)}
            >
              <Flag className="mr-1 h-3.5 w-3.5" />
              Flag for review
            </Button>
            {conversation.flaggedForReview && (
              <Button
                size="sm"
                variant="ghost"
                disabled={flagging}
                onClick={() => void updateFlag(false)}
              >
                Clear flag
              </Button>
            )}
          </div>
          {conversation.flaggedAt && (
            <p className="text-xs text-slate-500">Flagged at {formatDateTime(conversation.flaggedAt)}</p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages ({conversation.messages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-slate-500">No messages in this conversation.</p>
          ) : (
            conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg border px-4 py-3 ${
                  msg.sender === "user"
                    ? "border-violet-200 bg-violet-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold uppercase text-slate-700">{msg.sender}</span>
                  <span>{formatDateTime(msg.createdAt)}</span>
                  {msg.sender === "auryn" && msg.instructionVersionNumber != null && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
                      instruction v{msg.instructionVersionNumber}
                    </span>
                  )}
                  {msg.instructionVersionId && (
                    <span className="font-mono text-[10px] text-slate-400">
                      {msg.instructionVersionId}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-800">{msg.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
