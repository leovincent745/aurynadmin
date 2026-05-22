"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  PromptPermission,
  PromptSystemPermissions,
} from "@/lib/auth/prompt-permissions";
import { hasPromptPermission } from "@/lib/auth/prompt-permissions";

const defaultPermissions: PromptSystemPermissions = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canRunValidation: false,
  canSubmitReview: false,
  canApproveReview: false,
  canActivate: false,
  canRollback: false,
  canArchive: false,
  canRecordPhysicianApproval: false,
  canPublish: false,
};

export function usePromptPermissions() {
  const [permissions, setPermissions] =
    useState<PromptSystemPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) throw new Error("auth");
        const json = (await res.json()) as { promptSystem?: PromptSystemPermissions };
        if (!cancelled && json.promptSystem) {
          setPermissions(json.promptSystem);
        }
      } catch {
        if (!cancelled) setPermissions(defaultPermissions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const can = useCallback(
    (permission: PromptPermission) => hasPromptPermission(permissions, permission),
    [permissions],
  );

  const isReadOnly =
    permissions.canView &&
    !permissions.canEdit &&
    !permissions.canCreate &&
    !permissions.canRunValidation &&
    !permissions.canApproveReview &&
    !permissions.canRecordPhysicianApproval;

  return { permissions, loading, can, isReadOnly };
}
