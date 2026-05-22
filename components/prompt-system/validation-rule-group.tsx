import { CheckCircle2, Circle, XCircle } from "lucide-react";

import type {
  ValidationRuleCategory,
  ValidationRuleResult,
} from "@/lib/domain/prompt-validation";
import { VALIDATION_CATEGORY_LABELS } from "@/lib/domain/prompt-validation";

function RuleStatusIcon({ status }: { status: ValidationRuleResult["status"] }) {
  if (status === "passed") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />;
  }
  if (status === "failed") {
    return <XCircle className="h-4 w-4 shrink-0 text-red-600" />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-slate-400" />;
}

export function ValidationRuleGroup({
  category,
  rules,
}: {
  category: ValidationRuleCategory;
  rules: ValidationRuleResult[];
}) {
  const groupRules = rules.filter((r) => r.category === category);
  if (!groupRules.length) return null;

  return (
    <div className="rounded-lg border bg-white">
      <p className="border-b bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {VALIDATION_CATEGORY_LABELS[category]}
      </p>
      <ul className="divide-y">
        {groupRules.map((rule) => (
          <li key={rule.id} className="px-3 py-2.5">
            <div className="flex items-start gap-2">
              <RuleStatusIcon status={rule.status} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{rule.name}</p>
                {rule.message ? (
                  <p className="mt-0.5 text-slate-600">{rule.message}</p>
                ) : null}
                {rule.status === "failed" && (rule.expected || rule.actual) ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {rule.expected ? (
                      <div className="rounded border border-emerald-100 bg-emerald-50/50 p-2">
                        <p className="text-[10px] font-semibold uppercase text-emerald-800">
                          Expected
                        </p>
                        <p className="mt-1 break-words font-mono text-[10px] text-slate-700">
                          {rule.expected}
                        </p>
                      </div>
                    ) : null}
                    {rule.actual ? (
                      <div className="rounded border border-red-100 bg-red-50/50 p-2">
                        <p className="text-[10px] font-semibold uppercase text-red-800">Actual</p>
                        <p className="mt-1 break-words font-mono text-[10px] text-slate-700">
                          {rule.actual}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
