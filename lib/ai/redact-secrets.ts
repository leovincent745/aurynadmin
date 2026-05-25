/** Redact sensitive values before persisting or displaying AI log summaries. */

const SECRET_PATTERNS: RegExp[] = [
  /\bsk-[a-zA-Z0-9]{8,}\b/g,
  /\bsk-proj-[a-zA-Z0-9_-]{8,}\b/g,
  /\bBearer\s+[a-zA-Z0-9._-]+\b/gi,
  /\bOPENAI_API_KEY[=:]\s*\S+/gi,
  /\bDATABASE_URL[=:]\s*\S+/gi,
  /\bSESSION_SECRET[=:]\s*\S+/gi,
  /\bNEXTAUTH_SECRET[=:]\s*\S+/gi,
  /\bprocess\.env\.[A-Z0-9_]+\s*=\s*['"][^'"]+['"]/gi,
  /\b[A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|API_KEY)[A-Z0-9_]*[=:]\s*\S+/gi,
  /postgres(?:ql)?:\/\/[^\s'"]+/gi,
  /mysql:\/\/[^\s'"]+/gi,
  /mongodb(?:\+srv)?:\/\/[^\s'"]+/gi,
];

export function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, "[redacted]");
  }
  return result;
}

function stripStackTraces(text: string): string {
  const lines = text.split("\n");
  const kept = lines.filter((line) => !/^\s*at\s+/.test(line) && !/\.js:\d+:\d+/.test(line));
  return kept.join("\n").trim();
}

export function sanitizeErrorSummary(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let text = raw.trim();
  if (!text) return null;

  text = redactSecrets(text);
  if (process.env.NODE_ENV === "production") {
    text = stripStackTraces(text);
  }

  const maxLen = process.env.NODE_ENV === "production" ? 500 : 2000;
  if (text.length > maxLen) {
    text = `${text.slice(0, maxLen)}…`;
  }
  return text;
}
