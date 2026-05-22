"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Braces, CheckCircle2, GitBranch, LayoutList } from "lucide-react";

import {
  PromptAsyncState,
  PromptStateValidationFailed,
} from "@/components/prompt-system/prompt-async-state";
import { SchemaFieldRow } from "@/components/prompt-system/prompt-schema-field-list";
import { Button } from "@/components/ui/button";
import type {
  PromptPipelineIoSection,
  ValidationIssue,
} from "@/lib/domain/prompt-io-schema";
import {
  clearStoredOutputResponse,
  loadStoredOutputResponse,
  saveStoredOutputResponse,
} from "@/lib/prompt-io/output-response-storage";
import { validateChatOutputResponse } from "@/lib/validation/prompt-io-output";

function ValidationErrors({ issues }: { issues: ValidationIssue[] }) {
  if (!issues.length) return null;
  return (
    <ul className="mt-2 space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-800">
      {issues.map((issue) => (
        <li key={`${issue.path}-${issue.message}`}>
          <span className="font-mono font-semibold">{issue.path}</span>: {issue.message}
        </li>
      ))}
    </ul>
  );
}

function formatPreviewValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (value.length > 280) return `${value.slice(0, 280)}…`;
    return value;
  }
  return JSON.stringify(value);
}

function HumanReadablePreview({
  fields,
  payload,
}: {
  fields: PromptPipelineIoSection["fields"];
  payload: Record<string, unknown>;
}) {
  const reply = payload.reply;
  return (
    <div className="space-y-3">
      {typeof reply === "string" && reply.trim() ? (
        <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">
            Assistant reply
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {formatPreviewValue(reply)}
          </p>
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {fields
          .filter((f) => f.key !== "reply")
          .map((field) => {
            const raw = payload[field.key];
            const isEnum = field.kind === "enum" && typeof raw === "string";
            return (
              <div key={field.key} className="rounded-lg border bg-slate-50 p-3">
                <p className="font-semibold text-slate-700">{field.label}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">{field.key}</p>
                {isEnum ? (
                  <span className="mt-2 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                    {raw}
                  </span>
                ) : (
                  <p className="mt-2 break-words text-slate-700">
                    {formatPreviewValue(raw)}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function DownstreamMapping({ fields }: { fields: PromptPipelineIoSection["fields"] }) {
  const mapped = fields.filter((f) => f.downstream);
  if (!mapped.length) {
    return <p className="text-slate-500">No downstream mappings defined for this schema.</p>;
  }
  return (
    <div className="space-y-2">
      {mapped.map((field) => (
        <div
          key={field.key}
          className="flex flex-col gap-1 rounded-lg border bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-800">{field.label}</p>
            <p className="font-mono text-[10px] text-slate-500">{field.key}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <GitBranch className="h-3.5 w-3.5 shrink-0 text-violet-600" />
            <span>{field.downstream}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PromptOutputsTab({
  section,
  instructionId,
  versionNumber,
  loading,
  error,
  onRetry,
  onValidationChange,
}: {
  section: PromptPipelineIoSection | null;
  instructionId: string | null;
  versionNumber: number;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onValidationChange?: (valid: boolean, issues: ValidationIssue[]) => void;
}) {
  const [view, setView] = useState<"schema" | "validate">("schema");
  const [displayMode, setDisplayMode] = useState<"preview" | "raw">("preview");
  const [jsonText, setJsonText] = useState("{}");
  const [parsedPayload, setParsedPayload] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [lastValid, setLastValid] = useState(false);

  const extraKeys = useMemo(() => {
    if (!section || !parsedPayload) return [] as string[];
    const known = new Set(section.fields.map((f) => f.key));
    return Object.keys(parsedPayload).filter((k) => !known.has(k));
  }, [section, parsedPayload]);

  const runValidation = useCallback(
    (raw: unknown) => {
      if (!section || !instructionId) {
        onValidationChange?.(false, []);
        return;
      }
      const result = validateChatOutputResponse(section.fields, raw, {
        instructionVersionId: section.instructionVersionId,
        versionNumber,
      });
      setValidationIssues(result.issues);
      setLastValid(result.valid);
      onValidationChange?.(result.valid, result.issues);
      if (result.valid && result.normalized) {
        setParsedPayload(result.normalized);
      }
    },
    [section, instructionId, versionNumber, onValidationChange],
  );

  const syncFromSection = useCallback(
    (sec: PromptPipelineIoSection) => {
      const stored = instructionId ? loadStoredOutputResponse(instructionId) : null;
      const text = stored ?? JSON.stringify(sec.exampleJson, null, 2);
      setJsonText(text);
      setParseError(null);
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        setParsedPayload(parsed);
        runValidation(parsed);
      } catch {
        setParsedPayload(null);
        setParseError("Invalid JSON");
        onValidationChange?.(false, [
          { path: "_root", message: "Invalid JSON in stored response" },
        ]);
      }
    },
    [instructionId, runValidation, onValidationChange],
  );

  useEffect(() => {
    if (!section) return;
    syncFromSection(section);
  }, [section, instructionId, syncFromSection]);

  const handleValidate = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (instructionId) saveStoredOutputResponse(instructionId, jsonText);
      setParsedPayload(
        parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null,
      );
      runValidation(parsed);
    } catch {
      setParseError("JSON parse error — fix syntax before validating.");
      setLastValid(false);
      onValidationChange?.(false, [{ path: "_root", message: "Invalid JSON" }]);
    }
  };

  const handleLoadExample = () => {
    if (!section) return;
    const text = JSON.stringify(section.exampleJson, null, 2);
    setJsonText(text);
    if (instructionId) clearStoredOutputResponse(instructionId);
    setParsedPayload(section.exampleJson);
    setParseError(null);
    runValidation(section.exampleJson);
  };

  return (
    <PromptAsyncState
      loading={loading}
      error={error}
      empty={!section}
      emptyTitle="No output schema"
      emptyDescription="Output contract metadata is not available for this instruction version."
      onRetry={onRetry}
      skeletonLines={6}
      loadingLabel="Loading output schema"
    >
    {section ? (
    <div className="space-y-4 text-xs">
      {!lastValid && validationIssues.length > 0 ? (
        <PromptStateValidationFailed
          message={`${validationIssues.length} schema issue(s) block activation. Fix the JSON or example payload below.`}
          onRetry={() => runValidation(parsedPayload ?? section.exampleJson)}
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <span className="font-semibold text-slate-700">{section.endpoint}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-600">
          Schema {section.schemaVersion} · {section.versionLabel}
        </span>
        <span className="text-slate-400">·</span>
        <span className="font-mono text-[10px] text-slate-500">
          {section.instructionVersionId}
        </span>
        {lastValid ? (
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Schema valid
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Not validated
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === "schema" ? "default" : "outline"}
          className={view === "schema" ? "bg-violet-600 hover:bg-violet-700" : ""}
          onClick={() => setView("schema")}
        >
          <LayoutList className="mr-1 h-3.5 w-3.5" />
          Schema reference
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "validate" ? "default" : "outline"}
          className={view === "validate" ? "bg-violet-600 hover:bg-violet-700" : ""}
          onClick={() => setView("validate")}
        >
          <Braces className="mr-1 h-3.5 w-3.5" />
          Validate response
        </Button>
      </div>

      {view === "schema" ? (
        <>
          <p className="text-slate-500">
            {section.requiredKeys.length} required field
            {section.requiredKeys.length === 1 ? "" : "s"} · version-bound to selected pipeline
            row
          </p>
          <div>
            <p className="font-semibold text-slate-600">Schema fields</p>
            <div className="mt-2 space-y-2">
              {section.fields.map((field) => (
                <SchemaFieldRow key={field.key} field={field} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-slate-600">Downstream dependencies</p>
            <DownstreamMapping fields={section.fields} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={handleLoadExample}>
              Load schema example
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handleValidate}
            >
              Validate against schema
            </Button>
            <div className="ml-auto flex gap-1 rounded-md border p-0.5">
              <button
                type="button"
                className={`rounded px-2 py-1 text-[10px] font-semibold ${
                  displayMode === "preview"
                    ? "bg-violet-100 text-violet-800"
                    : "text-slate-600"
                }`}
                onClick={() => setDisplayMode("preview")}
              >
                Readable preview
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 text-[10px] font-semibold ${
                  displayMode === "raw" ? "bg-violet-100 text-violet-800" : "text-slate-600"
                }`}
                onClick={() => setDisplayMode("raw")}
              >
                Raw JSON
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setLastValid(false);
              onValidationChange?.(false, []);
            }}
            rows={10}
            className="w-full rounded-lg border bg-slate-50 p-3 font-mono text-[11px] leading-5 text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
            spellCheck={false}
          />

          {parseError ? (
            <p className="text-red-700">{parseError}</p>
          ) : null}
          <ValidationErrors issues={validationIssues} />

          {extraKeys.length > 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
              Extra keys (not in schema): {extraKeys.join(", ")}
            </p>
          ) : null}

          {displayMode === "preview" && parsedPayload ? (
            <div>
              <p className="mb-2 font-semibold text-slate-600">Human-readable preview</p>
              <HumanReadablePreview fields={section.fields} payload={parsedPayload} />
            </div>
          ) : (
            <div>
              <p className="mb-2 font-semibold text-slate-600">Raw JSON</p>
              <pre className="max-h-56 overflow-auto rounded-lg border bg-slate-50 p-3 font-mono text-[11px] leading-5 text-slate-700">
                {parsedPayload
                  ? JSON.stringify(parsedPayload, null, 2)
                  : jsonText}
              </pre>
            </div>
          )}

          <div>
            <p className="mb-2 font-semibold text-slate-600">Downstream dependencies</p>
            <DownstreamMapping fields={section.fields} />
          </div>
        </>
      )}
    </div>
    ) : null}
    </PromptAsyncState>
  );
}
