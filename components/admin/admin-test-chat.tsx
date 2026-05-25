"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlaskConical, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_TEST_SAFETY_SHORTCUTS } from "@/lib/constants/safety-test-prompts";
import type { TestChatMode } from "@/lib/domain/test-chat";

interface ChatMessage {
  id: string;
  role: "user" | "auryn";
  content: string;
  meta?: string;
}

function modeFromSearchParams(params: URLSearchParams): TestChatMode {
  return params.get("mode") === "published" ? "published" : "draft";
}

export function AdminTestChat() {
  const searchParams = useSearchParams();
  const contextInstructionId = searchParams.get("instructionId");
  const contextVersion = searchParams.get("version");
  const contextArchived = searchParams.get("archived") === "1";

  const initialMode = useMemo(() => modeFromSearchParams(searchParams), [searchParams]);
  const [mode, setMode] = useState<TestChatMode>(initialMode);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetThread = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  }, []);

  useEffect(() => {
    setMode(modeFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    resetThread();
  }, [mode, contextInstructionId, resetThread]);

  const activeInstructionId =
    contextInstructionId && !contextArchived ? contextInstructionId : undefined;

  const sendMessage = async (text: string) => {
    if (!text.trim() || contextArchived) return;

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
          instructionId: activeInstructionId,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        conversationId?: string;
        instructionVersionId?: string | null;
        instructionVersionNumber?: number | null;
        instructionSource?: string;
        safetyHandled?: boolean;
        label?: string;
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
        data.label ?? "Admin Test",
        data.instructionSource ? `source: ${data.instructionSource}` : null,
        data.instructionVersionNumber != null ? `v${data.instructionVersionNumber}` : null,
        data.instructionVersionId
          ? `id: ${data.instructionVersionId.slice(0, 8)}…`
          : null,
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

  const inputDisabled = sending || contextArchived;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Admin Test Chat</h1>
            <p className="mt-1 text-sm text-slate-600">
              Sandbox for validating draft or published instructions before go-live. Threads are
              marked <span className="font-semibold">admin test</span> and excluded from
              Conversation Review.
            </p>
            {contextInstructionId && contextVersion ? (
              <p className="mt-2 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
                Opened from Prompt System — testing{" "}
                <span className="font-semibold">v{contextVersion}</span>
                {contextArchived
                  ? " (archived — run test is disabled for archived rows)"
                  : ` using ${mode} mode`}
                .
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/prompt-system">Prompt System</Link>
            </Button>
            {contextInstructionId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/prompt-system?selected=${contextInstructionId}&tab=overview`}>
                  Back to prompt
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instruction mode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="test-mode"
                checked={mode === "draft"}
                disabled={contextArchived}
                onChange={() => setMode("draft")}
              />
              Draft
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="test-mode"
                checked={mode === "published"}
                disabled={contextArchived}
                onChange={() => setMode("published")}
              />
              Published
            </label>
            <Button variant="ghost" size="sm" onClick={resetThread}>
              New test thread
            </Button>
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col border-violet-200">
          <CardHeader className="border-b border-violet-100 bg-violet-50/80 py-3">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-violet-800">
              <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
              <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Admin test
              </span>
              <span className="text-violet-700">
                Not shown in user Conversation Review · logged separately in AI Logs
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 pt-4">
            <div
              className="flex-1 space-y-3 overflow-y-auto"
              role="log"
              aria-label="Admin test chat messages"
            >
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Send a test message or use a safety shortcut. Responses are labeled as admin test.
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
                          : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                      }`}
                    >
                      {msg.role === "auryn" ? (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                          Auryn · Admin test · {msg.meta ?? "sandbox"}
                        </p>
                      ) : (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                          You · Admin test
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {error ? (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            ) : null}

            {contextArchived ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Archived instruction versions cannot be tested. Open an in-review or active row from
                Prompt System.
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a test message…"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                disabled={inputDisabled}
                aria-label="Test message"
              />
              <Button
                type="submit"
                disabled={inputDisabled || !message.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Send className="h-4 w-4" aria-hidden />
                <span className="sr-only">Send</span>
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
            Expect conservative, non-medical responses (refusal or urgent-care escalation) before
            publishing.
          </p>
          <ul className="space-y-2">
            {ADMIN_TEST_SAFETY_SHORTCUTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={inputDisabled}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50"
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
