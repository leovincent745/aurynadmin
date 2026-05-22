"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function AccessDeniedPage() {
  const { logout, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50 p-6">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-slate-950">Access denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          {user
            ? `Signed in as ${user.email} (${user.role}). This account cannot access admin tools.`
            : "You do not have permission to access the admin area."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" onClick={() => logout()}>
            Sign out
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
