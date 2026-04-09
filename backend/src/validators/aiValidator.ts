import { z } from "zod";

export const aiPromptSchema = z.object({
  prompt: z.string().trim().min(5).max(12000),
});
