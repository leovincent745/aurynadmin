"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Search } from "lucide-react";

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
import { conversationsHrefForUserEmail } from "@/lib/admin/user-review-links";
import type { UserListResponse } from "@/lib/domain/user-profiles";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UserProfilesList() {
  const [data, setData] = useState<UserListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number, filters: { email: string }) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(targetPage), limit: "20" });
    if (filters.email.trim()) params.set("email", filters.email.trim());

    try {
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load");
      const json = (await response.json()) as UserListResponse;
      setData(json);
      setPage(json.page);
    } catch {
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page, { email: appliedEmail });
  }, [load, page, appliedEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedEmail(email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Logged-in end-user accounts only (role <code className="text-xs">user</code>). Use this
          context while reviewing conversations — no pathway scoring, adherence, or physician
          governance in Step 1.
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
              placeholder="Email"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
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
              No logged-in users yet. Registered accounts with the end-user role appear here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.displayName ?? "—"}
                        </TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {item.hasProfile ? "On file" : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/users/${item.id}`}>View</Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={conversationsHrefForUserEmail(item.email)}>
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {data.totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} users)
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
