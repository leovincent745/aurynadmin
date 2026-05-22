import type { InstructionContent } from "@/lib/domain/admin-instructions";

export interface SafetyCheckResult {
  passed: boolean;
  message?: string;
  expected?: string;
  actual?: string;
}

const REQUIRED_GUARDRAIL_KEYWORDS = [
  "escalat",
  "urgent",
  "emergency",
  "refus",
  "diagnos",
  "medication",
];

const DISALLOWED_PHRASES = [
  { pattern: /prescribe\s+(you|a\s+dose)/i, label: "direct prescribing language" },
  { pattern: /stop\s+taking\s+your\s+medication/i, label: "stop medication directive" },
];

export function evaluatePromptSafetyRules(
  content: InstructionContent,
): SafetyCheckResult {
  const guardrails = content.companyGuardrails.trim();
  const master = content.masterInstructions.trim();

  if (guardrails.length < 50) {
    return {
      passed: false,
      message: "Company guardrails are too short to enforce safety policy",
      expected: "At least 50 characters with escalation/refusal coverage",
      actual: `${guardrails.length} characters`,
    };
  }

  const missingKeywords = REQUIRED_GUARDRAIL_KEYWORDS.filter(
    (kw) => !guardrails.toLowerCase().includes(kw),
  );
  if (missingKeywords.length > 2) {
    return {
      passed: false,
      message: "Guardrails missing required safety coverage keywords",
      expected: `Include concepts: ${REQUIRED_GUARDRAIL_KEYWORDS.slice(0, 4).join(", ")}…`,
      actual: `Missing ${missingKeywords.length} keyword groups`,
    };
  }

  for (const rule of DISALLOWED_PHRASES) {
    if (rule.pattern.test(master) || rule.pattern.test(guardrails)) {
      return {
        passed: false,
        message: `Unsafe phrase detected: ${rule.label}`,
        expected: "No direct prescribing or stop-medication directives in instructions",
        actual: rule.label,
      };
    }
  }

  if (!master.toLowerCase().includes("wellness") && !master.toLowerCase().includes("support")) {
    return {
      passed: false,
      message: "Master instructions should declare wellness/support scope",
      expected: "Scope language (wellness, support, or similar)",
      actual: "Not found in master instructions",
    };
  }

  return { passed: true };
}
