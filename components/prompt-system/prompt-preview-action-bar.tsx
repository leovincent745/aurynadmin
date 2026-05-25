"use client";

import Link from "next/link";
import { Pencil, Eye, History, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";
import { testChatHrefForPipeline } from "@/lib/prompt-system/row-actions";
import { promptSystemHistoryTabHref } from "@/lib/prompt-system/version-history-links";

export interface PromptPreviewActionBarProps {
  selectedPipeline: PromptPipelineListItem;
  canEdit: boolean;
  canViewFull: boolean;
  onEditPrompt: () => void;
  onViewFullPrompt: () => void;
}

export function PromptPreviewActionBar({
  selectedPipeline,
  canEdit,
  canViewFull,
  onEditPrompt,
  onViewFullPrompt,
}: PromptPreviewActionBarProps) {
  const testHref = testChatHrefForPipeline(selectedPipeline);
  const testDisabled = selectedPipeline.status === "Archived";

  const historyHref = promptSystemHistoryTabHref(selectedPipeline.id);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={!canEdit}
        title={
          !canEdit
            ? "Only in-review drafts you are editing can be changed"
            : "Open the instruction editor"
        }
        onClick={onEditPrompt}
      >
        <Pencil className="h-4 w-4" />
        Edit Prompt
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={!canViewFull}
        onClick={onViewFullPrompt}
      >
        <Eye className="h-4 w-4" />
        View Full Prompt
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link href={historyHref}>
          <History className="h-4 w-4" />
          Version History
        </Link>
      </Button>
      <Button
        asChild={!testDisabled}
        className="gap-2 bg-violet-600 hover:bg-violet-700"
        disabled={testDisabled}
        title={
          testDisabled
            ? "Archived versions cannot be run in Step 1 test chat"
            : "Open Admin Test Chat for this version"
        }
      >
        {testDisabled ? (
          <span className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" />
            Run Test
          </span>
        ) : (
          <Link href={testHref}>
            <Play className="h-4 w-4" />
            Run Test
          </Link>
        )}
      </Button>
    </div>
  );
}
