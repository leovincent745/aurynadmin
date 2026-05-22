"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PromptGovernanceSnapshot, PromptValidationRunDto } from "@/lib/domain/prompt-validation";
import { networkErrorMessage } from "@/lib/utils/network-error";

const POLL_MS = 1500;

function isPollingStatus(status: string | undefined): boolean {
  return status === "queued" || status === "running";
}

export function usePromptGovernance(
  instructionId: string | null,
  outputSchemaValid: boolean,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const [governance, setGovernance] = useState<PromptGovernanceSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const pollRunIdRef = useRef<string | null>(null);

  const fetchGovernance = useCallback(async () => {
    if (!instructionId) {
      setGovernance(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prompts/${instructionId}/validation`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load validation state");
      const json = (await res.json()) as { governance: PromptGovernanceSnapshot };
      setGovernance(json.governance);
      pollRunIdRef.current = isPollingStatus(json.governance.latestRun?.status)
        ? json.governance.latestRun?.id ?? null
        : null;
    } catch {
      setError(networkErrorMessage("Could not load validation history."));
      setGovernance(null);
    } finally {
      setLoading(false);
    }
  }, [instructionId]);

  const fetchRun = useCallback(
    async (runId: string) => {
      if (!instructionId) return;
      const res = await fetch(
        `/api/admin/prompts/${instructionId}/validation?runId=${runId}`,
        { credentials: "include" },
      );
      if (!res.ok) return;
      const json = (await res.json()) as { run: PromptValidationRunDto };
      setGovernance((prev) => {
        if (!prev) return prev;
        const history = prev.history.map((r) => (r.id === runId ? json.run : r));
        const latestRun = prev.latestRun?.id === runId ? json.run : prev.latestRun;
        return {
          ...prev,
          latestRun,
          history,
        };
      });
      if (!isPollingStatus(json.run.status)) {
        pollRunIdRef.current = null;
        void fetchGovernance();
      }
    },
    [instructionId, fetchGovernance],
  );

  useEffect(() => {
    if (!enabled) return;
    void fetchGovernance();
  }, [fetchGovernance, outputSchemaValid, enabled]);

  useEffect(() => {
    if (!enabled || !instructionId || !pollRunIdRef.current) return;

    const id = window.setInterval(() => {
      void fetchRun(pollRunIdRef.current!);
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [enabled, instructionId, governance?.latestRun?.status, fetchRun]);

  const runValidation = useCallback(
    async (payload?: { testInput?: Record<string, unknown>; testOutput?: Record<string, unknown> }) => {
      if (!instructionId) return;
      setActionLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/prompts/${instructionId}/validate`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload ?? {}),
        });
        const json = (await res.json()) as { run?: PromptValidationRunDto; message?: string };
        if (!res.ok) {
          throw new Error(json.message ?? "Validation run failed");
        }
        if (json.run && isPollingStatus(json.run.status)) {
          pollRunIdRef.current = json.run.id;
        }
        await fetchGovernance();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Validation run failed");
      } finally {
        setActionLoading(false);
      }
    },
    [instructionId, fetchGovernance],
  );

  const cancelRun = useCallback(async () => {
    if (!instructionId || !governance?.latestRun) return;
    if (!isPollingStatus(governance.latestRun.status)) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/prompts/${instructionId}/validate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelRunId: governance.latestRun.id }),
      });
      pollRunIdRef.current = null;
      await fetchGovernance();
    } finally {
      setActionLoading(false);
    }
  }, [instructionId, governance?.latestRun, fetchGovernance]);

  const submitReview = useCallback(
    async (action: "submit" | "approve" | "reject", comment?: string) => {
      if (!instructionId) return;
      setActionLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/prompts/${instructionId}/submit-review`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, comment }),
        });
        const json = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(json.message ?? "Review action failed");
        await fetchGovernance();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Review action failed");
      } finally {
        setActionLoading(false);
      }
    },
    [instructionId, fetchGovernance],
  );

  const addComment = useCallback(
    async (runId: string, body: string) => {
      if (!instructionId) return;
      setActionLoading(true);
      try {
        const res = await fetch(`/api/admin/prompts/${instructionId}/validation/comment`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId, body }),
        });
        if (!res.ok) throw new Error("Failed to add comment");
        await fetchGovernance();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add comment");
      } finally {
        setActionLoading(false);
      }
    },
    [instructionId, fetchGovernance],
  );

  const recordPhysicianApproval = useCallback(
    async (action: "approve" | "reject", comment?: string) => {
      if (!instructionId) return;
      setActionLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/prompts/${instructionId}/physician-approval`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, comment }),
        });
        if (!res.ok) throw new Error("Physician approval failed");
        await fetchGovernance();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Physician approval failed");
      } finally {
        setActionLoading(false);
      }
    },
    [instructionId, fetchGovernance],
  );

  return {
    governance,
    loading,
    error,
    actionLoading,
    polling: isPollingStatus(governance?.latestRun?.status),
    refresh: fetchGovernance,
    runValidation,
    cancelRun,
    submitReview,
    addComment,
    recordPhysicianApproval,
  };
}
