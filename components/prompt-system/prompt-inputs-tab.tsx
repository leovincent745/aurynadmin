"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Braces, ClipboardList, Play } from "lucide-react";

import { PromptAsyncState } from "@/components/prompt-system/prompt-async-state";
import { SchemaFieldRow } from "@/components/prompt-system/prompt-schema-field-list";
import { Button } from "@/components/ui/button";
import type { PromptPipelineIoSection, ValidationIssue } from "@/lib/domain/prompt-io-schema";
import {
  deleteTestPayload,
  listSavedTestPayloads,
  saveTestPayload,
  type SavedTestPayload,
} from "@/lib/prompt-io/test-payload-storage";
import { validatePayloadAgainstSchema } from "@/lib/validation/prompt-io-payload";

function emptyPayloadFromSchema(section: PromptPipelineIoSection): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const key of section.editableKeys) {
    const field = section.fields.find((f) => f.key === key);
    if (!field) continue;
    if (field.kind === "boolean") payload[key] = false;
    else if (field.kind === "array") payload[key] = [];
    else if (field.kind === "number") payload[key] = field.min ?? 0;
    else payload[key] = "";
  }
  return payload;
}

function payloadToFormString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function parseFormValue(field: PromptPipelineIoSection["fields"][number], raw: string): unknown {
  if (field.kind === "number") {
    if (raw.trim() === "") return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (field.kind === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw;
  }
  if (field.kind === "array") {
    if (!raw.trim()) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : raw;
    } catch {
      return raw;
    }
  }
  return raw;
}

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

export function PromptInputsTab({
  section,
  instructionId,
  loading,
  error,
  onRetry,
}: {
  section: PromptPipelineIoSection | null;
  instructionId: string | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const [view, setView] = useState<"schema" | "test">("schema");
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [jsonText, setJsonText] = useState("{}");
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [lastValid, setLastValid] = useState(false);
  const [savedPayloads, setSavedPayloads] = useState<SavedTestPayload[]>([]);
  const [saveName, setSaveName] = useState("");

  const editableFields = useMemo(
    () => section?.fields.filter((f) => f.editable) ?? [],
    [section],
  );

  const syncFromSection = useCallback((sec: PromptPipelineIoSection) => {
    const base = { ...emptyPayloadFromSchema(sec), ...sec.exampleJson };
    const form: Record<string, string> = {};
    for (const field of sec.fields.filter((f) => f.editable)) {
      form[field.key] = payloadToFormString(base[field.key]);
    }
    setFormValues(form);
    setJsonText(JSON.stringify(base, null, 2));
    setValidationIssues([]);
    setLastValid(false);
  }, []);

  useEffect(() => {
    if (!section) return;
    syncFromSection(section);
  }, [section, instructionId, syncFromSection]);

  useEffect(() => {
    if (!instructionId) {
      setSavedPayloads([]);
      return;
    }
    setSavedPayloads(listSavedTestPayloads(instructionId));
  }, [instructionId, lastValid]);

  const buildPayloadFromForm = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = {};
    for (const field of editableFields) {
      const parsed = parseFormValue(field, formValues[field.key] ?? "");
      if (parsed !== undefined && parsed !== "") {
        payload[field.key] = parsed;
      }
    }
    return payload;
  };

  const buildPayloadFromJson = (): { payload?: Record<string, unknown>; parseError?: string } => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return { parseError: "JSON must be an object" };
      }
      return { payload: parsed as Record<string, unknown> };
    } catch {
      return { parseError: "Invalid JSON syntax" };
    }
  };

  const runValidation = () => {
    if (!section) return;

    if (editMode === "json") {
      const { payload, parseError } = buildPayloadFromJson();
      if (parseError) {
        setValidationIssues([{ path: "_json", message: parseError }]);
        setLastValid(false);
        return;
      }
      const result = validatePayloadAgainstSchema(section.fields, payload, "chat_instructions");
      setValidationIssues(result.issues);
      setLastValid(result.valid);
      if (result.valid && result.normalized) {
        setJsonText(JSON.stringify(result.normalized, null, 2));
      }
      return;
    }

    const result = validatePayloadAgainstSchema(
      section.fields,
      buildPayloadFromForm(),
      "chat_instructions",
    );
    setValidationIssues(result.issues);
    setLastValid(result.valid);
    if (result.valid && result.normalized) {
      setJsonText(JSON.stringify(result.normalized, null, 2));
      const form: Record<string, string> = {};
      for (const field of editableFields) {
        form[field.key] = payloadToFormString(result.normalized[field.key]);
      }
      setFormValues(form);
    }
  };

  const loadSample = () => {
    if (!section) return;
    syncFromSection(section);
    setView("test");
  };

  const loadSaved = (entry: SavedTestPayload) => {
    setJsonText(JSON.stringify(entry.payload, null, 2));
    const form: Record<string, string> = {};
    for (const field of editableFields) {
      form[field.key] = payloadToFormString(entry.payload[field.key]);
    }
    setFormValues(form);
    setView("test");
    setValidationIssues([]);
    setLastValid(false);
  };

  const handleSavePayload = () => {
    if (!instructionId || !section) return;
    runValidation();
    const payload =
      editMode === "json"
        ? buildPayloadFromJson().payload
        : buildPayloadFromForm();
    if (!payload) return;
    const result = validatePayloadAgainstSchema(section.fields, payload, "chat_instructions");
    if (!result.valid || !result.normalized) {
      setValidationIssues(result.issues);
      return;
    }
    saveTestPayload(instructionId, saveName, result.normalized);
    setSavedPayloads(listSavedTestPayloads(instructionId));
    setSaveName("");
  };

  return (
    <PromptAsyncState
      loading={loading}
      error={error}
      empty={!section}
      emptyTitle="No input schema"
      emptyDescription="Pipeline IO metadata is not available for this instruction version."
      onRetry={onRetry}
      skeletonLines={6}
      loadingLabel="Loading input schema"
    >
    {section ? (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-700">{section.endpoint}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">{section.fields.length} schema fields</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["schema", "test"] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              view === v ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
            onClick={() => setView(v)}
          >
            {v === "schema" ? "Schema reference" : "Test payload"}
          </button>
        ))}
      </div>

      {view === "schema" ? (
        <div className="space-y-2">
          {section.fields.map((field) => (
            <SchemaFieldRow key={field.key} field={field} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {(["form", "json"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 font-semibold ${
                  editMode === m
                    ? "border-violet-600 bg-violet-50 text-violet-800"
                    : "border-slate-200 text-slate-600"
                }`}
                onClick={() => setEditMode(m)}
              >
                {m === "form" ? (
                  <ClipboardList className="h-3.5 w-3.5" />
                ) : (
                  <Braces className="h-3.5 w-3.5" />
                )}
                {m === "form" ? "Form mode" : "JSON mode"}
              </button>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={loadSample}>
              Load sample
            </Button>
            <Button type="button" size="sm" className="bg-violet-600" onClick={runValidation}>
              Validate
            </Button>
            {lastValid ? (
              <span className="self-center text-emerald-700 font-semibold">Valid</span>
            ) : null}
          </div>

          {editMode === "form" ? (
            <div className="space-y-3 rounded-lg border bg-slate-50 p-3">
              {editableFields.map((field) => (
                <div key={field.key}>
                  <label className="flex flex-wrap items-center gap-2 font-semibold text-slate-800">
                    {field.label}
                    <span className="font-mono text-[10px] font-normal text-slate-500">
                      {field.key}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        field.required
                          ? "bg-violet-100 text-violet-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </label>
                  {field.kind === "enum" && field.enumValues?.length ? (
                    <select
                      className="mt-1 h-9 w-full rounded-md border bg-white px-2 text-xs"
                      value={formValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    >
                      <option value="">—</option>
                      {field.enumValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : field.kind === "array" ? (
                    <textarea
                      className="mt-1 w-full rounded-md border bg-white px-2 py-1.5 font-mono text-xs"
                      rows={2}
                      placeholder='["item1","item2"]'
                      value={formValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  ) : (
                    <input
                      className="mt-1 h-9 w-full rounded-md border bg-white px-2 text-xs"
                      type={field.kind === "number" ? "number" : "text"}
                      min={field.min}
                      max={field.max}
                      maxLength={field.maxLength}
                      placeholder={field.description}
                      value={formValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <textarea
              className="min-h-[200px] w-full rounded-lg border bg-slate-50 p-3 font-mono text-[11px] leading-5"
              value={jsonText}
              spellCheck={false}
              onChange={(e) => {
                setJsonText(e.target.value);
                setLastValid(false);
              }}
            />
          )}

          <ValidationErrors issues={validationIssues} />

          {instructionId ? (
            <div className="rounded-lg border bg-white p-3 space-y-2">
              <p className="font-semibold text-slate-700">Saved test payloads (browser)</p>
              {savedPayloads.length === 0 ? (
                <p className="text-slate-500">No saved payloads for this version yet.</p>
              ) : (
                <ul className="space-y-1">
                  {savedPayloads.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1.5"
                    >
                      <button
                        type="button"
                        className="font-semibold text-violet-700 hover:underline"
                        onClick={() => loadSaved(entry)}
                      >
                        {entry.name}
                      </button>
                      <span className="text-slate-400">
                        {new Date(entry.savedAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => {
                          deleteTestPayload(instructionId, entry.id);
                          setSavedPayloads(listSavedTestPayloads(instructionId));
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <input
                  className="h-8 min-w-0 flex-1 rounded-md border px-2 text-xs"
                  placeholder="Name for this payload"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleSavePayload}>
                  Save payload
                </Button>
              </div>
            </div>
          ) : null}

          <Button asChild variant="outline" size="sm" className="gap-2" disabled={!lastValid}>
            <Link href="/test-chat">
              <Play className="h-3.5 w-3.5" />
              Run Test (valid payload)
            </Link>
          </Button>
        </>
      )}
    </div>
    ) : null}
    </PromptAsyncState>
  );
}
