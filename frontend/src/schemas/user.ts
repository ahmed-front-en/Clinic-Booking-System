import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  isVerified: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
