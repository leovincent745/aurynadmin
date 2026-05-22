"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  emptyInstructionTemplate,
} from "@/lib/constants/default-instructions";
import type { CurrentDraftResponse, InstructionRecord } from "@/lib/domain/admin-instructions";
import {
  instructionContentSchema,
  type InstructionContentInput,
} from "@/lib/validation/instruction-schema";

export type PromptDraftFormState = InstructionContentInput;

type LoadResponse = CurrentDraftResponse & {
  template?: PromptDraftFormState;
};

const AUTOSAVE_MS = 2500;

function formSnapshot(form: PromptDraftFormState): string {
  return JSON.stringify({
    masterInstructions: form.masterInstructions.trim(),
    companyGuardrails: form.companyGuardrails.trim(),
    productProtocolRules: form.productProtocolRules.trim(),
  });
}

export function usePromptDraftForm(options: {
  instructionId: string | null;
  canEdit: boolean;
  autosave?: boolean;
  onSaved?: () => void;
}) {
  const { instructionId, canEdit, autosave = true, onSaved } = options;

  const [form, setForm] = useState<PromptDraftFormState>({ ...emptyInstructionTemplate });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [versionNumber, setVersionNumber] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [createdByEmail, setCreatedByEmail] = useState<string | null>(null);
  const [activePublished, setActivePublished] = useState<LoadResponse["activePublished"]>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const savedSnapshotRef = useRef(formSnapshot(emptyInstructionTemplate));
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validation = useMemo(() => instructionContentSchema.safeParse(form), [form]);
  const isValid = validation.success;
  const fieldErrors = validation.success
    ? ({} as Partial<Record<keyof PromptDraftFormState, string[]>>)
    : (validation.error.flatten().fieldErrors as Partial<
        Record<keyof PromptDraftFormState, string[]>
      >);

  const isDirty = formSnapshot(form) !== savedSnapshotRef.current;

  const applyDraft = useCallback((draft: InstructionRecord) => {
    const next: PromptDraftFormState = {
      masterInstructions: draft.masterInstructions,
      companyGuardrails: draft.companyGuardrails,
      productProtocolRules: draft.productProtocolRules,
    };
    setForm(next);
    setDraftId(draft.id);
    setVersionNumber(draft.versionNumber);
    setUpdatedAt(draft.updatedAt);
    setCreatedByEmail(draft.createdByEmail);
    savedSnapshotRef.current = formSnapshot(next);
    setLastSavedAt(draft.updatedAt);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (instructionId) {
        const res = await fetch(`/api/admin/instructions/${instructionId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load prompt");
        const json = (await res.json()) as { instruction: InstructionRecord };
        if (json.instruction.status !== "draft") {
          throw new Error("This version is read-only. Only in-review drafts can be edited.");
        }
        applyDraft(json.instruction);
        const pubRes = await fetch("/api/admin/instructions/active", {
          credentials: "include",
        });
        if (pubRes.ok) {
          const activeJson = (await pubRes.json()) as {
            active?: { versionNumber: number; publishedAt: string; publishedByEmail: string };
          };
          if (activeJson.active) {
            setActivePublished({
              versionNumber: activeJson.active.versionNumber,
              publishedAt: activeJson.active.publishedAt,
              publishedByEmail: activeJson.active.publishedByEmail,
            });
          } else {
            setActivePublished(null);
          }
        }
        return;
      }

      const response = await fetch("/api/admin/instructions/current-draft", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load instructions");

      const data = (await response.json()) as LoadResponse;

      if (data.draft) {
        applyDraft(data.draft);
      } else {
        const template = data.template ?? emptyInstructionTemplate;
        setForm({ ...template });
        setDraftId(null);
        setVersionNumber(data.nextVersionNumber);
        setUpdatedAt(null);
        setCreatedByEmail(null);
        savedSnapshotRef.current = formSnapshot(template);
        setLastSavedAt(null);
      }

      setActivePublished(data.activePublished);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load draft.");
    } finally {
      setLoading(false);
    }
  }, [applyDraft, instructionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!canEdit) {
        setError("You do not have permission to edit prompts.");
        return null;
      }

      const parsed = instructionContentSchema.safeParse(form);
      if (!parsed.success) {
        const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
        setError(first ?? "Fix validation errors before saving.");
        return null;
      }

      const silent = opts?.silent ?? false;
      if (silent) setAutosaving(true);
      else {
        setSaving(true);
        setSuccess(null);
      }
      setError(null);

      try {
        const targetId = instructionId ?? draftId;
        let response: Response;

        if (targetId) {
          response = await fetch(`/api/admin/prompts/${targetId}/draft`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(parsed.data),
          });
        } else {
          response = await fetch("/api/admin/instructions/draft", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(parsed.data),
          });
        }

        const body = (await response.json()) as {
          draft?: InstructionRecord;
          code?: string;
          message?: string;
          issues?: Record<string, string[]>;
        };

        if (!response.ok) {
          if (body.issues) {
            const first = Object.values(body.issues).flat()[0];
            throw new Error(first ?? "Validation failed");
          }
          throw new Error(body.message ?? body.code ?? "Failed to save draft");
        }

        if (body.draft) {
          applyDraft(body.draft);
        } else {
          savedSnapshotRef.current = formSnapshot(parsed.data);
          setLastSavedAt(new Date().toISOString());
        }

        if (!silent) {
          setSuccess("Draft saved. Production chat is unchanged until you publish.");
        }
        onSaved?.();
        return body.draft ?? null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save draft");
        return null;
      } finally {
        if (silent) setAutosaving(false);
        else setSaving(false);
      }
    },
    [applyDraft, canEdit, draftId, form, instructionId, onSaved],
  );

  useEffect(() => {
    if (!autosave || !canEdit || loading || !isDirty || !isValid) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void save({ silent: true });
    }, AUTOSAVE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [autosave, canEdit, form, isDirty, isValid, loading, save]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const setField = useCallback(
    (key: keyof PromptDraftFormState, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setSuccess(null);
    },
    [],
  );

  return {
    form,
    setField,
    draftId,
    versionNumber,
    updatedAt,
    createdByEmail,
    activePublished,
    loading,
    saving,
    autosaving,
    error,
    success,
    setError,
    setSuccess,
    isDirty,
    isValid,
    fieldErrors,
    lastSavedAt,
    load,
    save,
  };
}
