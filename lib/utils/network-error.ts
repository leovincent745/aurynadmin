/** Heuristic for failed fetch when the browser reports offline or network is unreachable. */
export function isLikelyNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return msg.includes("fetch") || msg.includes("network") || msg.includes("load failed");
  }
  return false;
}

export function networkErrorMessage(fallback: string): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You appear to be offline. Reconnect and try again.";
  }
  return fallback;
}
