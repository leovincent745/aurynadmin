import { Suspense } from "react";

import { AuthenticatedAdminShell } from "@/components/layout/authenticated-admin-shell";
import { PromptSystemLive } from "@/components/prompt-system/prompt-system-live";

function PromptSystemFallback() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
      <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}

export default function PromptSystemPage() {
  return (
    <AuthenticatedAdminShell>
      <Suspense fallback={<PromptSystemFallback />}>
        <PromptSystemLive />
      </Suspense>
    </AuthenticatedAdminShell>
  );
}
