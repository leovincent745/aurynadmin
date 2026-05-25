"use client";

import { InstructionVersionViewer } from "@/components/admin/instruction-version-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InstructionRecord } from "@/lib/domain/admin-instructions";

export function InstructionVersionDetailDialog({
  open,
  loading,
  instruction,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  instruction: InstructionRecord | null;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Version details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : instruction ? (
            <InstructionVersionViewer instruction={instruction} />
          ) : (
            <p className="text-sm text-red-600">Could not load this version.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
