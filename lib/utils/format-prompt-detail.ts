const EMPTY = "—";

export function formatPromptDetailDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return EMPTY;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatPromptTemperature(value: number | null): string {
  if (value == null || Number.isNaN(value)) return EMPTY;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatPromptMaxTokens(value: number | null): string {
  if (value == null || Number.isNaN(value)) return EMPTY;
  return value.toLocaleString();
}

export function formatPromptVersion(versionNumber: number): string {
  return `v${versionNumber}`;
}

export function formatPromptDetailText(value: string | null | undefined): string {
  const t = value?.trim();
  return t ? t : EMPTY;
}
