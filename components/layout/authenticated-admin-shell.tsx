"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import {
  getPromptBreadcrumbs,
  getPromptNavItems,
} from "@/components/prompt-system/prompt-nav";
import { useAuth } from "@/lib/auth-context";

function AdminLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  );
}

export function AuthenticatedAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }
    if (!isAdmin) {
      router.replace("/access-denied");
    }
  }, [isLoading, user, isAdmin, pathname, router]);

  if (isLoading || !user || !isAdmin) {
    return <AdminLoadingSkeleton />;
  }

  return (
    <AdminShell navItems={getPromptNavItems(pathname)} breadcrumbs={getPromptBreadcrumbs(pathname)}>
      {children}
    </AdminShell>
  );
}
