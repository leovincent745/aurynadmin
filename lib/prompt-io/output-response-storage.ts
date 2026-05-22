const STORAGE_PREFIX = "auryn:output-response:";

export function loadStoredOutputResponse(instructionId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${instructionId}`);
  } catch {
    return null;
  }
}

export function saveStoredOutputResponse(instructionId: string, jsonText: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${instructionId}`, jsonText);
  } catch {
    /* quota */
  }
}

export function clearStoredOutputResponse(instructionId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${instructionId}`);
  } catch {
    /* ignore */
  }
}
