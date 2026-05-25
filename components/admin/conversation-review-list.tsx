"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Flag, Search } from "lucide-react";

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
import { userProfileHref } from "@/lib/admin/user-review-links";
import type { ConversationListResponse } from "@/lib/domain/conversation-review";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ConversationReviewList() {
  const [data, setData] = useState<ConversationListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [guestId, setGuestId] = useState("");
  const [instructionVersionId, setInstructionVersionId] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedGuestId, setAppliedGuestId] = useState("");
  const [appliedInstructionVersionId, setAppliedInstructionVersionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (
      targetPage: number,
      filters: { email: string; guestId: string; instructionVersionId: string },
    ) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(targetPage), limit: "20" });
      if (filters.email.trim()) params.set("email", filters.email.trim());
      if (filters.guestId.trim()) params.set("guestId", filters.guestId.trim());
      if (filters.instructionVersionId.trim()) {
        params.set("instructionVersionId", filters.instructionVersionId.trim());
      }

      try {
        const response = await fetch(`/api/admin/conversations?${params}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load");
        const json = (await response.json()) as ConversationListResponse;
        setData(json);
        setPage(json.page);
      } catch {
        setError("Unable to load conversations.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setAppliedEmail(emailFromUrl);
    }
    const versionFromUrl = params.get("instructionVersionId");
    if (versionFromUrl) {
      setInstructionVersionId(versionFromUrl);
      setAppliedInstructionVersionId(versionFromUrl);
    }
  }, []);

  useEffect(() => {
    void load(page, {
      email: appliedEmail,
      guestId: appliedGuestId,
      instructionVersionId: appliedInstructionVersionId,
    });
  }, [load, page, appliedEmail, appliedGuestId, appliedInstructionVersionId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedEmail(email);
    setAppliedGuestId(guestId);
    setAppliedInstructionVersionId(instructionVersionId);
  };

  const clearVersionFilter = () => {
    setInstructionVersionId("");
    setAppliedInstructionVersionId("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Conversation Review</h1>
        <p className="mt-1 text-sm text-slate-600">
          Inspect recent user and guest public chats. Read-only — admins review quality here without
          impersonating users. Admin test threads are excluded.
        </p>
      </div>

      {appliedInstructionVersionId ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
          <span>
            Conversations that used instruction{" "}
            <span className="font-mono text-xs">{appliedInstructionVersionId}</span>
          </span>
          <Button type="button" variant="outline" size="sm" onClick={clearVersionFilter}>
            Clear version filter
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User email"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={guestId}
              onChange={(e) => setGuestId(e.target.value)}
              placeholder="Guest session ID"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={instructionVersionId}
              onChange={(e) => setInstructionVersionId(e.target.value)}
              placeholder="Instruction version ID"
              className="min-w-[12rem] flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
            />
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              <Search className="mr-1 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {loading && !data ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
          ) : !data || data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No conversations yet. Public chat messages will appear here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User / guest</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Latest message</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Instruction version</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead className="text-right"> </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {item.participantType === "user" && item.userId ? (
                              <Link
                                href={userProfileHref(item.userId)}
                                className="font-medium text-violet-700 hover:underline"
                              >
                                {item.participant}
                              </Link>
                            ) : (
                              <span className="font-medium text-slate-900">{item.participant}</span>
                            )}
                            <span className="text-[10px] uppercase text-slate-400">
                              {item.participantType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-700">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[14rem]">
                          <p className="text-xs text-slate-500">
                            {formatDateTime(item.lastMessageAt)}
                          </p>
                          <p className="truncate text-xs text-slate-700">
                            {item.lastMessagePreview ?? "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-center text-sm">{item.messageCount}</TableCell>
                        <TableCell>
                          <InstructionVersionTraceLink
                            instructionVersionId={item.lastInstructionVersionId}
                            versionNumber={item.lastInstructionVersion}
                            compact
                          />
                        </TableCell>
                        <TableCell>
                          {item.flaggedForReview ? (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              <Flag className="h-3 w-3" aria-hidden />
                              Flagged
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/conversations/${item.id}`}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data.totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} conversations)
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
    </div>
  );
}
