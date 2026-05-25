"use client";

import { PipelineStatusBadge } from "@/components/prompt-system/pipeline-status-badge";
import { PromptMetadataCard } from "@/components/prompt-system/prompt-metadata-card";
import type { PromptDetailResponse } from "@/lib/domain/prompt-detail";
import {
  formatPromptDetailDateTime,
  formatPromptDetailText,
  formatPromptMaxTokens,
  formatPromptTemperature,
  formatPromptVersion,
} from "@/lib/utils/format-prompt-detail";

function OverviewTasksList({ tasks }: { tasks: readonly string[] }) {
  if (tasks.length === 0) {
    return (
      <p className="mt-2 text-sm italic text-slate-400">No tasks configured for this pipeline.</p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {tasks.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-slate-700">
          <span className="shrink-0 text-emerald-600" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export interface PromptOverviewTabProps {
  detail: PromptDetailResponse;
}

/** Overview tab — all fields rendered from GET /api/admin/prompts/{id} detail payload. */
export function PromptOverviewTab({ detail }: PromptOverviewTabProps) {
  const { modelConfig } = detail;
  const purposeEmpty = !detail.purpose.trim();

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950 break-words">{detail.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate-500 break-all">{detail.code}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {formatPromptDetailText(detail.category)}
          </span>
          <PipelineStatusBadge status={detail.status} />
        </div>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <PromptMetadataCard label="Model" value={formatPromptDetailText(modelConfig.model)} />
        <PromptMetadataCard
          label="Temperature"
          value={formatPromptTemperature(modelConfig.temperature)}
          hint={modelConfig.temperatureNote}
        />
        <PromptMetadataCard
          label="Max tokens"
          value={formatPromptMaxTokens(modelConfig.maxTokens)}
          hint={modelConfig.maxTokensNote}
        />
        <PromptMetadataCard
          label="Owner"
          value={formatPromptDetailText(detail.ownerEmail)}
        />
        <PromptMetadataCard
          label="Version"
          value={formatPromptVersion(detail.versionNumber)}
        />
        <PromptMetadataCard
          label="Last updated"
          value={formatPromptDetailDateTime(detail.lastUpdated)}
        />
      </div>

      <PromptMetadataCard label="Purpose" className="sm:col-span-2">
        <p
          className={`mt-1 text-sm leading-relaxed break-words ${
            purposeEmpty ? "italic text-slate-400" : "text-slate-700"
          }`}
        >
          {purposeEmpty
            ? "Add master instructions in the Prompt tab to describe what this pipeline does."
            : detail.purpose}
        </p>
      </PromptMetadataCard>

      <PromptMetadataCard label="What it does">
        <OverviewTasksList tasks={detail.tasks} />
      </PromptMetadataCard>
    </div>
  );
}
