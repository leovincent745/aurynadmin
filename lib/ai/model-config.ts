export function getChatModelLabel(): string {
  const raw = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  if (raw.startsWith("gpt-4o")) return "GPT-4o";
  if (raw.startsWith("gpt-4")) return "GPT-4.1";
  if (raw.startsWith("gpt-5")) return "GPT-5";
  return raw;
}

export function getChatModelConfig(): {
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  temperatureNote: string;
  maxTokensNote: string;
} {
  const model = getChatModelLabel();
  const temperature = Number(process.env.OPENAI_TEMPERATURE ?? "0.4");
  const maxRaw = process.env.OPENAI_MAX_TOKENS;

  const temperatureValue = Number.isFinite(temperature) ? temperature : 0.4;
  const maxTokens = maxRaw ? Number.parseInt(maxRaw, 10) : null;

  return {
    model,
    temperature: temperatureValue,
    maxTokens: maxTokens != null && !Number.isNaN(maxTokens) ? maxTokens : null,
    temperatureNote: "Applied in lib/ai/openai.ts for chat completions",
    maxTokensNote: maxTokens
      ? "From OPENAI_MAX_TOKENS"
      : "Not set — provider default applies",
  };
}
