import { z } from "zod";

export const promptRollbackBodySchema = z.object({
  reason: z.string().trim().max(2000).optional(),
});
