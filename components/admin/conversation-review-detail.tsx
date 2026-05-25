"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Flag } from "lucide-react";

import { InstructionVersionTraceLink } from "@/components/admin/instruction-version-trace-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userProfileHref } from "@/lib/admin/user-review-links";
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
          <Link href="/conversations">Back to list</Link>
        </Button>
      </div>
    );
  }

  if (!conversation) return null;

  const uniqueAurynVersions = conversation.messages
    .filter((m) => m.sender === "auryn" && m.instructionVersionId)
    .reduce<{ id: string; version: number | null }[]>((acc, m) => {
      if (!acc.some((x) => x.id === m.instructionVersionId)) {
        acc.push({
          id: m.instructionVersionId!,
          version: m.instructionVersionNumber,
        });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/conversations">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-slate-950">
            {conversation.participantType === "user" && conversation.userId ? (
              <Link
                href={userProfileHref(conversation.userId)}
                className="text-violet-700 hover:underline"
              >
                {conversation.participant}
              </Link>
            ) : (
              conversation.participant
            )}
          </h1>
          <p className="text-xs text-slate-500 capitalize">
            {conversation.participantType} · started {formatDateTime(conversation.createdAt)}
          </p>
          {conversation.participantType === "user" && conversation.userId ? (
            <Button asChild variant="link" size="sm" className="h-auto px-0 text-violet-700">
              <Link href={userProfileHref(conversation.userId)}>Open user profile</Link>
            </Button>
          ) : null}
          <p className="mt-1 font-mono text-[10px] text-slate-400">{conversation.id}</p>
        </div>
        {conversation.flaggedForReview ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Flagged for review
          </span>
        ) : null}
      </div>

      <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Read-only review. Admins cannot impersonate this user or send messages on their behalf.
      </p>

      {uniqueAurynVersions.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Instruction versions in thread</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {uniqueAurynVersions.map((v) => (
              <InstructionVersionTraceLink
                key={v.id}
                instructionVersionId={v.id}
                versionNumber={v.version}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flag for review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Optional note for reviewers…"
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
            {conversation.flaggedForReview ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={flagging}
                onClick={() => void updateFlag(false)}
              >
                Clear flag
              </Button>
            ) : null}
          </div>
          {conversation.flaggedAt ? (
            <p className="text-xs text-slate-500">
              Flagged at {formatDateTime(conversation.flaggedAt)}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Message history ({conversation.messages.length})</CardTitle>
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
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold uppercase text-slate-700">{msg.sender}</span>
                  <span>{formatDateTime(msg.createdAt)}</span>
                </div>
                {msg.sender === "auryn" ? (
                  <div className="mb-2">
                    <InstructionVersionTraceLink
                      instructionVersionId={msg.instructionVersionId}
                      versionNumber={msg.instructionVersionNumber}
                    />
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap text-sm text-slate-800">{msg.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
