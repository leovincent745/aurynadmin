const WINDOW_MS = 60_000;
const MAX_MUTATIONS_PER_WINDOW = 80;

const attempts = new Map<string, { count: number; resetAt: number }>();

/** Per-admin rate limit for mutating prompt APIs (create, save, validate, activate, etc.). */
export function checkPromptMutationRateLimit(adminUserId: string): boolean {
  const now = Date.now();
  const entry = attempts.get(adminUserId);

  if (!entry || now > entry.resetAt) {
    attempts.set(adminUserId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_MUTATIONS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}
