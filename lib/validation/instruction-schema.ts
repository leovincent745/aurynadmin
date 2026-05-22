import { z } from "zod";

const instructionField = z
  .string()
  .trim()
  .min(10, "Must be at least 10 characters")
  .max(50_000, "Must be at most 50,000 characters");

export const instructionContentSchema = z.object({
  masterInstructions: instructionField,
  companyGuardrails: instructionField,
  productProtocolRules: instructionField,
});

export type InstructionContentInput = z.infer<typeof instructionContentSchema>;
