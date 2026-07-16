import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  isVerified: z.boolean().optional(),
});

export const userFilterSchema = z.object({
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  isVerified: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
