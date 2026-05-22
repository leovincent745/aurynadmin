"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  MessageSquare,
  Users,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardSummary, ProductionStatus } from "@/lib/domain/admin-dashboard";

const quickLinks = [
  { label: "Prompt System", href: "/prompt-system", icon: WandSparkles },
  { label: "Test Chat", href: "/test-chat", icon: FlaskConical },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "AI Optimization Center", href: "/ai-optimization-center", icon: ClipboardList },
  { label: "User Profiles", href: "/users", icon: Users },
];

const statusConfig: Record<
  ProductionStatus,
  { label: string; description: string; badgeClass: string; Icon: typeof CheckCircle2 }
> = {
  active: {
    label: "Active",
    description: "A published instruction version is live for public chat.",
    badgeClass: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    Icon: CheckCircle2,
  },
  no_published_instructions: {
    label: "No published instructions",
    description: "Instructions exist but none are published for production chat yet.",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-600/20",
    Icon: AlertCircle,
  },
  needs_setup: {
    label: "Needs setup",
    description: "Create and publish AI instructions before users rely on Auryn chat.",
    badgeClass: "bg-rose-50 text-rose-800 ring-rose-600/20",
    Icon: AlertCircle,
  },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }
        const summary = (await response.json()) as AdminDashboardSummary;
        setData(summary);
      } catch {
        setError("Unable to load dashboard data. Please refresh or try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
        <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-red-600">{error}</CardContent>
      </Card>
    );
  }

  const status = statusConfig[data.productionStatus];
  const StatusIcon = status.Icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Live instruction status and quick access to Step 1 admin tools.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Production instruction status</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{status.description}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          {data.activePublished ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Active version
                </dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  v{data.activePublished.versionNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Last published
                </dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {formatDateTime(data.activePublished.publishedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Published by
                </dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {data.activePublished.publishedByEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Instruction ID
                </dt>
                <dd className="mt-1 font-mono text-xs text-slate-700">
                  {data.activePublished.id}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="font-medium text-slate-800">No live instruction version</p>
              <p className="mt-1 text-xs text-slate-500">
                {data.hasDraft
                  ? "A draft exists — publish from AI Instructions when ready."
                  : "Create your first instruction set to enable governed Auryn chat."}
              </p>
              <Button asChild className="mt-4 bg-violet-600 hover:bg-violet-700">
                <Link href="/admin/instructions">
                  {data.hasDraft ? "Review draft" : "Set up instructions"}
                </Link>
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Production note: public chat uses the active published version only. Drafts never affect
            live users.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1 admin tools</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Button key={link.href} asChild variant="outline" className="h-auto justify-start gap-2 py-3">
              <Link href={link.href}>
                <link.icon className="h-4 w-4 shrink-0 text-violet-600" />
                {link.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
