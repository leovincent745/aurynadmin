const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 30;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkTestChatRateLimit(adminUserId: string): boolean {
  const now = Date.now();
  const entry = attempts.get(adminUserId);

  if (!entry || now > entry.resetAt) {
    attempts.set(adminUserId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}
