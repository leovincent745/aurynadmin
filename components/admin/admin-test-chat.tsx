"use client";

import Link from "next/link";
import { useState } from "react";
import { FlaskConical, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SAFETY_TEST_PROMPTS } from "@/lib/constants/safety-test-prompts";
import type { TestChatMode } from "@/lib/domain/test-chat";

interface ChatMessage {
  id: string;
  role: "user" | "auryn";
  content: string;
  meta?: string;
}

export function AdminTestChat() {
  const [mode, setMode] = useState<TestChatMode>("draft");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setSending(true);
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const response = await fetch("/api/admin/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: text.trim(),
          mode,
          conversationId,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        conversationId?: string;
        instructionVersionNumber?: number | null;
        instructionSource?: string;
        safetyHandled?: boolean;
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Test chat request failed");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const meta = [
        "Admin Test",
        data.instructionSource ? `source: ${data.instructionSource}` : null,
        data.instructionVersionNumber != null ? `v${data.instructionVersionNumber}` : null,
        data.safetyHandled ? "safety handled" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      setMessages((prev) => [
        ...prev,
        {
          id: `auryn-${Date.now()}`,
          role: "auryn",
          content: data.reply ?? "",
          meta,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send test message");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setMessage(text.trim());
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(message);
  };

  const resetThread = () => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Admin Test Chat</h1>
            <p className="mt-1 text-sm text-slate-600">
              Sandbox only — test messages are isolated from user Conversation Review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/instructions">Edit Instructions</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/admin/instructions">Publish</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Test mode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="test-mode"
                checked={mode === "draft"}
                onChange={() => {
                  setMode("draft");
                  resetThread();
                }}
              />
              Draft instructions
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="test-mode"
                checked={mode === "published"}
                onChange={() => {
                  setMode("published");
                  resetThread();
                }}
              />
              Published instructions (production)
            </label>
            <Button variant="ghost" size="sm" onClick={resetThread}>
              New test thread
            </Button>
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col">
          <CardHeader className="border-b py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
              <FlaskConical className="h-4 w-4" />
              Admin Test — not visible in user conversations
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pt-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  Send a test message or pick a safety prompt from the sidebar.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-violet-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      {msg.role === "auryn" && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                          Auryn · {msg.meta ?? "Admin Test"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a test message..."
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={sending || !message.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Safety test prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-slate-500">
            Run these before publishing. Expect conservative, non-medical responses.
          </p>
          <ul className="space-y-2">
            {SAFETY_TEST_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={sending}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:bg-violet-50 hover:border-violet-200 disabled:opacity-50"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
