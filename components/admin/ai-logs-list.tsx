"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

import { InstructionVersionTraceLink } from "@/components/admin/instruction-version-trace-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AiLogDetail, AiLogEventType, AiLogListResponse } from "@/lib/domain/ai-logs";
import { aiLogEventTypes } from "@/lib/domain/ai-logs";

const EVENT_LABELS: Record<AiLogEventType, string> = {
  chat_success: "AI success",
  chat_error: "AI failure",
  safety_escalation: "Safety escalation",
  safety_refusal: "Safety refusal",
};

const EVENT_BADGE: Record<AiLogEventType, string> = {
  chat_success: "bg-emerald-100 text-emerald-800",
  chat_error: "bg-red-100 text-red-800",
  safety_escalation: "bg-amber-100 text-amber-900",
  safety_refusal: "bg-violet-100 text-violet-800",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function EventBadge({ eventType }: { eventType: AiLogEventType }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${EVENT_BADGE[eventType]}`}
    >
      {EVENT_LABELS[eventType]}
    </span>
  );
}

function participantIdLabel(detail: AiLogDetail): string {
  if (detail.userId) return `User id: ${detail.userId}`;
  if (detail.anonymousSessionId) return `Guest id: ${detail.anonymousSessionId}`;
  return "—";
}

export function AiLogsList() {
  const [data, setData] = useState<AiLogListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [instructionVersionId, setInstructionVersionId] = useState("");
  const [appliedEventType, setAppliedEventType] = useState("");
  const [appliedConversationId, setAppliedConversationId] = useState("");
  const [appliedInstructionVersionId, setAppliedInstructionVersionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AiLogDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(
    async (
      targetPage: number,
      filters: {
        eventType: string;
        conversationId: string;
        instructionVersionId: string;
      },
    ) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(targetPage), limit: "25" });
      if (filters.eventType) params.set("eventType", filters.eventType);
      if (filters.conversationId.trim()) {
        params.set("conversationId", filters.conversationId.trim());
      }
      if (filters.instructionVersionId.trim()) {
        params.set("instructionVersionId", filters.instructionVersionId.trim());
      }

      try {
        const response = await fetch(`/api/admin/ai-logs?${params}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load");
        const json = (await response.json()) as AiLogListResponse;
        setData(json);
        setPage(json.page);
      } catch {
        setError("Unable to load AI logs.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const versionFromUrl = params.get("instructionVersionId");
    if (versionFromUrl) {
      setInstructionVersionId(versionFromUrl);
      setAppliedInstructionVersionId(versionFromUrl);
    }
    const convFromUrl = params.get("conversationId");
    if (convFromUrl) {
      setConversationId(convFromUrl);
      setAppliedConversationId(convFromUrl);
    }
  }, []);

  useEffect(() => {
    void load(page, {
      eventType: appliedEventType,
      conversationId: appliedConversationId,
      instructionVersionId: appliedInstructionVersionId,
    });
  }, [load, page, appliedEventType, appliedConversationId, appliedInstructionVersionId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);

    void (async () => {
      try {
        const response = await fetch(`/api/admin/ai-logs/${selectedId}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load detail");
        const json = (await response.json()) as { log: AiLogDetail };
        if (!cancelled) setDetail(json.log);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedEventType(eventType);
    setAppliedConversationId(conversationId);
    setAppliedInstructionVersionId(instructionVersionId);
  };

  const clearVersionFilter = () => {
    setInstructionVersionId("");
    setAppliedInstructionVersionId("");
    setPage(1);
  };

  const openDetail = (id: string) => setSelectedId(id);
  const closeDetail = () => setSelectedId(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">AI Logs &amp; Safety</h1>
        <p className="mt-1 text-sm text-slate-600">
          Real chat outcomes from Prompt System health: successes, OpenAI/backend failures, and
          safety escalations or refusals. Secrets are redacted before storage and display.
        </p>
      </div>

      {appliedInstructionVersionId ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          <span>
            Filtered by instruction version{" "}
            <span className="font-mono text-xs">{appliedInstructionVersionId}</span>
          </span>
          <Button type="button" variant="outline" size="sm" onClick={clearVersionFilter}>
            Clear version filter
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilter} className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              aria-label="Event type"
            >
              <option value="">All event types</option>
              {aiLogEventTypes.map((type) => (
                <option key={type} value={type}>
                  {EVENT_LABELS[type]}
                </option>
              ))}
            </select>
            <input
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="Conversation ID"
              className="min-w-[12rem] flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
            />
            <input
              value={instructionVersionId}
              onChange={(e) => setInstructionVersionId(e.target.value)}
              placeholder="Instruction version ID"
              className="min-w-[12rem] flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
            />
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="relative flex gap-4">
        <Card className={selectedId ? "min-w-0 flex-1" : "w-full"}>
          <CardContent className="pt-6">
            {loading && !data ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
            ) : !data || data.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No AI logs yet. Public chat or admin test messages will create entries here.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date / time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Conversation</TableHead>
                        <TableHead>User / guest</TableHead>
                        <TableHead>Instruction</TableHead>
                        <TableHead>Error summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((item) => (
                        <TableRow
                          key={item.id}
                          className={`cursor-pointer ${selectedId === item.id ? "bg-violet-50" : ""}`}
                          onClick={() => openDetail(item.id)}
                        >
                          <TableCell className="whitespace-nowrap text-xs">
                            {formatDateTime(item.createdAt)}
                          </TableCell>
                          <TableCell>
                            <EventBadge eventType={item.eventType} />
                          </TableCell>
                          <TableCell className="max-w-[8rem] truncate font-mono text-[10px]">
                            {item.status}
                          </TableCell>
                          <TableCell className="font-mono text-[10px]">
                            {item.isAdminTest ? (
                              <span className="text-slate-500" title={item.conversationId}>
                                {item.conversationId.slice(0, 10)}… (test)
                              </span>
                            ) : (
                              <Link
                                href={`/conversations/${item.conversationId}`}
                                className="text-violet-700 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {item.conversationId.slice(0, 10)}…
                              </Link>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium">{item.participant}</span>
                            <span className="ml-1 text-[10px] uppercase text-slate-400">
                              {item.participantType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <InstructionVersionTraceLink
                              instructionVersionId={item.instructionVersionId}
                              versionNumber={item.instructionVersionNumber}
                              compact
                            />
                          </TableCell>
                          <TableCell className="max-w-[12rem] truncate text-xs text-slate-600">
                            {item.errorSummaryPreview ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {data.totalPages > 1 ? (
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>
                      Page {data.page} of {data.totalPages} ({data.total} logs)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={page >= data.totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        {selectedId ? (
          <Card className="w-full max-w-md shrink-0">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Log detail</CardTitle>
              <Button size="sm" variant="ghost" onClick={closeDetail} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {detailLoading ? <p className="text-slate-500">Loading…</p> : null}
              {!detailLoading && detail ? (
                <>
                  <div>
                    <EventBadge eventType={detail.eventType} />
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(detail.createdAt)}</p>
                  </div>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Status</dt>
                      <dd className="font-mono text-xs break-all">{detail.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">User / guest</dt>
                      <dd className="text-xs">
                        {detail.participant}
                        <span className="ml-1 text-[10px] uppercase text-slate-400">
                          ({detail.participantType}
                          {detail.isAdminTest ? ", admin test" : ""})
                        </span>
                      </dd>
                      <dd className="mt-1 font-mono text-[10px] text-slate-500 break-all">
                        {participantIdLabel(detail)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Conversation ID</dt>
                      <dd className="font-mono text-xs break-all">{detail.conversationId}</dd>
                      {!detail.isAdminTest ? (
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href={`/conversations/${detail.conversationId}`}>
                            Open conversation
                          </Link>
                        </Button>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-500">
                          Admin test thread — not in Conversation Review.
                        </p>
                      )}
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 mb-1">Instruction version</dt>
                      <dd>
                        <InstructionVersionTraceLink
                          instructionVersionId={detail.instructionVersionId}
                          versionNumber={detail.instructionVersionNumber}
                        />
                      </dd>
                    </div>
                    {detail.errorSummary ? (
                      <div>
                        <dt className="text-xs font-medium text-slate-500">Error / safety summary</dt>
                        <dd className="mt-1 rounded-md bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap break-words">
                          {detail.errorSummary}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              ) : null}
              {!detailLoading && !detail ? (
                <p className="text-slate-500">Could not load log detail.</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
