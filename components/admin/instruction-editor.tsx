"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, FlaskConical, History, Save, Upload } from "lucide-react";

import { InstructionEditorMetadata } from "@/components/admin/instruction-editor-metadata";
import { PromptDraftFormFields } from "@/components/prompt-system/prompt-draft-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptStateError } from "@/components/prompt-system/prompt-async-state";
import { usePromptDraftForm } from "@/lib/hooks/use-prompt-draft-form";

export function InstructionEditor({
  embedded = false,
  instructionId = null,
  canEdit = true,
  canActivate = true,
  autosave = true,
  onSaved,
  publishDisabled = false,
  publishBlockReason = null,
}: {
  embedded?: boolean;
  /** When set, loads and saves via GET instruction + PUT /api/admin/prompts/{id}/draft */
  instructionId?: string | null;
  canEdit?: boolean;
  canActivate?: boolean;
  autosave?: boolean;
  onSaved?: () => void;
  publishDisabled?: boolean;
  publishBlockReason?: string | null;
}) {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const {
    form,
    setField,
    draftId,
    versionNumber,
    updatedAt,
    createdByEmail,
    draftStatus,
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
  } = usePromptDraftForm({
    instructionId,
    canEdit,
    autosave: autosave && canEdit,
    onSaved,
  });

  const handlePublish = async () => {
    if (!draftId) {
      setError("Save a draft before publishing.");
      return;
    }

    setPublishing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/prompts/${draftId}/activate`, {
        method: "POST",
        credentials: "include",
      });

      const body = (await response.json()) as {
        activated?: { versionNumber: number };
        published?: { versionNumber: number };
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(body.message ?? body.code ?? "Failed to activate");
      }

      const live = body.activated ?? body.published;
      setShowPublishConfirm(false);
      setSuccess(
        live
          ? `Published live as version v${live.versionNumber}.`
          : "Published live.",
      );
      await load();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const isBlankDraft =
    !form.masterInstructions.trim() &&
    !form.companyGuardrails.trim() &&
    !form.productProtocolRules.trim();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">AI Instructions</h1>
            <p className="mt-1 text-sm text-slate-600">
              Control Auryn chat behavior without code changes. Drafts do not affect live users.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/instructions/history">
                <History className="mr-1 h-4 w-4" />
                Version History
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/prompt-system">
                Prompt System
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/test-chat">
                <FlaskConical className="mr-1 h-4 w-4" />
                Test Draft
              </Link>
            </Button>
          </div>
        </div>
      )}

      {!canEdit ? (
        <div
          className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="status"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          View-only — you do not have permission to edit prompts.
        </div>
      ) : null}

      {embedded && isBlankDraft && canEdit ? (
        <p className="rounded-md border border-dashed border-violet-200 bg-violet-50/50 px-3 py-2 text-xs text-violet-900">
          New prompt — each section needs at least 10 characters to save. Placeholder text is a
          guide only and is not saved until you type or save.
        </p>
      ) : null}

      {isDirty && canEdit ? (
        <p className="text-xs text-slate-500" role="status">
          {autosaving
            ? "Autosaving…"
            : autosave
              ? "Unsaved changes — autosave runs when all fields pass validation."
              : "Unsaved changes"}
        </p>
      ) : null}

      <InstructionEditorMetadata
        status={draftStatus}
        versionNumber={versionNumber}
        updatedAt={updatedAt ?? lastSavedAt}
        updatedByEmail={createdByEmail}
        livePublished={activePublished}
      />

      <Card className={embedded ? "border-0 shadow-none" : undefined}>
        {!embedded && (
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Instruction content</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Required fields must be at least 10 characters. Save Draft keeps production chat
              unchanged.
            </p>
          </CardHeader>
        )}
        <CardContent className={embedded ? "space-y-4 p-0 pt-0" : "space-y-6"}>
          <PromptDraftFormFields
            form={form}
            setField={setField}
            fieldErrors={fieldErrors}
            embedded={embedded}
            readOnly={!canEdit}
          />

          {error ? (
            <PromptStateError
              title="Could not save or load draft"
              message={error}
              onRetry={() => void load()}
            />
          ) : null}
          {success && (
            <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {success}
            </div>
          )}

          {canEdit ? (
            <div
              className={
                embedded
                  ? "flex flex-wrap gap-2 border-t pt-4"
                  : "sticky bottom-0 -mx-6 flex flex-wrap gap-2 border-t bg-white px-6 py-4"
              }
            >
              <Button
                onClick={() => void save()}
                disabled={saving || publishing || !isValid}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="mr-1 h-4 w-4" />
                {saving ? "Saving..." : isDirty ? "Save Draft" : "Saved"}
              </Button>
              {canActivate ? (
                <Button
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={saving || publishing || !draftId || !isValid || publishDisabled}
                  title={publishDisabled ? publishBlockReason ?? undefined : undefined}
                  onClick={() => setShowPublishConfirm(true)}
                >
                  <Upload className="mr-1 h-4 w-4" />
                  Publish Live
                </Button>
              ) : null}
            </div>
          ) : null}
          {publishDisabled && publishBlockReason ? (
            <p className="text-xs text-amber-800">{publishBlockReason}</p>
          ) : null}
        </CardContent>
      </Card>

      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Publish instructions live?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Future public Auryn chat will use this draft&apos;s content. Any currently live
                published version will be archived automatically. Only one version stays live at
                a time.
              </p>
              {isDirty ? (
                <p className="font-medium text-amber-800">
                  Save your draft before publishing so the live version matches what you reviewed.
                </p>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={publishing || publishDisabled || isDirty || !isValid}
                  title={isDirty ? "Save draft before publishing" : undefined}
                  onClick={() => void handlePublish()}
                >
                  {publishing ? "Publishing..." : "Publish live"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
