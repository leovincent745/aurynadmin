"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfileDetail, UserProfileFields } from "@/lib/domain/user-profiles";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{value?.trim() || "—"}</dd>
    </div>
  );
}

function ProfileFieldsCard({ profile }: { profile: UserProfileFields }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <FieldRow label="Display name" value={profile.displayName} />
          <FieldRow label="Wellness goal" value={profile.wellnessGoal} />
          <FieldRow label="Physician / practice" value={profile.physicianPractice} />
          <FieldRow label="Active protocol" value={profile.activeProtocol} />
          <FieldRow label="Allergies & restrictions" value={profile.allergiesRestrictions} />
          <FieldRow label="Preferences" value={profile.preferences} />
          <FieldRow label="Memory summary" value={profile.memorySummary} />
        </dl>
      </CardContent>
    </Card>
  );
}

export function UserProfileDetail({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          credentials: "include",
        });
        if (response.status === 404) {
          if (!cancelled) setError("User not found.");
          return;
        }
        if (!response.ok) throw new Error("Failed to load");
        const json = (await response.json()) as { user: UserProfileDetail };
        if (!cancelled) setUser(json.user);
      } catch {
        if (!cancelled) setError("Unable to load user profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading...</p>;
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to users
          </Link>
        </Button>
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "User not found."}
        </div>
      </div>
    );
  }

  const conversationsHref = `/admin/conversations?email=${encodeURIComponent(user.email)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-3">
            <Link href="/admin/users">
              <ArrowLeft className="mr-1 h-4 w-4" />
              All users
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-slate-950">{user.email}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Joined {formatDateTime(user.createdAt)} · {user.conversationCount} conversation
            {user.conversationCount === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={conversationsHref}>
            <MessageSquare className="mr-1 h-4 w-4" />
            View conversations
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">User ID</dt>
              <dd className="font-mono text-xs break-all">{user.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Last updated</dt>
              <dd>{formatDateTime(user.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {user.profile ? (
        <ProfileFieldsCard profile={user.profile} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-sm text-slate-500">
            No profile record yet. Fields will appear when the user app saves profile data.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
