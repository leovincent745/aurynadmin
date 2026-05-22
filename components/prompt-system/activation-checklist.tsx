import { CheckCircle2, XCircle } from "lucide-react";

import type { ActivationCheckItem } from "@/lib/domain/prompt-activation";

export function ActivationChecklist({ checks }: { checks: ActivationCheckItem[] }) {
  if (!checks.length) return null;

  return (
    <ul className="space-y-1.5 rounded-lg border bg-white p-3">
      {checks.map((item) => (
        <li key={item.id} className="flex items-start gap-2 text-[11px]">
          {item.passed ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
          )}
          <div>
            <p className="font-semibold text-slate-800">{item.label}</p>
            <p className="text-slate-600">{item.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
