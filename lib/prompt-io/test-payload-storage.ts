export interface SavedTestPayload {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  savedAt: string;
}

const STORAGE_PREFIX = "auryn:prompt-test-payloads:";

function storageKey(instructionId: string): string {
  return `${STORAGE_PREFIX}${instructionId}`;
}

export function listSavedTestPayloads(instructionId: string): SavedTestPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(instructionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTestPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTestPayload(
  instructionId: string,
  name: string,
  payload: Record<string, unknown>,
): SavedTestPayload {
  const items = listSavedTestPayloads(instructionId);
  const entry: SavedTestPayload = {
    id: crypto.randomUUID(),
    name: name.trim() || `Sample ${items.length + 1}`,
    payload,
    savedAt: new Date().toISOString(),
  };
  items.unshift(entry);
  localStorage.setItem(storageKey(instructionId), JSON.stringify(items.slice(0, 20)));
  return entry;
}

export function deleteTestPayload(instructionId: string, id: string): void {
  const items = listSavedTestPayloads(instructionId).filter((p) => p.id !== id);
  localStorage.setItem(storageKey(instructionId), JSON.stringify(items));
}
