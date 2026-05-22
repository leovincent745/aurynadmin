"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Copy, Eye } from "lucide-react";

import { InstructionVersionViewer } from "@/components/admin/instruction-version-viewer";
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
import type {
  InstructionHistoryResponse,
  InstructionRecord,
} from "@/lib/domain/admin-instructions";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const statusStyles: Record<string, string> = {
  draft: "bg-violet-100 text-violet-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-100 text-slate-700",
};

export function InstructionHistory() {
  const [history, setHistory] = useState<InstructionHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewInstruction, setViewInstruction] = useState<InstructionRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [cloneLoadingId, setCloneLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadHistory = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/instructions/history?page=${targetPage}&limit=20`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load history");
      const data = (await response.json()) as InstructionHistoryResponse;
      setHistory(data);
      setPage(data.page);
    } catch {
      setError("Unable to load version history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(page);
  }, [loadHistory, page]);

  const openDetail = async (id: string) => {
    setViewLoading(true);
    setViewInstruction(null);
    try {
      const response = await fetch(`/api/admin/instructions/${id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not found");
      const data = (await response.json()) as { instruction: InstructionRecord };
      setViewInstruction(data.instruction);
    } catch {
      setError("Unable to load version details.");
    } finally {
      setViewLoading(false);
    }
  };

  const cloneToDraft = async (id: string) => {
    setCloneLoadingId(id);
    setActionMessage(null);
    try {
      const response = await fetch(`/api/admin/instructions/${id}/clone-to-draft`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Clone failed");
      setActionMessage("Copied into working draft. Edit and publish from AI Instructions.");
    } catch {
      setError("Unable to copy version into draft.");
    } finally {
      setCloneLoadingId(null);
    }
  };

  if (loading && !history) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Instruction Version History</h1>
          <p className="mt-1 text-sm text-slate-600">
            Audit trail of all instruction versions. Trace production chat via instruction ID.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/instructions">Back to editor</Link>
        </Button>
      </div>

      {actionMessage && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMessage}{" "}
          <Link href="/admin/instructions" className="font-semibold underline">
            Open editor
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All versions</CardTitle>
        </CardHeader>
        <CardContent>
          {!history || history.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No instruction versions yet. Create your first draft in AI Instructions.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created by</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">v{item.versionNumber}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles[item.status] ?? ""}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>{item.createdByEmail}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell>{formatDateTime(item.publishedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void openDetail(item.id)}
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={cloneLoadingId === item.id}
                            onClick={() => void cloneToDraft(item.id)}
                          >
                            <Copy className="mr-1 h-3.5 w-3.5" />
                            {cloneLoadingId === item.id ? "..." : "To draft"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {history.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {history.page} of {history.totalPages} ({history.total} versions)
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
                      disabled={page >= history.totalPages || loading}
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

      {(viewInstruction || viewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Version details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setViewInstruction(null)}>
                Close
              </Button>
            </CardHeader>
            <CardContent>
              {viewLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : viewInstruction ? (
                <InstructionVersionViewer instruction={viewInstruction} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
