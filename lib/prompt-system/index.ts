/**
 * Prompt System governance — public exports for activation and permissions.
 */
export { canActivatePromptVersion } from "@/lib/activation/can-activate-prompt-version";
export type { CanActivatePromptVersionResult } from "@/lib/domain/prompt-activation";
export {
  type PromptVersionActivationContext,
  type ActivationCheckItem,
  REQUIRED_ADMIN_TEST_PASSES,
} from "@/lib/domain/prompt-activation";
export {
  getPromptSystemPermissions,
  hasPromptPermission,
  type PromptPermission,
  type PromptSystemPermissions,
} from "@/lib/auth/prompt-permissions";
export { isValidationStale } from "@/lib/prompt-system/stale-validation";
export {
  promptApiError,
  promptNotFound,
  handlePromptRouteError,
  type PromptApiErrorCode,
} from "@/lib/api/prompt-api-errors";
export { parsePromptIdParam, promptSummaryQuerySchema } from "@/lib/validation/prompt-api-common";
export {
  PROMPT_SYSTEM_QUERY_KEYS,
  readPromptSystemUrlState,
  mergePromptSystemParams,
  buildPromptSystemHref,
  type PromptSystemUrlState,
  type PromptSystemUrlPatch,
} from "@/lib/prompt-system/url-state";
