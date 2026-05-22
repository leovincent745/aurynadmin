const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;
}
