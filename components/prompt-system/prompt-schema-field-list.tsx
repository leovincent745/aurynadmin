import type { PromptIoFieldSchema } from "@/lib/domain/prompt-io-schema";

export function SchemaFieldRow({ field }: { field: PromptIoFieldSchema }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-800">{field.label}</span>
        <span className="font-mono text-[10px] text-slate-500">{field.key}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            field.required ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          {field.required ? "Required" : "Optional"}
        </span>
        {!field.editable ? (
          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
            Server-only
          </span>
        ) : null}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
          {field.type}
        </span>
      </div>
      <p className="mt-2 leading-5 text-slate-600">{field.description}</p>
      <p className="mt-1 text-[10px] text-slate-500">
        Source: <span className="font-medium text-slate-700">{field.source}</span>
        {field.validation ? ` · ${field.validation}` : null}
        {field.minLength != null ? ` · min length ${field.minLength}` : null}
        {field.maxLength != null ? ` · max length ${field.maxLength}` : null}
        {field.enumValues?.length ? ` · enum: ${field.enumValues.join(" | ")}` : null}
      </p>
    </div>
  );
}
