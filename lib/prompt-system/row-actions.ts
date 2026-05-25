import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import type { PromptSystemUrlPatch } from "@/lib/prompt-system/url-state";

export type PromptPipelineRowAction = "edit" | "view-full" | "run-test" | "view-history";

export function patchForPipelineRowAction(
  action: PromptPipelineRowAction,
  prompt: PromptPipelineListItem,
): PromptSystemUrlPatch {
  switch (action) {
    case "edit":
      return { selected: prompt.id, tab: "prompt", panel: "edit" };
    case "view-full":
      return { selected: prompt.id, tab: "prompt", panel: "full" };
    case "view-history":
      return { selected: prompt.id, tab: "history", panel: null };
    case "run-test":
      return { selected: prompt.id };
  }
}

export function testChatHrefForPipeline(prompt: PromptPipelineListItem): string {
  const mode = prompt.status === "Active" ? "published" : "draft";
  const params = new URLSearchParams({
    mode,
    instructionId: prompt.id,
    version: String(prompt.versionNumber),
  });
  if (prompt.status === "Archived") {
    params.set("archived", "1");
  }
  return `/test-chat?${params.toString()}`;
}
