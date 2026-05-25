import { AdminInstructionStatus } from "@prisma/client";

import {
  REQUIRED_ADMIN_TEST_PASSES,
  type ActivationCheckItem,
  type CanActivatePromptVersionResult,
  type PromptVersionActivationContext,
} from "@/lib/domain/prompt-activation";
import type { ValidationRuleResult } from "@/lib/domain/prompt-validation";
import { PromptValidationRunStatus } from "@prisma/client";

function rulePassed(
  rules: ValidationRuleResult[] | undefined,
  category: ValidationRuleResult["category"],
): boolean {
  if (!rules?.length) return false;
  const match = rules.find((r) => r.category === category);
  return match?.status === "passed";
}

function check(
  id: ActivationCheckItem["id"],
  label: string,
  passed: boolean,
  message: string,
): ActivationCheckItem {
  return { id, label, passed, message };
}

function isOnOrAfter(iso: string | null | undefined, contentChangedAt: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() >= new Date(contentChangedAt).getTime();
}

/**
 * Production activation guard — single source of truth for UI and publish API.
 */
export function canActivatePromptVersion(
  ctx: PromptVersionActivationContext,
): CanActivatePromptVersionResult {
  const checks: ActivationCheckItem[] = [];
  const run = ctx.latestValidationRun;
  const rules = run?.rules;

  const inReview =
    ctx.dbStatus === AdminInstructionStatus.draft &&
    ctx.pipelineStatusLabel === "In Review";
  checks.push(
    check(
      "in_review_only",
      "Version in review",
      inReview,
      inReview
        ? "Draft pipeline version is eligible for activation"
        : `Only In Review drafts can activate (current: ${ctx.pipelineStatusLabel} / ${ctx.dbStatus})`,
    ),
  );

  const schemaOk =
    ctx.outputSchemaValid || rulePassed(rules, "output_schema");
  checks.push(
    check(
      "output_schema",
      "Output schema validation",
      schemaOk,
      schemaOk
        ? "Output schema is valid for this version"
        : "Validate output schema on the Outputs tab or pass validation suite",
    ),
  );

  const safetyOk = rulePassed(rules, "safety");
  checks.push(
    check(
      "safety",
      "Safety validation",
      safetyOk,
      safetyOk
        ? "Instruction safety guardrails passed"
        : "Run validation suite — safety rules must pass",
    ),
  );

  const businessOk = rulePassed(rules, "business_rules");
  checks.push(
    check(
      "business_rules",
      "Business rules",
      businessOk,
      businessOk
        ? "Publish readiness rules passed"
        : "Run validation suite — business rules must pass",
    ),
  );

  const testsOk = ctx.adminTestPassCount >= REQUIRED_ADMIN_TEST_PASSES;
  checks.push(
    check(
      "test_cases",
      "Required test cases",
      testsOk,
      testsOk
        ? `${ctx.adminTestPassCount} successful admin test run(s) recorded`
        : `At least ${REQUIRED_ADMIN_TEST_PASSES} successful admin test chat run required (current: ${ctx.adminTestPassCount})`,
    ),
  );

  const validationFresh =
    run?.status === PromptValidationRunStatus.passed &&
    run.overallPassed &&
    isOnOrAfter(run.completedAt, ctx.instructionUpdatedAt);
  checks.push(
    check(
      "validation_suite",
      "Validation suite",
      Boolean(validationFresh),
      validationFresh
        ? "Latest validation run passed after last draft edit"
        : run?.status === "canceled"
          ? "Last validation run was canceled — run again"
          : run?.completedAt &&
              !isOnOrAfter(run.completedAt, ctx.instructionUpdatedAt)
            ? "Draft changed after last validation — re-run validation suite"
            : "Run the validation suite on the Validation tab",
    ),
  );

  // Step 1: reviewer/physician governance is deck-future — not activation blockers.

  const failed = checks.filter((c) => !c.passed);
  const allowed = failed.length === 0;

  return {
    allowed,
    blockReason: allowed ? null : failed[0]!.message,
    checks,
  };
}
