"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { promptSystemNavItems } from "@/components/prompt-system/prompt-nav";
import { PromptSystemDashboard } from "@/components/prompt-system/prompt-system-dashboard";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated, email, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 mx-auto"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminShell navItems={promptSystemNavItems} breadcrumbs={["Intelligence", "Prompt System"]}>
      <PromptSystemDashboard />
    </AdminShell>
  );
}
