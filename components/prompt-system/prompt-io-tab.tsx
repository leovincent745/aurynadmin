"use client";

import type { PromptPipelineIoSection } from "@/lib/domain/prompt-io-schema";
import { SchemaFieldRow } from "@/components/prompt-system/prompt-schema-field-list";

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="mt-2 leading-5 text-slate-600">{value}</p>
    </div>
  );
}

/** Read-only Outputs tab (schema + example response). */
export function PromptIoTab({
  title,
  section,
  loading,
  error,
}: {
  title: "Outputs";
  section: PromptPipelineIoSection | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-xs text-slate-500">Loading {title.toLowerCase()} from API…</p>;
  }

  if (error || !section) {
    return (
      <p className="text-xs text-slate-500">
        {error ?? `Unable to load ${title.toLowerCase()} schema.`}
      </p>
    );
  }

  const summaryCards = section.fields.slice(0, 4).map((f) => ({
    label: f.label,
    value: f.description,
  }));

  return (
    <div className="space-y-4 text-xs">
      <p className="text-slate-500">
        <span className="font-semibold text-slate-700">{section.endpoint}</span>
        {" · "}
        {section.requiredKeys.length} required field
        {section.requiredKeys.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {summaryCards.map((card) => (
          <InfoBox key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <div>
        <p className="font-semibold text-slate-600">Schema fields</p>
        <div className="mt-2 space-y-2">
          {section.fields.map((field) => (
            <SchemaFieldRow key={field.key} field={field} />
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-600">Example response</p>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg border bg-slate-50 p-3 font-mono text-[11px] leading-5 text-slate-700">
          {JSON.stringify(section.exampleJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
