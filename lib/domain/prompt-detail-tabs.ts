/** Details preview tab configuration — single source for labels, URLs, and data deps. */

export const PROMPT_DETAIL_TAB_SLUGS = [
  "overview",
  "prompt",
  "inputs",
  "outputs",
  "validation",
  "history",
] as const;

export type PromptDetailTabSlug = (typeof PROMPT_DETAIL_TAB_SLUGS)[number];

export interface PromptDetailTabDefinition {
  slug: PromptDetailTabSlug;
  label: string;
  /** Fetch pipeline IO when this tab is first activated. */
  requiresIo: boolean;
  /** Load governance snapshot when this tab is first activated. */
  requiresGovernance: boolean;
}

export const PROMPT_DETAIL_TABS: PromptDetailTabDefinition[] = [
  { slug: "overview", label: "Overview", requiresIo: false, requiresGovernance: false },
  { slug: "prompt", label: "Prompt", requiresIo: false, requiresGovernance: false },
  { slug: "inputs", label: "Inputs", requiresIo: true, requiresGovernance: false },
  { slug: "outputs", label: "Outputs", requiresIo: true, requiresGovernance: false },
  { slug: "validation", label: "Validation", requiresIo: false, requiresGovernance: true },
  { slug: "history", label: "History", requiresIo: false, requiresGovernance: false },
];

const slugToLabel = Object.fromEntries(
  PROMPT_DETAIL_TABS.map((t) => [t.slug, t.label]),
) as Record<PromptDetailTabSlug, string>;

const labelToSlug = Object.fromEntries(
  PROMPT_DETAIL_TABS.map((t) => [t.label, t.slug]),
) as Record<string, PromptDetailTabSlug>;

export function tabSlugToLabel(slug: PromptDetailTabSlug): string {
  return slugToLabel[slug];
}

export function tabLabelToSlug(label: string): PromptDetailTabSlug | null {
  return labelToSlug[label] ?? null;
}

export function parsePromptDetailTabSlug(
  value: string | null | undefined,
): PromptDetailTabSlug {
  if (value && PROMPT_DETAIL_TAB_SLUGS.includes(value as PromptDetailTabSlug)) {
    return value as PromptDetailTabSlug;
  }
  return "overview";
}

export const PROMPT_DETAIL_TAB_QUERY_KEY = "tab";
