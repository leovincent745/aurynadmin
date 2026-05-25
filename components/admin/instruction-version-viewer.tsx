import type { InstructionRecord } from "@/lib/domain/admin-instructions";

const fields = [
  { key: "masterInstructions" as const, label: "Auryn Master Instructions" },
  { key: "companyGuardrails" as const, label: "Company Guardrails" },
  { key: "productProtocolRules" as const, label: "Product / Protocol Guidance Rules" },
];

interface InstructionVersionViewerProps {
  instruction: InstructionRecord;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function InstructionVersionViewer({ instruction }: InstructionVersionViewerProps) {
  const wasLive =
    instruction.status === "published" ||
    (instruction.status === "archived" && instruction.publishedAt != null);

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Version</dt>
          <dd className="font-semibold text-slate-950">v{instruction.versionNumber}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Status</dt>
          <dd className="capitalize font-medium text-slate-950">{instruction.status}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Created by</dt>
          <dd className="text-slate-800">{instruction.createdByEmail}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Created at</dt>
          <dd className="text-slate-800">{formatDateTime(instruction.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Published at</dt>
          <dd className="text-slate-800">{formatDateTime(instruction.publishedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Archived</dt>
          <dd className="text-slate-800">
            {instruction.status === "archived"
              ? wasLive
                ? "Yes — was live in production"
                : "Yes"
              : "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase text-slate-500">Instruction ID</dt>
          <dd className="font-mono text-xs text-slate-700">{instruction.id}</dd>
        </div>
      </dl>

      {fields.map((field) => (
        <div key={field.key}>
          <p className="text-sm font-semibold text-slate-800">{field.label}</p>
          <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap text-slate-800">
            {instruction[field.key]}
          </pre>
        </div>
      ))}
    </div>
  );
}
