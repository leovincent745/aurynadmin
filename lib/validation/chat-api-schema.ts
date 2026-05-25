import { z } from "zod";

/**
 * Public POST /api/chat — user message only. Instructions are loaded server-side
 * from the active published row (never from the client).
 */
export const publicChatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(8_000),
    conversationId: z.string().cuid().optional(),
    userId: z.string().cuid().optional(),
    anonymousSessionId: z.string().min(1).max(128).optional(),
  })
  .strict();

export type PublicChatRequest = z.infer<typeof publicChatRequestSchema>;
