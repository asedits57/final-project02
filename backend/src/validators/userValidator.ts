import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  username: z.string().trim().min(3).max(30).optional(),
  dept: z.string().trim().max(50).optional(),
  level: z.coerce.number().int().min(1).optional(),
});
