"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Flag, Search } from "lucide-react";

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
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedGuestId, setAppliedGuestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number, filters: { email: string; guestId: string }) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(targetPage), limit: "20" });
    if (filters.email.trim()) params.set("email", filters.email.trim());
    if (filters.guestId.trim()) params.set("guestId", filters.guestId.trim());

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
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      setAppliedEmail(emailFromUrl);
    }
  }, []);

  useEffect(() => {
    void load(page, { email: appliedEmail, guestId: appliedGuestId });
  }, [load, page, appliedEmail, appliedGuestId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedEmail(email);
    setAppliedGuestId(guestId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Conversation Review</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recent user and guest chats only. Admin test threads are excluded.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
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
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              <Search className="mr-1 h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Updated</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Last message</TableHead>
                    <TableHead>Instr. ver.</TableHead>
                    <TableHead>Msgs</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{formatDateTime(item.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.participant}</span>
                          <span className="text-[10px] uppercase text-slate-400">
                            {item.participantType}
                          </span>
                          {item.flaggedForReview && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              <Flag className="h-3 w-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-slate-600">
                        {item.lastMessagePreview ?? "—"}
                      </TableCell>
                      <TableCell>
                        {item.lastInstructionVersion != null
                          ? `v${item.lastInstructionVersion}`
                          : "—"}
                      </TableCell>
                      <TableCell>{item.messageCount}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/conversations/${item.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} conversations)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => p - 1)}
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
