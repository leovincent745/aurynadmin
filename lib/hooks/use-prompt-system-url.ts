"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { PromptDetailTabSlug } from "@/lib/domain/prompt-detail-tabs";
import {
  buildPromptSystemHref,
  mergePromptSystemParams,
  readPromptSystemUrlState,
  type PromptSystemUrlPatch,
} from "@/lib/prompt-system/url-state";

export type PromptUrlHistoryMode = "push" | "replace";

/**
 * Central URL sync for /prompt-system — filters, selection, and detail tab.
 * Use `push` for discrete navigation (selection, tab, filters, page).
 * Use `replace` for debounced/high-frequency updates (search).
 */
export function usePromptSystemUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const state = useMemo(
    () => readPromptSystemUrlState(new URLSearchParams(searchKey)),
    [searchKey],
  );

  const updateUrl = useCallback(
    (patch: PromptSystemUrlPatch, options?: { history?: PromptUrlHistoryMode }) => {
      const params = mergePromptSystemParams(new URLSearchParams(searchKey), patch);
      const href = buildPromptSystemHref(pathname, params);
      const history = options?.history ?? "push";

      if (history === "replace") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router, searchKey],
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      updateUrl({ selected: id });
    },
    [updateUrl],
  );

  const setTab = useCallback(
    (tab: PromptDetailTabSlug) => {
      updateUrl({ tab });
    },
    [updateUrl],
  );

  const clearSelection = useCallback(() => {
    updateUrl({ selected: null });
  }, [updateUrl]);

  return {
    pathname,
    searchParams,
    searchKey,
    ...state,
    updateUrl,
    setSelectedId,
    setTab,
    clearSelection,
  };
}
