/** Deep links for tracing a specific instruction version in Step 1 admin tools. */

export function aiLogsHrefForInstructionVersion(instructionVersionId: string): string {
  const params = new URLSearchParams({ instructionVersionId });
  return `/ai-optimization-center?${params.toString()}`;
}

export function conversationsHrefForInstructionVersion(
  instructionVersionId: string,
): string {
  const params = new URLSearchParams({ instructionVersionId });
  return `/conversations?${params.toString()}`;
}

export function promptSystemOverviewHref(promptId: string): string {
  const params = new URLSearchParams({
    selected: promptId,
    tab: "overview",
  });
  return `/prompt-system?${params.toString()}`;
}

export function promptSystemHistoryTabHref(promptId: string): string {
  const params = new URLSearchParams({
    selected: promptId,
    tab: "history",
  });
  return `/prompt-system?${params.toString()}`;
}
