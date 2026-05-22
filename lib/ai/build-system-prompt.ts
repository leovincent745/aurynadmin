import type { InstructionContent } from "@/lib/domain/admin-instructions";

export function buildChatSystemPrompt(content: InstructionContent): string {
  return `[Master Instructions]
${content.masterInstructions.trim()}

[Company Guardrails]
${content.companyGuardrails.trim()}

[Product / Protocol Rules]
${content.productProtocolRules.trim()}`;
}
