import type { PromptValidationRunDto } from "@/lib/domain/prompt-validation";

/** True when draft content changed after the last completed validation run. */
export function isValidationStale(
  instructionUpdatedAt: string,
  latestRun: PromptValidationRunDto | null,
): boolean {
  if (!latestRun?.completedAt) return false;
  return new Date(instructionUpdatedAt).getTime() > new Date(latestRun.completedAt).getTime();
}
