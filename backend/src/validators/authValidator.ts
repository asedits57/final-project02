import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(6),
  fullName: z.string().trim().optional(),
  username: z.string().trim().optional(),
  dept: z.string().trim().optional(),
});
