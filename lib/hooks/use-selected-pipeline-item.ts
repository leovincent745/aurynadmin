"use client";

import { useEffect, useMemo, useState } from "react";

import type { PromptDetailResponse } from "@/lib/domain/prompt-detail";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import { mapPromptDetailToListItem } from "@/lib/prompt-system/map-detail-to-list-item";
import { networkErrorMessage } from "@/lib/utils/network-error";

/**
 * Resolves the selected pipeline row from the current page or fetches detail by id
 * so deep links (`?selected=`) work when the row is off-page.
 */
export function useSelectedPipelineItem(
  selectedId: string | null,
  pageItems: PromptPipelineListItem[],
): {
  item: PromptPipelineListItem | null;
  loading: boolean;
  error: string | null;
} {
  const fromPage = useMemo(
    () => (selectedId ? pageItems.find((i) => i.id === selectedId) ?? null : null),
    [selectedId, pageItems],
  );

  const [fetched, setFetched] = useState<PromptDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId || fromPage) {
      setFetched(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(`/api/admin/prompts/${selectedId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Prompt not found" : "Failed to load prompt");
        }
        const json = (await res.json()) as { prompt: PromptDetailResponse };
        if (!cancelled) setFetched(json.prompt);
      } catch (e) {
        if (!cancelled) {
          setFetched(null);
          setError(
            networkErrorMessage(
              e instanceof Error ? e.message : "Could not load prompt",
            ),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, fromPage]);

  const item = useMemo(() => {
    if (!selectedId) return null;
    if (fromPage) return fromPage;
    if (fetched) return mapPromptDetailToListItem(fetched);
    return null;
  }, [selectedId, fromPage, fetched]);

  return { item, loading: !fromPage && loading, error: !fromPage ? error : null };
}
