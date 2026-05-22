import { z } from "zod";

export const promptIdParamSchema = z.string().cuid({ message: "Invalid prompt id" });

export const promptSummaryQuerySchema = z.object({
  status: z
    .enum(["all", "active", "in_review", "archived"])
    .optional()
    .default("all"),
});

export const promptListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["all", "active", "in_review", "archived"]).optional().default("all"),
  category: z.string().optional(),
  owner: z.string().optional(),
  model: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["version", "updated", "status"]).optional().default("version"),
  dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export function parsePromptIdParam(id: string):
  | { ok: true; id: string }
  | { ok: false; error: z.ZodError } {
  const parsed = promptIdParamSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: parsed.error };
  return { ok: true, id: parsed.data };
}
