"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isAdmin) {
      router.replace("/prompt-system");
      return;
    }

    router.replace("/access-denied");
  }, [isLoading, user, isAdmin, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
        <p className="text-sm text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
