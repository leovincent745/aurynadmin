import { z } from "zod";

export const promptValidateBodySchema = z.object({
  testInput: z.record(z.unknown()).optional(),
  testOutput: z.record(z.unknown()).optional(),
  cancelRunId: z.string().cuid().optional(),
  comment: z.string().trim().max(4000).optional(),
});

export const promptSubmitReviewBodySchema = z.object({
  action: z.enum(["submit", "approve", "reject"]),
  comment: z.string().trim().max(4000).optional(),
});

export const promptValidationCommentSchema = z.object({
  runId: z.string().cuid(),
  body: z.string().trim().min(1).max(4000),
});
