"use client";

import { instructionFieldPlaceholders } from "@/lib/constants/default-instructions";
import type { PromptDraftFormState } from "@/lib/hooks/use-prompt-draft-form";

const fields: {
  key: keyof PromptDraftFormState;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    key: "masterInstructions",
    label: "Auryn Master Instructions",
    description: "Core behavior, tone, and scope for Auryn responses.",
    placeholder: instructionFieldPlaceholders.masterInstructions,
  },
  {
    key: "companyGuardrails",
    label: "Company Guardrails",
    description: "Non-negotiable safety and compliance boundaries.",
    placeholder: instructionFieldPlaceholders.companyGuardrails,
  },
  {
    key: "productProtocolRules",
    label: "Product / Protocol Guidance Rules",
    description: "Wellness and product-related guidance constraints.",
    placeholder: instructionFieldPlaceholders.productProtocolRules,
  },
];

export function PromptDraftFormFields({
  form,
  setField,
  fieldErrors,
  embedded = false,
  readOnly = false,
}: {
  form: PromptDraftFormState;
  setField: (key: keyof PromptDraftFormState, value: string) => void;
  fieldErrors: Partial<Record<keyof PromptDraftFormState, string[]>>;
  embedded?: boolean;
  readOnly?: boolean;
}) {
  return (
    <>
      {fields.map((field) => {
        const issues = fieldErrors[field.key];
        return (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-slate-800">{field.label}</label>
            <p className="mt-0.5 text-xs text-slate-500">{field.description}</p>
            <textarea
              value={form[field.key]}
              onChange={(e) => setField(field.key, e.target.value)}
              rows={embedded ? 6 : 8}
              readOnly={readOnly}
              aria-invalid={issues?.length ? true : undefined}
              aria-describedby={issues?.length ? `${field.key}-error` : undefined}
              placeholder={field.placeholder}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
            />
            {issues?.length ? (
              <p id={`${field.key}-error`} className="mt-1 text-xs text-red-600">
                {issues[0]}
              </p>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
