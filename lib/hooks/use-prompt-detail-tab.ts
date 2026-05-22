"use client";

import {
  PROMPT_DETAIL_TABS,
  tabLabelToSlug,
  tabSlugToLabel,
} from "@/lib/domain/prompt-detail-tabs";
import { usePromptSystemUrl } from "@/lib/hooks/use-prompt-system-url";

/** Detail panel tab state synced to `?tab=` (shareable, back/forward aware). */
export function usePromptDetailTab() {
  const { tab: activeSlug, setTab, updateUrl } = usePromptSystemUrl();

  const setActiveTab = setTab;

  const setActiveTabByLabel = (label: string) => {
    const slug = tabLabelToSlug(label);
    if (slug) setActiveTab(slug);
  };

  return {
    activeSlug,
    activeLabel: tabSlugToLabel(activeSlug),
    tabs: PROMPT_DETAIL_TABS,
    setActiveTab,
    setActiveTabByLabel,
    /** Advanced: patch tab with other URL fields in one navigation. */
    updateUrl,
  };
}
