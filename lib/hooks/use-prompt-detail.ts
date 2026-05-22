"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PromptDetailResponse } from "@/lib/domain/prompt-detail";
import { networkErrorMessage } from "@/lib/utils/network-error";

const detailCache = new Map<string, PromptDetailResponse>();

export function invalidatePromptDetailCache(id?: string): void {
  if (id) {
    detailCache.delete(id);
  } else {
    detailCache.clear();
  }
}

export function usePromptDetail(promptId: string | null) {
  const [detail, setDetail] = useState<PromptDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchDetail = useCallback(async (id: string, options?: { force?: boolean }) => {
    const requestId = ++requestIdRef.current;

    if (!options?.force && detailCache.has(id)) {
      setDetail(detailCache.get(id)!);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(`/api/admin/prompts/${id}`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Prompt not found");
        throw new Error("Failed to load prompt details");
      }
      const json = (await res.json()) as { prompt: PromptDetailResponse };
      if (requestId !== requestIdRef.current) return;

      detailCache.set(id, json.prompt);
      setDetail(json.prompt);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setDetail(null);
      setError(
        networkErrorMessage(
          err instanceof Error ? err.message : "Could not load prompt details",
        ),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!promptId) {
      setDetail(null);
      setError(null);
      setLoading(false);
      return;
    }

    void fetchDetail(promptId);
  }, [promptId, fetchDetail]);

  const retry = useCallback(() => {
    if (promptId) void fetchDetail(promptId, { force: true });
  }, [promptId, fetchDetail]);

  const invalidate = useCallback(() => {
    if (promptId) invalidatePromptDetailCache(promptId);
  }, [promptId]);

  return {
    detail,
    loading,
    error,
    retry,
    invalidate,
    refresh: retry,
  };
}
